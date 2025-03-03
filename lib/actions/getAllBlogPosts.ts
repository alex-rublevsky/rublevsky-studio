'use server';

import { desc } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";
import { BlogPost } from "@/types";

export default async function getAllBlogPosts(): Promise<BlogPost[]> {
  // Get all blog posts ordered by publish date
  const allBlogPosts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt))
    .all();
  
  return allBlogPosts;
}
