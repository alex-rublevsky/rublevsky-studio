"use server";

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { orders, orderItems, addresses, products } from "@/server/schema";
import { unstable_cache } from "next/cache";

// Define a type for product attributes
type ProductAttribute = string | number | boolean | null;

export interface OrderDetails {
  id: number;
  status: string;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string | null;
  paymentStatus: string;
  shippingMethod: string | null;
  notes: string | null;
  createdAt: Date;
  completedAt: Date | null;
  addresses: Array<{
    addressType: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string | null;
    zipCode: string;
    country: string;
  }>;
  items: Array<{
    id: number;
    quantity: number;
    unitAmount: number;
    discountPercentage: number | null;
    finalAmount: number;
    attributes: Record<string, ProductAttribute>;
    product: {
      name: string;
      slug: string;
      images: string | null;
    };
  }>;
}

async function fetchOrderById(id: number): Promise<OrderDetails | null> {
  try {
    // Get the base order
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .get();

    if (!order) {
      return null;
    }

    // Get addresses for the order
    const orderAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.orderId, id))
      .all();

    // Get order items with their products
    const results = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, id))
      .all();

    return {
      ...order,
      addresses: orderAddresses,
      items: results.map(row => ({
        id: row.order_items.id,
        quantity: row.order_items.quantity,
        unitAmount: row.order_items.unitAmount,
        discountPercentage: row.order_items.discountPercentage,
        finalAmount: row.order_items.finalAmount,
        attributes: row.order_items.attributes ? JSON.parse(row.order_items.attributes) : {},
        product: row.products ? {
          name: row.products.name,
          slug: row.products.slug,
          images: row.products.images,
        } : {
          name: "Product Not Found",
          slug: "",
          images: null,
        },
      }))
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error(`Failed to fetch order: ${(error as Error).message}`);
  }
}

export default async function getOrderById(id: number): Promise<OrderDetails | null> {
  return unstable_cache(
    () => fetchOrderById(id),
    ["order", id.toString()],
    {
      revalidate: 60, // Cache for 1 minute
      tags: ["orders", "order-${id}"],
    }
  )();
}
