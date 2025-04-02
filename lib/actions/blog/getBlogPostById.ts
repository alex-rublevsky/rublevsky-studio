"use server";

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { BlogPost } from "@/types";

/**
 * Get a blog post by ID with its tea categories
 * Used in the admin dashboard for editing posts
 */
export default async function getBlogPostById(id: number): Promise<BlogPost | null> {
  try {
    if (!id) throw new Error("Blog post ID is required");

    // Get blog post with its tea categories in a single query
    const results = await db
      .select()
      .from(blogPosts)
      .leftJoin(
        blogTeaCategories,
        eq(blogTeaCategories.blogPostId, blogPosts.id)
      )
      .where(eq(blogPosts.id, id));

    if (results.length === 0) return null;

    // Get the first row for blog post data
    const firstRow = results[0].blog_posts;
    
    // Extract tea categories from all rows
    const teaCategories = results
      .map(row => row.blog_tea_categories?.teaCategorySlug)
      .filter((slug): slug is string => slug !== null && slug !== undefined);

    // Return the formatted blog post
    return {
      id: firstRow.id,
      title: firstRow.title ?? "",
      slug: firstRow.slug,
      body: firstRow.body ?? "",
      images: firstRow.images ?? "",
      productSlug: firstRow.productSlug ?? "",
      publishedAt: firstRow.publishedAt.getTime(),
      teaCategories
    };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw new Error(`Failed to fetch blog post: ${(error as Error).message}`);
  }
} 