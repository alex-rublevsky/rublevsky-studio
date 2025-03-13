'use server';

import { eq } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import db from "@/server/db";
import { orders, orderItems, addresses, products, productVariations } from "@/server/schema";

export interface OrderWithDetails {
  id: number;
  subtotal: number | null;
  totalDiscount: number | null;
  grandTotal: number | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  status: string;
  currency: string | null;
  shippingAmount: number | null;
  shippingMethod: string | null;
  notes: string | null;
  createdAt: string | null;
  address: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    streetAddress: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
  };
  items: Array<{
    id: number;
    quantity: number;
    unitAmount: number | null;
    discount: number | null;
    attributes: Record<string, any>;
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
    const result = await db
      .select({
        order: orders,
        address: addresses,
        item: orderItems,
        product: products,
        variation: productVariations,
      })
      .from(orders)
      .leftJoin(addresses, eq(addresses.orderId, orders.id))
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .leftJoin(productVariations, eq(productVariations.id, orderItems.productVariationId))
      .orderBy(orders.createdAt)
      .all();

    // Process the results to group items by order
    const orderMap = new Map<number, OrderWithDetails>();

    result.forEach((row: {
      order: typeof orders.$inferSelect;
      address: typeof addresses.$inferSelect | null;
      item: typeof orderItems.$inferSelect | null;
      product: typeof products.$inferSelect | null;
      variation: typeof productVariations.$inferSelect | null;
    }) => {
      if (!orderMap.has(row.order.id)) {
        orderMap.set(row.order.id, {
          ...row.order,
          address: {
            firstName: row.address?.firstName ?? null,
            lastName: row.address?.lastName ?? null,
            email: row.address?.email ?? null,
            phone: row.address?.phone ?? null,
            streetAddress: row.address?.streetAddress ?? null,
            city: row.address?.city ?? null,
            state: row.address?.state ?? null,
            zipCode: row.address?.zipCode ?? null,
            country: row.address?.country ?? null,
          },
          items: [],
        });
      }

      const order = orderMap.get(row.order.id)!;

      if (row.item && row.product && !order.items.find(item => item.id === row.item!.id)) {
        order.items.push({
          id: row.item.id,
          quantity: row.item.quantity,
          unitAmount: row.item.unitAmount,
          discount: row.item.discount,
          attributes: row.item.attributes ? JSON.parse(row.item.attributes) : {},
          product: {
            name: row.product.name,
            slug: row.product.slug,
            images: row.product.images,
          },
          ...(row.variation && {
            variation: {
              sku: row.variation.sku,
            },
          }),
        });
      }
    });

    return Array.from(orderMap.values());
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error(`Failed to fetch orders: ${(error as Error).message}`);
  }
}

// Cached version of getAllOrders
export default async function getAllOrders(): Promise<OrderWithDetails[]> {
  return unstable_cache(
    async () => fetchOrders(),
    ['all-orders'],
    {
      revalidate: 60, // Revalidate every minute
      tags: ['orders'] // Tag for cache invalidation
    }
  )();
} 