'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";

/**
 * Server action to delete a blog post
 * @param id - The ID of the blog post to delete
 * @returns A success message
 */
export default async function deleteBlogPost(id: number): Promise<{ message: string }> {
  try {
    if (!id) {
      throw new Error("Blog post ID is required");
    }
    
    // Check if blog post exists
    const existingPost = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .get();
    
    if (!existingPost) {
      throw new Error("Blog post not found");
    }
    
    // Delete the blog post
    await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .run();
    
    return { message: "Blog post deleted successfully" };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    throw new Error(`Failed to delete blog post: ${(error as Error).message}`);
  }
} 