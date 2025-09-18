import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { db } from "~/db"
import { orders, orderItems, addresses } from "~/schema"
import { validateStock, validateVariation } from "~/utils/validateStock"
import { ProductWithVariations } from "~/types"

// TypeScript interfaces
interface CartItem {
  productId: number;
  productName: string;
  productSlug: string;
  variationId?: number;
  quantity: number;
  price: number;
  maxStock: number;
  unlimitedStock: boolean;
  discount?: number | null;
  image?: string;
  attributes?: Record<string, string>;
  weightInfo?: {
    totalWeight: number;
  };
}

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

interface OrderCreationRequest {
  customerInfo: CustomerInfo;
  cartItems: CartItem[];
  products: ProductWithVariations[];
}



// Order creation function
async function createOrder(customerInfo: CustomerInfo, cartItems: CartItem[], products: ProductWithVariations[]) {
  // Create a map for O(1) lookups
  const productMap = new Map(products.map(p => [p.id, p]));
  
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

    // 4. Validate stock
    const stockValidation = validateStock(
      products,
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
        attributes: JSON.stringify(
          item.attributes && typeof item.attributes === 'object' 
            ? item.attributes 
            : {}
        ),
        createdAt: now,
      }))
    );

  return { order, orderAmounts, totalAmount };
}

// TODO: Email sending will be implemented separately using TanStack server functions or a separate API route

export const APIRoute = createAPIFileRoute('/api/orderCreation')({
  POST: async ({ request }) => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
      // Parse the request body
      const body: OrderCreationRequest = await request.json()
      
      // Validate required fields
      if (!body.customerInfo?.shippingAddress?.email || 
          !body.customerInfo?.shippingAddress?.firstName || 
          !body.customerInfo?.shippingAddress?.lastName) {
        return json(
          { success: false, error: 'Missing required customer information' },
          { status: 400, headers: corsHeaders }
        )
      }

      if (!body.cartItems || body.cartItems.length === 0) {
        return json(
          { success: false, error: 'Cart is empty' },
          { status: 400, headers: corsHeaders }
        )
      }

      if (!body.products || body.products.length === 0) {
        return json(
          { success: false, error: 'Product data is required' },
          { status: 400, headers: corsHeaders }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.customerInfo.shippingAddress.email)) {
        return json(
          { success: false, error: 'Invalid email format' },
          { status: 400, headers: corsHeaders }
        )
      }

      // === ORDER CREATION LOGIC ===
      const { customerInfo, cartItems, products } = body;

      // Step 1: Create the order
      const { order, orderAmounts, totalAmount } = await createOrder(customerInfo, cartItems, products);

      // Small delay to ensure database transaction is fully committed
      // This helps prevent race conditions when fetching the order immediately after creation
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay for Cloudflare Workers

      return json({
        success: true,
        message: 'Order created successfully',
        orderId: order.id,
      }, { headers: corsHeaders });

    } catch (error) {
      console.error('Order creation API error:', error);
      
      // Provide specific error messaging
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.message.includes("Variation not found")) {
          errorMessage = "Some items in your cart are no longer available with the selected options. Please refresh the page and update your cart.";
        } else if (error.message.includes("Email service configuration error")) {
          errorMessage = "Order was created but email notifications failed. Our team will contact you shortly.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return json(
        { 
          success: false, 
          error: errorMessage
        },
        { status: 500, headers: corsHeaders }
      );
    }
  },

  OPTIONS: async () => {
    // Handle preflight requests
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  },
})
