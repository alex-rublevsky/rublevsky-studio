'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";
import { BlogPost } from "@/types";

/**
 * Server action to fetch a blog post by ID
 * @param id - The ID of the blog post to fetch
 * @returns The blog post object or null if not found
 */
export default async function getBlogPostById(id: number): Promise<BlogPost | null> {
  try {
    if (!id) {
      throw new Error("Blog post ID is required");
    }
    
    // Get blog post by ID
    const blogPost = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .get();
    
    if (!blogPost) {
      return null;
    }
    
    return blogPost;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw new Error(`Failed to fetch blog post: ${(error as Error).message}`);
  }
} 