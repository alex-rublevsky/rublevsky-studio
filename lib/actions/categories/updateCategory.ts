'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
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
    if (!data.name || !data.slug) {
      throw new Error("Name and slug are required");
    }

    // Initialize database (works for both local and production)
    const database = typeof process === 'undefined' 
      ? drizzle((globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB as D1Database)
      : db;

    // Fetch existing category and check for duplicate slug in a single query
    const [category, duplicateSlug] = await Promise.all([
      database.select().from(categories).where(eq(categories.id, id)).get(),
      database.select().from(categories).where(eq(categories.slug, data.slug)).get()
    ]);

    if (!category) throw new Error("Category not found");
    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new Error("A category with this slug already exists");
    }

    // Update category
    await database.update(categories)
      .set({
        name: data.name,
        slug: data.slug,
        image: data.image || null,
        isActive: data.isActive ?? category.isActive
      })
      .where(eq(categories.id, id));

    // Fetch and return updated category
    const updatedCategory = await database.select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();

    return updatedCategory as Category;
  } catch (error) {
    throw new Error(`Failed to update category: ${(error as Error).message}`);
  }
} 