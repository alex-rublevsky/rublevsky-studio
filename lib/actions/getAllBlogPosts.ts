import { eq, desc, and } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";
import { BlogPost } from "@/types";

export default async function getAllBlogPosts(): Promise<BlogPost[]> {
  const allBlogPosts = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  return allBlogPosts;
}
