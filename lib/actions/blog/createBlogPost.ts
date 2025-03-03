'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";
import { BlogPost, BlogPostFormData } from "@/types";

/**
 * Server action to create a new blog post
 * @param data - The blog post data to create
 * @returns The created blog post object
 */
export default async function createBlogPost(data: BlogPostFormData): Promise<BlogPost> {
  try {
    // Validate required fields
    if (!data.title || !data.slug || !data.body) {
      throw new Error("Title, slug, and body are required");
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

    // Format data for insertion
    const blogPostData = {
      title: data.title,
      slug: data.slug,
      body: data.body,
      blogCategorySlug: data.blogCategorySlug || null,
      productSlug: data.productSlug || null,
      images: data.images || null,
      publishedAt: data.publishedAt || new Date().toISOString(),
      lastEditedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert blog post into database
    const result = await db
      .insert(blogPosts)
      .values(blogPostData)
      .returning()
      .get();

    return result;
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw new Error(`Failed to create blog post: ${(error as Error).message}`);
  }
} 