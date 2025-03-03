'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { brands } from "@/server/schema";
import { Brand } from "@/types";

/**
 * Server action to fetch all brands
 * @param onlyActive - If true, only returns active brands
 * @returns Array of brand objects
 */
export default async function getAllBrands(onlyActive: boolean = false): Promise<Brand[]> {
  try {
    // Build the query
    let query = db.select().from(brands);
    
    // Filter by active status if requested
    if (onlyActive) {
      query = query.where(eq(brands.isActive, true));
    }
    
    // Execute the query
    const allBrands = await query.all();
    
    return allBrands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error(`Failed to fetch brands: ${(error as Error).message}`);
  }
} 