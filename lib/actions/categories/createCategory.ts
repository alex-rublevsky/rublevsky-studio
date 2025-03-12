'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { categories } from "@/server/schema";
import { Category } from "@/types";

interface CreateCategoryData {
  name: string;
  slug: string;
  image?: string | null;
  isActive?: boolean;
}

/**
 * Server action to create a new category
 * @param data - The category data to create
 * @returns The created category object
 */
export default async function createCategory(data: CreateCategoryData): Promise<Category> {
  try {
    // Validate required fields
    if (!data.name || !data.slug) {
      throw new Error("Name and slug are required");
    }
    
    // Check if slug already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, data.slug))
      .get();
    
    if (existingCategory) {
      throw new Error("A category with this slug already exists");
    }
    
    // Format data for insertion
    const categoryData = {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    
    // Insert category into database
    const result = await db.insert(categories).values(categoryData).run();
    
    // Get the inserted ID
    const insertedId = result.lastInsertRowid as number;
    
    // Return the created category with ID
    return {
      id: insertedId,
      ...categoryData
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error(`Failed to create category: ${(error as Error).message}`);
  }
} 