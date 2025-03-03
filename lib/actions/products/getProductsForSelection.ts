'use server';

import { desc } from "drizzle-orm";
import db from "@/server/db";
import { products } from "@/server/schema";

/**
 * Server action to fetch products for selection in forms
 * @returns Array of simplified product objects with id, name, and slug
 */
export default async function getProductsForSelection() {
  try {
    // Get all active products with only the needed fields
    const productsList = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        images: products.images
      })
      .from(products)
      .where(products.isActive)
      .orderBy(desc(products.createdAt))
      .all();
    
    return productsList;
  } catch (error) {
    console.error("Error fetching products for selection:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
} 