"use server";

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";

/**
 * Server action to delete a blog post
 * @param id - The ID of the blog post to delete
 */
export default async function deleteBlogPost(id: number): Promise<void> {
  try {
    // Delete the blog post (foreign key constraints will handle related data)
    await db.delete(blogPosts)
      .where(eq(blogPosts.id, id));
  } catch (error) {
    throw new Error(`Failed to delete blog post: ${(error as Error).message}`);
  }
} 