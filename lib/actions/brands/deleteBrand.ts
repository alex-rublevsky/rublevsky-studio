'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { brands } from "@/server/schema";

/**
 * Server action to delete a brand
 * @param id - The ID of the brand to delete
 */
export default async function deleteBrand(id: number): Promise<void> {
  try {
    // Delete the brand (foreign key constraints will handle related data)
    await db.delete(brands)
      .where(eq(brands.id, id));
  } catch (error) {
    throw new Error(`Failed to delete brand: ${(error as Error).message}`);
  }
} 