'use server';

import db from "@/server/db";
import { products } from "@/server/schema";
import { Product } from "@/types";

/**
 * Server action to fetch all products for the admin panel
 * @returns Array of product objects
 */
export default async function getAdminProducts(): Promise<Product[]> {
  try {
    // Get all products
    const allProducts = await db.select().from(products).all();
    
    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
} 