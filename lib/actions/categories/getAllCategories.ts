'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { categories } from "@/server/schema";
import { Category } from "@/types";

/**
 * Server action to fetch all categories
 * @param onlyActive - If true, only returns active categories
 * @returns Array of category objects
 */
export default async function getAllCategories(onlyActive: boolean = false): Promise<Category[]> {
  try {
    // Build the query
    let query = db.select().from(categories);
    
    // Filter by active status if requested
    if (onlyActive) {
      query = query.where(eq(categories.isActive, true));
    }
    
    // Execute the query
    const allCategories = await query.all();
    
    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(`Failed to fetch categories: ${(error as Error).message}`);
  }
} 