'use server';

import db from "@/server/db";
import { orders, orderItems, addresses } from "@/server/schema";
import { CartItem } from "@/lib/context/CartContext";
import { eq } from "drizzle-orm";
import { validateStock, type StockValidationResult } from "./validateStock";

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

export async function createOrder(
  cartItems: CartItem[],
  customerInfo?: CustomerInfo
): Promise<CreateOrderResult> {
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
    
    // Save customer information if provided
    if (customerInfo) {
      await db.insert(addresses).values({
        orderId: order.id,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        streetAddress: customerInfo.streetAddress,
        city: customerInfo.city,
        state: customerInfo.state,
        country: customerInfo.country,
        zipCode: customerInfo.zipCode,
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