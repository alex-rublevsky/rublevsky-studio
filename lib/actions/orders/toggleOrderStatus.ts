'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { orders } from "@/server/schema";
import { revalidateTag } from "next/cache";

export default async function toggleOrderStatus(orderId: number): Promise<{ success: boolean; message: string }> {
  try {
    // Get current order status
    const [currentOrder] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .all();

    if (!currentOrder) {
      throw new Error('Order not found');
    }

    // Toggle status between 'pending' and 'processed'
    const newStatus = currentOrder.status === 'pending' ? 'processed' : 'pending';

    // Update order status and completedAt
    await db
      .update(orders)
      .set({ 
        status: newStatus,
        completedAt: newStatus === 'processed' ? Math.floor(Date.now() / 1000) : null 
      })
      .where(eq(orders.id, orderId));

    // Revalidate cache
    revalidateTag('orders');

    return {
      success: true,
      message: `Order status updated to ${newStatus}`
    };
  } catch (error) {
    console.error("Error toggling order status:", error);
    return {
      success: false,
      message: `Failed to update order status: ${(error as Error).message}`
    };
  }
} 