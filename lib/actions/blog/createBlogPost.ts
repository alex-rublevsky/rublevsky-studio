'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { BlogPost, BlogPostFormData } from "@/types";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

/**
 * Server action to create a new blog post
 * @param data - The blog post data to create
 * @returns The created blog post object
 */
export async function createBlogPost(data: BlogPostFormData): Promise<BlogPost> {
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

    return await db.transaction(async (tx: BetterSQLite3Database) => {
      // Insert blog post
      const blogPostData = {
        title: data.title,
        slug: data.slug,
        body: data.body,
        productSlug: data.productSlug || null,
        images: data.images || null,
        publishedAt: new Date(data.publishedAt * 1000),
      };

      const result = await tx
        .insert(blogPosts)
        .values(blogPostData)
        .returning()
        .get();

      // Insert tea categories
      if (data.teaCategories && data.teaCategories.length > 0) {
        await tx.insert(blogTeaCategories).values(
          data.teaCategories.map((teaCategorySlug) => ({
            blogPostId: result.id,
            teaCategorySlug,
          }))
        );
      }

      return {
        ...result,
        teaCategories: data.teaCategories || [],
      };
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw new Error(`Failed to create blog post: ${(error as Error).message}`);
  }
} 