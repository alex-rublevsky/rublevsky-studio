'use server';

import { desc } from "drizzle-orm";
import db from "@/server/db";
import { products, productTeaCategories, teaCategories } from "@/server/schema";
import { Product } from "@/types";
import { eq } from "drizzle-orm";

interface QueryResult {
  product: Product;
  teaCategorySlug: string | null;
}

/**
 * Server action to fetch all products for the admin panel
 * Fetches products and their tea categories in a single query
 * Unlike getAllProducts, this:
 * - Returns all products (not just active ones)
 * - Doesn't include variations or blog posts
 * - Doesn't implement caching (admin needs real-time data)
 * @returns Array of product objects with their tea categories
 */
export default async function getAdminProducts(): Promise<Product[]> {
  try {
    // Execute a single query to get all products and their tea categories
    const result = await db
      .select({
        product: products,
        teaCategorySlug: teaCategories.slug
      })
      .from(products)
      .leftJoin(
        productTeaCategories,
        eq(productTeaCategories.productId, products.id)
      )
      .leftJoin(
        teaCategories,
        eq(teaCategories.slug, productTeaCategories.teaCategorySlug)
      )
      .orderBy(desc(products.createdAt))
      .all() as QueryResult[];

    // Process the results to group tea categories by product
    const productMap = new Map<number, Product & { teaCategories: string[] }>();

    result.forEach((row: QueryResult) => {
      if (!productMap.has(row.product.id)) {
        productMap.set(row.product.id, {
          ...row.product,
          teaCategories: []
        });
      }

      const product = productMap.get(row.product.id)!;
      
      // Add tea category if it exists and isn't already in the array
      if (row.teaCategorySlug && !product.teaCategories.includes(row.teaCategorySlug)) {
        product.teaCategories.push(row.teaCategorySlug);
      }
    });

    // Convert map to array and return products sorted by creation date
    return Array.from(productMap.values());
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
} 