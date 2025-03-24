'use server';

import { desc } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import db from "@/server/db";
import { products } from "@/server/schema";

interface ProductForSelection {
  id: number;
  name: string;
  slug: string;
  images: string | null;
}

/**
 * Server action to fetch products for selection in forms
 * Used in ProductSelector component for admin interfaces
 * Implements caching with short revalidation time since it's used in admin
 * @returns Array of simplified product objects with id, name, and slug
 */
async function fetchProductsForSelection(): Promise<ProductForSelection[]> {
  try {
    return await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .all();
  } catch (error) {
    console.error("Error fetching products for selection:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
}

// Export cached version
export default async function getProductsForSelection(): Promise<ProductForSelection[]> {
  return unstable_cache(
    async () => fetchProductsForSelection(),
    ['products-for-selection'],
    {
      revalidate: 60, // Cache for 1 minute since it's used in admin
      tags: ['products'] // Invalidate when products change
    }
  )();
} 