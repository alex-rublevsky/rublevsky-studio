"use server";

import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { sql } from "drizzle-orm";
import { BlogPost } from "@/types";

/**
 * Server action to get all blog posts for admin dashboard
 * Returns blog posts with their associated tea categories
 */
export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  // First, get all blog posts
  const posts = await db.select().from(blogPosts);
  
  // Then, get all tea categories for these posts
  const teaCategories = posts.length > 0
    ? await db
        .select()
        .from(blogTeaCategories)
        .where(sql`${blogTeaCategories.blogPostId} IN (${posts.map(p => p.id).join(",")})`)
    : [];

  // Transform the results into the expected format
  return posts.map(post => {
    const postTeaCategories = teaCategories
      .filter(tc => tc.blogPostId === post.id)
      .map(tc => tc.teaCategorySlug);

    return {
      id: post.id,
      title: post.title ?? "",
      slug: post.slug,
      body: post.body ?? "",
      images: post.images ?? "",
      productSlug: post.productSlug ?? "",
      publishedAt: post.publishedAt.getTime(),
      teaCategories: postTeaCategories
    };
  });
}