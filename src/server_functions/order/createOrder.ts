import {db} from "~/db";
import { orders, orderItems, addresses } from "~/schema";
import { CartItem } from "~/lib/cartContext";
import { validateStock, validateVariation } from "~/utils/validateStock";
import { ProductWithVariations } from "~/types";

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface CustomerInfo {
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  shippingMethod?: string;
}

interface CreateOrderResult {
  success: boolean;
  message: string;
  orderId?: number;
}

export async function createOrder(
  customerInfo: CustomerInfo, 
  cartItems: CartItem[],
  clientProducts: ProductWithVariations[]
): Promise<CreateOrderResult> {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Create a map for O(1) lookups
    const productMap = new Map(clientProducts.map(p => [p.id, p]));
    
    // Validate all items in one pass
    const orderAmounts = cartItems.reduce((acc, item) => {
      // 1. Validate product exists
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productName}`);
      }

      // 2. Validate variation and price
      const variationValidation = validateVariation(product, item.variationId);
      if (!variationValidation.isValid) {
        throw new Error(variationValidation.error || `Invalid variation for product: ${item.productName}`);
      }

      // 3. Validate price
      const expectedPrice = product.hasVariations && item.variationId
        ? product.variations?.find(v => v.id === item.variationId)?.price
        : product.price;

      if (expectedPrice !== item.price) {
        throw new Error(`Price mismatch for ${item.productName}: Expected ${expectedPrice}, got ${item.price}`);
      }

      // 4. Validate stock, treating each item as an existing cart item since we're validating the final order
      const stockValidation = validateStock(
        clientProducts,
        cartItems,
        item.productId,
        item.quantity,
        item.variationId,
        true // This item is already in the cart
      );

      if (!stockValidation.isAvailable && !stockValidation.unlimitedStock) {
        throw new Error(stockValidation.error || 
          `Insufficient stock for ${item.productName}. Available: ${stockValidation.availableStock}, Requested: ${item.quantity}`
        );
      }

      // 5. Calculate amounts
      if (item.price < 0 || item.quantity <= 0) {
        throw new Error(`Invalid price or quantity for ${item.productName}`);
      }

      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = item.discount && item.discount > 0 && item.discount <= 100
        ? itemSubtotal * (item.discount / 100)
        : 0;

      return {
        subtotalAmount: acc.subtotalAmount + itemSubtotal,
        discountAmount: acc.discountAmount + itemDiscount
      };
    }, { subtotalAmount: 0, discountAmount: 0 });

    const shippingAmount = 0; // Will be determined later
    const totalAmount = orderAmounts.subtotalAmount - orderAmounts.discountAmount + shippingAmount;

    if (totalAmount < 0) {
      throw new Error(`Invalid total amount: ${totalAmount}`);
    }

    const now = new Date();

    // Create order
    const [order] = await db.insert(orders)
      .values({
        subtotalAmount: orderAmounts.subtotalAmount,
        discountAmount: orderAmounts.discountAmount,
        shippingAmount,
        totalAmount,
        currency: "CAD",
        paymentStatus: "pending",
        paymentMethod: null,
        shippingMethod: customerInfo.shippingMethod ?? null,
        notes: customerInfo.notes ?? null,
        createdAt: now,
        completedAt: null,
      })
      .returning();

    // Create addresses
    await db.insert(addresses)
      .values({
        orderId: order.id,
        addressType: customerInfo.billingAddress ? "shipping" : "both",
        ...customerInfo.shippingAddress,
        createdAt: now,
      });

    if (customerInfo.billingAddress) {
      await db.insert(addresses)
        .values({
          orderId: order.id,
          addressType: "billing",
          ...customerInfo.billingAddress,
          createdAt: now,
        });
    }

    // Create order items
    await db.insert(orderItems)
      .values(
        cartItems.map(item => ({
          orderId: order.id,
          productId: item.productId,
          productVariationId: item.variationId ?? null,
          quantity: item.quantity,
          unitAmount: item.price,
          discountPercentage: item.discount ?? null,
          finalAmount: item.discount 
            ? item.price * (1 - item.discount / 100) * item.quantity
            : item.price * item.quantity,
          attributes: JSON.stringify(item.attributes || {}),
          createdAt: now,
        }))
      );

    return { 
      success: true, 
      message: "Order created successfully",
      orderId: order.id 
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: `Failed to create order: ${(error as Error).message}`,
    };
  }
} 