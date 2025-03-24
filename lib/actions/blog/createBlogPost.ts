'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { BlogPostFormData } from "@/types";
import type { DB } from "@/server/db";

/**
 * Server action to create a new blog post
 * @param data - The blog post data to create
 */
export async function createBlogPost(data: BlogPostFormData): Promise<void> {
  try {
    if (!data.slug || !data.body) {
      throw new Error("Slug and body are required");
    }

    // Check if slug already exists
    const existingPost = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, data.slug))
      .get();

    if (existingPost) {
      throw new Error("A blog post with this slug already exists");
    }

    // Create blog post and get its ID for related data
    const result = await db.insert(blogPosts)
      .values({
        title: data.title,
        slug: data.slug,
        body: data.body,
        productSlug: data.productSlug || null,
        images: data.images || null,
        publishedAt: data.publishedAt ? new Date(Number(data.publishedAt)) : new Date()
      })
      .returning();

    const blogPostId = result[0].id;

    // Insert tea categories if they exist
    if (data.teaCategories?.length) {
      const teaCategoryValues = data.teaCategories.map(teaCategorySlug => ({
        blogPostId,
        teaCategorySlug
      }));
      
      await db.insert(blogTeaCategories).values(teaCategoryValues);
    }
  } catch (error) {
    throw new Error(`Failed to create blog post: ${(error as Error).message}`);
  }
} 