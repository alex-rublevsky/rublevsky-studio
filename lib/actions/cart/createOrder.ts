'use server';

import db from "@/server/db";
import { orders, orderItems, addresses } from "@/server/schema";
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
      status: "pending",
      subtotal: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      total_discount: cartItems.reduce((sum, item) => {
        if (item.discount) {
          return sum + (item.price * item.quantity * (item.discount / 100));
        }
        return sum;
      }, 0),
      grand_total: cartItems.reduce((sum, item) => {
        const itemPrice = item.discount 
          ? item.price * (1 - item.discount / 100)
          : item.price;
        return sum + itemPrice * item.quantity;
      }, 0),
      currency: "CAD",
      created_at: new Date().toISOString(),
    }).returning();

    // Create address record
    await db.insert(addresses).values({
      order_id: order[0].id,
      first_name: customerInfo.firstName,
      last_name: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      street_address: customerInfo.streetAddress,
      city: customerInfo.city,
      state: customerInfo.state,
      country: customerInfo.country,
      zip_code: customerInfo.zipCode,
      created_at: new Date().toISOString(),
    });

    // Create order items
    await db.insert(orderItems).values(
      cartItems.map(item => ({
        order_id: order[0].id,
        product_id: item.productId,
        product_variation_id: item.variationId,
        quantity: item.quantity,
        unit_amount: item.price,
        discount: item.discount,
        attributes: JSON.stringify(item.attributes || {}),
        created_at: new Date().toISOString(),
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