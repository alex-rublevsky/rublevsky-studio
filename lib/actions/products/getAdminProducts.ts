"use server";

import { desc } from "drizzle-orm";
import db from "@/server/db";
import { products } from "@/server/schema";
import { Product } from "@/types";

/**
 * Server action to fetch all products for the admin panel
 * Unlike getAllProducts, this:
 * - Returns all products (not just active ones)
 * - Doesn't include variations or blog posts
 * - Doesn't implement caching (admin needs real-time data)
 */
export default async function getAdminProducts(): Promise<Product[]> {
  try {
    return db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .all();
  } catch (error) {
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
} 