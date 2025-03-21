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
    const products = await getAllProducts();
    
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

    // Create order
    const order = await db.insert(orders).values({
      status: "pending",
      subtotalAmount: subtotalAmount,
      discountAmount: discountAmount,
      shippingAmount: shippingAmount,
      totalAmount: totalAmount,
      currency: "CAD",
      paymentStatus: "pending",
      paymentMethod: null,
      shippingMethod: customerInfo.shippingMethod,
      notes: customerInfo.notes,
      createdAt: Math.floor(Date.now() / 1000),
      completedAt: null,
    }).returning();

    // Create shipping address
    await db.insert(addresses).values({
      orderId: order[0].id,
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
      createdAt: Math.floor(Date.now() / 1000),
    });

    // Create billing address if different from shipping
    if (customerInfo.billingAddress) {
      await db.insert(addresses).values({
        orderId: order[0].id,
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
        createdAt: Math.floor(Date.now() / 1000),
      });
    }

    // Create order items
    await db.insert(orderItems).values(
      cartItems.map(item => ({
        orderId: order[0].id,
        productId: item.productId,
        productVariationId: item.variationId,
        quantity: item.quantity,
        unitAmount: item.price,
        discountPercentage: item.discount,
        finalAmount: item.discount 
          ? item.price * (1 - item.discount / 100) * item.quantity
          : item.price * item.quantity,
        attributes: JSON.stringify(item.attributes || {}),
        createdAt: Math.floor(Date.now() / 1000),
      }))
    );

    return { 
      success: true, 
      message: 'Order created successfully',
      orderId: order[0].id 
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: `Failed to create order: ${(error as Error).message}`
    };
  }
} 