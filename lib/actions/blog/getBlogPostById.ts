'use server';

import { eq, sql } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { BlogPost } from "@/types";

interface QueryResult {
  id: number;
  title: string;
  slug: string;
  body: string | null;
  images: string | null;
  productSlug: string | null;
  publishedAt: string | null;
  teaCategorySlug: string | null;
}

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
    
    // Get blog post with its tea categories
    const results = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        body: blogPosts.body,
        images: blogPosts.images,
        productSlug: blogPosts.productSlug,
        publishedAt: blogPosts.publishedAt,
        teaCategorySlug: blogTeaCategories.teaCategorySlug,
      })
      .from(blogPosts)
      .leftJoin(
        blogTeaCategories,
        sql`${blogTeaCategories.blogPostId} = ${blogPosts.id}`
      )
      .where(sql`${blogPosts.id} = ${id}`) as QueryResult[];
    
    if (results.length === 0) {
      return null;
    }

    // Construct the blog post object with tea categories
    const firstRow = results[0];
    const blogPost: BlogPost = {
      id: firstRow.id,
      title: firstRow.title,
      slug: firstRow.slug,
      body: firstRow.body ?? "",
      images: firstRow.images ?? "",
      productSlug: firstRow.productSlug ?? "",
      publishedAt: firstRow.publishedAt ?? "",
      teaCategories: [] as string[],
    };

    // Add tea categories
    for (const row of results) {
      if (row.teaCategorySlug && blogPost.teaCategories) {
        blogPost.teaCategories.push(row.teaCategorySlug);
      }
    }
    
    return blogPost;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw new Error(`Failed to fetch blog post: ${(error as Error).message}`);
  }
} 