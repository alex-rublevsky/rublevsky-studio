'use server';

import db from "@/server/db";
import { orders, orderItems } from "@/server/schema";
import { CartItem } from "@/lib/context/CartContext";
import { eq } from "drizzle-orm";
import { validateStock, type StockValidationResult } from "./validateStock";

interface CreateOrderResult {
  success: boolean;
  message: string;
  orderId?: number;
}

export async function createOrder(cartItems: CartItem[]): Promise<CreateOrderResult> {
  try {
    // First validate all items are still in stock
    for (const item of cartItems) {
      const stockResult = await validateStock(
        item.productId,
        item.quantity,
        item.variationId
      );
      
      if (!stockResult.isAvailable) {
        return {
          success: false,
          message: `${item.productName} is no longer available in the requested quantity. Available: ${stockResult.availableStock}`,
        };
      }
    }
    
    // Calculate total amount
    const grandTotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    // Create the order
    const order = await db
      .insert(orders)
      .values({
        grandTotal,
        status: 'new',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: orders.id })
      .get();
    
    // Create order items
    for (const item of cartItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        productVariationId: item.variationId,
        quantity: item.quantity,
        unitAmount: item.price,
        totalAmount: item.price * item.quantity,
        attributes: item.attributes ? JSON.stringify(item.attributes) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    return {
      success: true,
      message: 'Order created successfully',
      orderId: order.id,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: `Failed to create order: ${(error as Error).message}`,
    };
  }
} 