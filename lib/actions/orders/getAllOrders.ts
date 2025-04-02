"use server";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import db from "@/server/db";
import { orders, orderItems, addresses, products, productVariations } from "@/server/schema";

// Define a type for product attributes
type ProductAttribute = string | number | boolean | null;

export interface OrderWithDetails {
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
  createdAt: number;
  completedAt: number | null;
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
    variation?: {
      sku: string;
    };
  }>;
}

async function fetchOrders(): Promise<OrderWithDetails[]> {
  try {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(addresses, eq(addresses.orderId, orders.id))
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .leftJoin(productVariations, eq(productVariations.id, orderItems.productVariationId))
      .orderBy(orders.createdAt)
      .all();

    // Process results into a map of orders
    const orderMap = new Map<number, OrderWithDetails>();

    for (const row of results) {
      if (!row.orders) continue;

      // Initialize order if not exists
      if (!orderMap.has(row.orders.id)) {
        orderMap.set(row.orders.id, {
          id: row.orders.id,
          status: row.orders.status,
          subtotalAmount: row.orders.subtotalAmount,
          discountAmount: row.orders.discountAmount,
          shippingAmount: row.orders.shippingAmount,
          totalAmount: row.orders.totalAmount,
          currency: row.orders.currency,
          paymentMethod: row.orders.paymentMethod,
          paymentStatus: row.orders.paymentStatus,
          shippingMethod: row.orders.shippingMethod,
          notes: row.orders.notes,
          createdAt: row.orders.createdAt instanceof Date 
            ? Math.floor(row.orders.createdAt.getTime() / 1000)
            : row.orders.createdAt,
          completedAt: row.orders.completedAt 
            ? (row.orders.completedAt instanceof Date 
                ? Math.floor(row.orders.completedAt.getTime() / 1000)
                : row.orders.completedAt)
            : null,
          addresses: [],
          items: [],
        });
      }

      const order = orderMap.get(row.orders.id)!;

      // Add address if not already added
      if (row.addresses && !order.addresses.some(addr => 
        addr.addressType === row.addresses!.addressType && 
        addr.email === row.addresses!.email
      )) {
        order.addresses.push({
          addressType: row.addresses.addressType,
          firstName: row.addresses.firstName,
          lastName: row.addresses.lastName,
          email: row.addresses.email,
          phone: row.addresses.phone,
          streetAddress: row.addresses.streetAddress,
          city: row.addresses.city,
          state: row.addresses.state,
          zipCode: row.addresses.zipCode,
          country: row.addresses.country,
        });
      }

      // Add item if not already added and has required data
      if (row.order_items && row.products && !order.items.some(item => item.id === row.order_items!.id)) {
        order.items.push({
          id: row.order_items.id,
          quantity: row.order_items.quantity,
          unitAmount: row.order_items.unitAmount,
          discountPercentage: row.order_items.discountPercentage,
          finalAmount: row.order_items.finalAmount,
          attributes: row.order_items.attributes ? JSON.parse(row.order_items.attributes) : {},
          product: {
            name: row.products.name,
            slug: row.products.slug,
            images: row.products.images,
          },
          ...(row.product_variations && {
            variation: {
              sku: row.product_variations.sku,
            },
          }),
        });
      }
    }

    return Array.from(orderMap.values());
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error(`Failed to fetch orders: ${(error as Error).message}`);
  }
}

/**
 * Get all orders with their details
 * @param revalidate - Cache revalidation time in seconds (default: 60)
 * @returns Array of orders with their details
 */
export default async function getAllOrders(revalidate: number = 60): Promise<OrderWithDetails[]> {
  return unstable_cache(
    async () => fetchOrders(),
    ["all-orders"],
    {
      revalidate,
      tags: ["orders"],
    }
  )();
} 