'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { brands } from "@/server/schema";
import { Brand } from "@/types";

/**
 * Server action to fetch a brand by its ID
 * @param id - The ID of the brand to fetch
 * @returns The brand object or null if not found
 */
export default async function getBrandById(id: number): Promise<Brand | null> {
  try {
    if (!id) {
      throw new Error("Brand ID is required");
    }
    
    // Get brand by ID
    const brand = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .get();
    
    if (!brand) {
      return null;
    }
    
    return brand;
  } catch (error) {
    console.error("Error fetching brand:", error);
    throw new Error(`Failed to fetch brand: ${(error as Error).message}`);
  }
} 