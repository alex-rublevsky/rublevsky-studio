'use server';

import db from "@/server/db";
import { orders, orderItems, addresses } from "@/server/schema";
import { CartItem } from "@/lib/context/CartContext";
import { eq } from "drizzle-orm";
import { validateStock, type StockValidationResult } from "@/lib/utils/validateStock";
import getAllProducts from "../products/getAllProducts";

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

export async function createOrder(customerInfo: CustomerInfo, cartItems: CartItem[]): Promise<CreateOrderResult> {
  try {
    // Validate stock for all items before creating order
    const { products } = await getAllProducts();
    
    // Check stock availability for all items
    for (const item of cartItems) {
      const result = validateStock(
        products,
        [item], // Only pass the current item instead of all cart items
        item.productId,
        item.quantity,
        item.variationId
      );

      if (!result.isAvailable && !result.unlimitedStock) {
        const product = products.find(p => p.id === item.productId);
        throw new Error(`Insufficient stock for product: ${item.productName}. Available: ${result.availableStock}, Requested: ${item.quantity}`);
      }
    }

    // Calculate order amounts
    const subtotalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = cartItems.reduce((sum, item) => {
      if (item.discount) {
        return sum + (item.price * item.quantity * (item.discount / 100));
      }
      return sum;
    }, 0);
    const shippingAmount = 0; // Will be determined later
    const totalAmount = subtotalAmount - discountAmount + shippingAmount;

    const now = new Date();

    // Create order first
    const [order] = await db.insert(orders)
      .values({
        subtotalAmount,
        discountAmount,
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

    // Create addresses and order items in parallel
    await Promise.all([
      // Create shipping address
      db.insert(addresses)
        .values({
          orderId: order.id,
          addressType: customerInfo.billingAddress ? 'shipping' : 'both',
          firstName: customerInfo.shippingAddress.firstName,
          lastName: customerInfo.shippingAddress.lastName,
          email: customerInfo.shippingAddress.email,
          phone: customerInfo.shippingAddress.phone,
          streetAddress: customerInfo.shippingAddress.streetAddress,
          city: customerInfo.shippingAddress.city,
          state: customerInfo.shippingAddress.state,
          zipCode: customerInfo.shippingAddress.zipCode,
          country: customerInfo.shippingAddress.country,
          createdAt: now,
        }),

      // Create billing address if different from shipping
      customerInfo.billingAddress
        ? db.insert(addresses)
            .values({
              orderId: order.id,
              addressType: 'billing',
              firstName: customerInfo.billingAddress.firstName,
              lastName: customerInfo.billingAddress.lastName,
              email: customerInfo.billingAddress.email,
              phone: customerInfo.billingAddress.phone,
              streetAddress: customerInfo.billingAddress.streetAddress,
              city: customerInfo.billingAddress.city,
              state: customerInfo.billingAddress.state,
              zipCode: customerInfo.billingAddress.zipCode,
              country: customerInfo.billingAddress.country,
              createdAt: now,
            })
        : Promise.resolve(),

      // Create order items
      db.insert(orderItems)
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
        )
    ]);

    return { 
      success: true, 
      message: 'Order created successfully',
      orderId: order.id 
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: `Failed to create order: ${(error as Error).message}`
    };
  }
} 