'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
import db from "@/server/db";
import { categories } from "@/server/schema";

interface CreateCategoryData {
  name: string;
  slug: string;
  image?: string | null;
  isActive?: boolean;
}

/**
 * Server action to create a new category
 * @param data - The category data to create
 */
export default async function createCategory(data: CreateCategoryData): Promise<void> {
  try {
    if (!data.name || !data.slug) {
      throw new Error("Name and slug are required");
    }

    // Initialize database (works for both local and production)
    const database = typeof process === 'undefined' 
      ? drizzle((globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB as D1Database)
      : db;

    // Check if slug already exists
    const existingCategory = await database
      .select()
      .from(categories)
      .where(eq(categories.slug, data.slug))
      .get();

    if (existingCategory) {
      throw new Error("A category with this slug already exists");
    }

    // Create category
    await database.insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        image: data.image || null,
        isActive: data.isActive ?? true
      });
  } catch (error) {
    throw new Error(`Failed to create category: ${(error as Error).message}`);
  }
} 