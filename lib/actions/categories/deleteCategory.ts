'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { categories } from "@/server/schema";

/**
 * Server action to delete a category
 * @param id - The ID of the category to delete
 * @returns A success message
 */
export default async function deleteCategory(id: number): Promise<{ message: string }> {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }
    
    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();
    
    if (!existingCategory) {
      throw new Error("Category not found");
    }
    
    // Delete the category
    await db
      .delete(categories)
      .where(eq(categories.id, id))
      .run();
    
    return { message: "Category deleted successfully" };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error(`Failed to delete category: ${(error as Error).message}`);
  }
} 