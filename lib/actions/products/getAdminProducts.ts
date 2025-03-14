'use server';

import db from "@/server/db";
import { products, productTeaCategories } from "@/server/schema";
import { Product } from "@/types";
import { eq } from "drizzle-orm";

interface TeaCategoryResult {
  teaCategorySlug: string;
}

/**
 * Server action to fetch all products for the admin panel
 * @returns Array of product objects
 */
export default async function getAdminProducts(): Promise<Product[]> {
  try {
    // Get all products
    const allProducts = await db.select().from(products).all();
    
    // Get tea categories for each product
    for (const product of allProducts) {
      const teaCategories = await db
        .select({
          teaCategorySlug: productTeaCategories.teaCategorySlug
        })
        .from(productTeaCategories)
        .where(eq(productTeaCategories.productId, product.id))
        .all();
      
      product.teaCategories = teaCategories.map((tc: TeaCategoryResult) => tc.teaCategorySlug);
    }
    
    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
} 