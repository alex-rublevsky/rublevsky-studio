'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogCategories } from "@/server/schema";
import { NewBlogCategory } from "@/types";

interface BlogCategoryFormData {
  name: string;
  slug: string;
  isActive?: boolean;
}

/**
 * Server action to create a new blog category
 * @param data - Blog category form data
 * @returns The created blog category
 */
export default async function createBlogCategory(data: BlogCategoryFormData) {
  if (!data.name || !data.slug) {
    throw new Error("Name and slug are required");
  }

  // Check if slug already exists
  const existingCategory = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.slug, data.slug))
    .get();

  if (existingCategory) {
    throw new Error(`A category with slug "${data.slug}" already exists`);
  }

  // Prepare the data
  const newCategory: NewBlogCategory = {
    name: data.name,
    slug: data.slug,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Insert the new category
  const result = await db.insert(blogCategories).values(newCategory).run();
  
  if (!result.changes || result.changes < 1) {
    throw new Error("Failed to create blog category");
  }

  return {
    ...newCategory,
    id: result.lastInsertRowid as number,
  };
} 