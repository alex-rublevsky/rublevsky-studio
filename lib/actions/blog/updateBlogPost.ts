'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { BlogPost, BlogPostFormData } from "@/types";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

/**
 * Server action to update a blog post
 * @param id - The ID of the blog post to update
 * @param data - The blog post data to update
 * @returns The updated blog post object
 */
export async function updateBlogPost(id: number, data: BlogPostFormData): Promise<BlogPost> {
  try {
    if (!id) {
      throw new Error("Blog post ID is required");
    }
    
    // Validate required fields
    if (!data.title || !data.slug || !data.body) {
      throw new Error("Title, slug, and body are required");
    }
    
    // Check if blog post exists
    const existingPost = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .get();
    
    if (!existingPost) {
      throw new Error("Blog post not found");
    }
    
    // Check if slug already exists for a different post
    const existingSlug = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, data.slug))
      .get();
    
    if (existingSlug && existingSlug.id !== id) {
      throw new Error("A blog post with this slug already exists");
    }
    
    return await db.transaction(async (tx: BetterSQLite3Database) => {
      // Update blog post
      const blogPostData = {
        title: data.title,
        slug: data.slug,
        body: data.body,
        productSlug: data.productSlug || null,
        images: data.images || null,
        publishedAt: data.publishedAt || null,
      };

      const result = await tx
        .update(blogPosts)
        .set(blogPostData)
        .where(eq(blogPosts.id, id))
        .returning()
        .get();

      // Delete existing tea categories
      await tx
        .delete(blogTeaCategories)
        .where(eq(blogTeaCategories.blogPostId, id));

      // Insert new tea categories
      if (data.teaCategories && data.teaCategories.length > 0) {
        await tx.insert(blogTeaCategories).values(
          data.teaCategories.map((teaCategorySlug) => ({
            blogPostId: id,
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
    console.error("Error updating blog post:", error);
    throw new Error(`Failed to update blog post: ${(error as Error).message}`);
  }
} 