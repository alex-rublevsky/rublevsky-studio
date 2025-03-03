'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { brands } from "@/server/schema";

/**
 * Server action to delete a brand
 * @param id - The ID of the brand to delete
 * @returns A success message
 */
export default async function deleteBrand(id: number): Promise<{ message: string }> {
  try {
    if (!id) {
      throw new Error("Brand ID is required");
    }
    
    // Check if brand exists
    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .get();
    
    if (!existingBrand) {
      throw new Error("Brand not found");
    }
    
    // Delete the brand
    await db
      .delete(brands)
      .where(eq(brands.id, id))
      .run();
    
    return { message: "Brand deleted successfully" };
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw new Error(`Failed to delete brand: ${(error as Error).message}`);
  }
} 