'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { categories } from "@/server/schema";
import { Category } from "@/types";

interface UpdateCategoryData {
  name: string;
  slug: string;
  image?: string | null;
  isActive?: boolean;
}

/**
 * Server action to update a category
 * @param id - The ID of the category to update
 * @param data - The category data to update
 * @returns The updated category object
 */
export default async function updateCategory(id: number, data: UpdateCategoryData): Promise<Category> {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }
    
    if (!data.name || !data.slug) {
      throw new Error("Name and slug are required");
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
    
    // Check if slug already exists (but not for this category)
    const slugExists = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, data.slug))
      .all();
    
    if (slugExists.length > 0 && slugExists.some((c: { id: number }) => c.id !== id)) {
      throw new Error("A different category with this slug already exists");
    }
    
    // Format data for update
    const categoryData = {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      isActive: data.isActive !== undefined ? data.isActive : existingCategory.isActive,
    };
    
    // Update category in database
    await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .run();
    
    // Return the updated category
    return {
      id,
      ...categoryData,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error(`Failed to update category: ${(error as Error).message}`);
  }
} 