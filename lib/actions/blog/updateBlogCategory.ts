'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogCategories } from "@/server/schema";

interface UpdateBlogCategoryData {
  id: number;
  name: string;
  slug: string;
  isActive?: boolean;
}

/**
 * Server action to update an existing blog category
 * @param data - Blog category data with id
 * @returns The updated blog category
 */
export default async function updateBlogCategory(data: UpdateBlogCategoryData) {
  if (!data.id || !data.name || !data.slug) {
    throw new Error("ID, name, and slug are required");
  }

  // Check if the category exists
  const existingCategory = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.id, data.id))
    .get();

  if (!existingCategory) {
    throw new Error(`Category with ID ${data.id} not found`);
  }

  // Check if the new slug already exists (but not for this category)
  if (data.slug !== existingCategory.slug) {
    const slugExists = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, data.slug))
      .get();

    if (slugExists) {
      throw new Error(`A category with slug "${data.slug}" already exists`);
    }
  }

  // Update the category
  const result = await db
    .update(blogCategories)
    .set({
      name: data.name,
      slug: data.slug,
      isActive: data.isActive !== undefined ? data.isActive : existingCategory.isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(blogCategories.id, data.id))
    .run();

  if (!result.changes || result.changes < 1) {
    throw new Error("Failed to update blog category");
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    isActive: data.isActive !== undefined ? data.isActive : existingCategory.isActive,
    createdAt: existingCategory.createdAt,
    updatedAt: new Date().toISOString(),
  };
} 