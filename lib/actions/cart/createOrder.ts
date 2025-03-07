'use server';

import db from "@/server/db";
import { orders, orderItems } from "@/server/schema";
import { CartItem } from "@/lib/context/CartContext";
import { eq } from "drizzle-orm";
import { validateStock, type StockValidationResult } from "@/lib/utils/validateStock";
import getAllProducts from "../products/getAllProducts";

interface CustomerInfo {
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
        cartItems,
        item.productId,
        item.quantity,
        item.variationId
      );

      if (!result.isAvailable && !result.unlimitedStock) {
        throw new Error(`Insufficient stock for product: ${item.productName}`);
      }
    }

    // Create order
    const order = await db.insert(orders).values({
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      streetAddress: customerInfo.streetAddress,
      city: customerInfo.city,
      state: customerInfo.state,
      country: customerInfo.country,
      zipCode: customerInfo.zipCode,
      status: "pending",
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }).returning();

    // Create order items
    await db.insert(orderItems).values(
      cartItems.map(item => ({
        orderId: order[0].id,
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        price: item.price,
        attributes: item.attributes || {},
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