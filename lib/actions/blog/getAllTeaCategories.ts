'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { teaCategories } from "@/server/schema";
import { TeaCategory } from "@/types";

/**
 * Server action to fetch all tea categories
 * @param onlyActive - If true, only returns active categories
 * @returns Array of tea category objects
 */
export default async function getAllTeaCategories(onlyActive: boolean = false): Promise<TeaCategory[]> {
  try {
    // Build the query
    let query = db.select().from(teaCategories);
    
    // Filter by active status if requested
    if (onlyActive) {
      query = query.where(eq(teaCategories.isActive, true));
    }
    
    // Execute the query
    const allCategories = await query.all();
    
    return allCategories;
  } catch (error) {
    console.error("Error fetching tea categories:", error);
    throw new Error(`Failed to fetch tea categories: ${(error as Error).message}`);
  }
} 