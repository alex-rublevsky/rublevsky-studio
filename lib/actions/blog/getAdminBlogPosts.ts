'use server';

import { desc } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";
import { BlogPost } from "@/types";

/**
 * Server action to fetch all blog posts for the admin panel
 * @returns Array of blog post objects
 */
export default async function getAdminBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get all blog posts ordered by creation date
    const allBlogPosts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))
      .all();
    
    return allBlogPosts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw new Error(`Failed to fetch blog posts: ${(error as Error).message}`);
  }
} 