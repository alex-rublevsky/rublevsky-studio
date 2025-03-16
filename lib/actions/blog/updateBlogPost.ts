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
    
    // Check if we're in production/Workers environment
    const isProduction = typeof process === 'undefined' || typeof globalThis.caches !== 'undefined';

    if (isProduction) {
      // In production, use D1's native transaction API
      // @ts-ignore - Cloudflare Workers specific
      const context = globalThis[Symbol.for("__cloudflare-context__")];
      if (!context?.env?.DB) throw new Error('Database binding not found in Cloudflare context');

      return await context.env.DB.prepare('SELECT 1').bind().first().then(async () => {
        return await context.env.DB.batch([
          // Update blog post
          context.env.DB.prepare(`
            UPDATE blog_posts 
            SET title = ?, slug = ?, body = ?, product_slug = ?, 
                images = ?, published_at = ?
            WHERE id = ?
          `).bind(
            data.title,
            data.slug,
            data.body,
            data.productSlug || null,
            data.images || null,
            Math.floor(data.publishedAt / 1000), // Convert milliseconds to seconds for SQLite timestamp
            id
          ),

          // Delete existing tea categories
          context.env.DB.prepare(`
            DELETE FROM blog_tea_categories 
            WHERE blog_post_id = ?
          `).bind(id),

          ...(data.teaCategories?.length ? [
            // Insert new tea categories
            context.env.DB.prepare(`
              INSERT INTO blog_tea_categories (blog_post_id, tea_category_slug)
              VALUES ${data.teaCategories.map(() => '(?, ?)').join(', ')}
            `).bind(
              ...data.teaCategories.flatMap(slug => [id, slug])
            )
          ] : [])
        ]);
      }).then(async () => {
        // Return the updated blog post
        const updatedPost = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
        return {
          ...updatedPost,
          teaCategories: data.teaCategories || [],
        };
      });
    } else {
      // In development, use Drizzle's transaction API
      return await db.transaction(async (tx: BetterSQLite3Database) => {
        // Update blog post
        const blogPostData = {
          title: data.title,
          slug: data.slug,
          body: data.body,
          productSlug: data.productSlug || null,
          images: data.images || null,
          publishedAt: new Date(Math.floor(data.publishedAt / 1000) * 1000), // Convert to Date object for Drizzle
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
    }
  } catch (error) {
    console.error("Error updating blog post:", error);
    throw new Error(`Failed to update blog post: ${(error as Error).message}`);
  }
} 