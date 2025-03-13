'use server';

import { eq } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import db from "@/server/db";
import { orders, orderItems, addresses, products, productVariations } from "@/server/schema";

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
  createdAt: string;
  completedAt: string | null;
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
        // Initialize new order
        orderMap.set(row.order.id, {
          id: row.order.id,
          status: row.order.status,
          subtotalAmount: row.order.subtotalAmount,
          discountAmount: row.order.discountAmount,
          shippingAmount: row.order.shippingAmount,
          totalAmount: row.order.totalAmount,
          currency: row.order.currency,
          paymentMethod: row.order.paymentMethod,
          paymentStatus: row.order.paymentStatus,
          shippingMethod: row.order.shippingMethod,
          notes: row.order.notes,
          createdAt: row.order.createdAt,
          completedAt: row.order.completedAt,
          addresses: [],
          items: [],
        });
      }

      const order = orderMap.get(row.order.id)!;

      // Add address if not already added
      if (row.address && !order.addresses.find(addr => 
        addr.addressType === row.address!.addressType && 
        addr.email === row.address!.email
      )) {
        order.addresses.push({
          addressType: row.address.addressType,
          firstName: row.address.firstName,
          lastName: row.address.lastName,
          email: row.address.email,
          phone: row.address.phone,
          streetAddress: row.address.streetAddress,
          city: row.address.city,
          state: row.address.state,
          zipCode: row.address.zipCode,
          country: row.address.country,
        });
      }

      // Add item if not already added
      if (row.item && row.product && !order.items.find(item => item.id === row.item!.id)) {
        order.items.push({
          id: row.item.id,
          quantity: row.item.quantity,
          unitAmount: row.item.unitAmount,
          discountPercentage: row.item.discountPercentage,
          finalAmount: row.item.finalAmount,
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