"use server";

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { orders } from "@/server/schema";
import { revalidateTag } from "next/cache";

export default async function toggleOrderStatus(orderId: number): Promise<{ success: boolean; message: string }> {
  try {
    // Get current order status
    const currentOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    // Toggle status and update
    const newStatus = currentOrder.status === "pending" ? "processed" : "pending";
    await db
      .update(orders)
      .set({
        status: newStatus,
        completedAt: newStatus === "processed" ? new Date() : null,
      })
      .where(eq(orders.id, orderId));

    // Revalidate cache
    revalidateTag("orders");

    return {
      success: true,
      message: `Order status updated to ${newStatus}`,
    };
  } catch (error) {
    throw new Error(`Failed to update order status: ${(error as Error).message}`);
  }
} 