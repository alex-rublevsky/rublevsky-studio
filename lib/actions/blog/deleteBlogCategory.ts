'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogCategories, blogPosts } from "@/server/schema";

/**
 * Server action to delete a blog category
 * @param id - The ID of the blog category to delete
 * @returns Boolean indicating success
 */
export default async function deleteBlogCategory(id: number) {
  if (!id) {
    throw new Error("Category ID is required");
  }

  // Check if the category exists
  const existingCategory = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.id, id))
    .get();

  if (!existingCategory) {
    throw new Error(`Category with ID ${id} not found`);
  }

  // Check if there are blog posts using this category
  const postsWithCategory = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.blogCategorySlug, existingCategory.slug))
    .all();

  if (postsWithCategory.length > 0) {
    throw new Error(`Cannot delete category: ${postsWithCategory.length} blog posts are using this category`);
  }

  // Delete the category
  const result = await db
    .delete(blogCategories)
    .where(eq(blogCategories.id, id))
    .run();

  if (!result.changes || result.changes < 1) {
    throw new Error("Failed to delete blog category");
  }

  return true;
} 