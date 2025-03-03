'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogCategories } from "@/server/schema";
import { BlogCategory } from "@/types";

/**
 * Server action to fetch all blog categories
 * @param onlyActive - If true, only returns active categories
 * @returns Array of blog category objects
 */
export default async function getAllBlogCategories(onlyActive: boolean = false): Promise<BlogCategory[]> {
  try {
    // Build the query
    let query = db.select().from(blogCategories);
    
    // Filter by active status if requested
    if (onlyActive) {
      query = query.where(eq(blogCategories.isActive, true));
    }
    
    // Execute the query
    const allCategories = await query.all();
    
    return allCategories;
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    throw new Error(`Failed to fetch blog categories: ${(error as Error).message}`);
  }
} 