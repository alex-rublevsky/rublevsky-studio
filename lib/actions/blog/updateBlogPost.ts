'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { BlogPost, BlogPostFormData } from "@/types";

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
    
    // Validate required fields - only slug and body are required for updates
    if (!data.slug) {
      throw new Error("Slug is required");
    }

    if (!data.body) {
      throw new Error("Body is required");
    }
    
    // Check if we're in production/Workers environment
    const isProduction = typeof process === 'undefined' || typeof globalThis.caches !== 'undefined';
    
    // Choose the appropriate database instance
    const database = isProduction 
      ? drizzle((globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB as D1Database)
      : db;

    if (isProduction && !(globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB) {
      throw new Error('Database binding not found in Cloudflare context');
    }
    
    // Check if blog post exists and if slug is unique (in a single DB operation)
    const [existingPost, duplicateSlug] = await Promise.all([
      database.select().from(blogPosts).where(eq(blogPosts.id, id)).get(),
      database.select().from(blogPosts).where(eq(blogPosts.slug, data.slug)).get()
    ]);
    
    if (!existingPost) {
      throw new Error("Blog post not found");
    }
    
    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new Error("A blog post with this slug already exists");
    }
    
    // Prepare images (if any)
    const images = data.images || null;
    
    // Handle publishedAt timestamp
    const publishedAt = new Date(Math.floor(data.publishedAt / 1000) * 1000);

    if (isProduction) {
      // Production: Use D1's native batch API
      const d1 = (globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB;

      // Execute all statements in a batch
      await d1.batch([
        // Update blog post
        d1.prepare(`
          UPDATE blog_posts 
          SET title = ?, slug = ?, body = ?, product_slug = ?, 
              images = ?, published_at = ?
          WHERE id = ?
        `).bind(
          data.title,
          data.slug,
          data.body,
          data.productSlug || null,
          images,
          Math.floor(data.publishedAt / 1000), // Convert milliseconds to seconds for SQLite timestamp
          id
        ),

        // Delete existing tea categories
        d1.prepare(`
          DELETE FROM blog_tea_categories 
          WHERE blog_post_id = ?
        `).bind(id),

        // Add tea categories if they exist
        ...(data.teaCategories?.length ? [
          d1.prepare(`
            INSERT INTO blog_tea_categories (blog_post_id, tea_category_slug)
            VALUES ${data.teaCategories.map(() => '(?, ?)').join(', ')}
          `).bind(
            ...data.teaCategories.flatMap(slug => [id, slug])
          )
        ] : [])
      ]);
    } else {
      // Development: Use Drizzle's transaction API
      await database.transaction(async (tx: BetterSQLite3Database) => {
        // Update blog post
        await tx
          .update(blogPosts)
          .set({
            title: data.title,
            slug: data.slug,
            body: data.body,
            productSlug: data.productSlug || null,
            images: images,
            publishedAt: publishedAt
          })
          .where(eq(blogPosts.id, id));

        // Handle tea categories
        await tx.delete(blogTeaCategories)
          .where(eq(blogTeaCategories.blogPostId, id));

        if (data.teaCategories?.length) {
          await tx.insert(blogTeaCategories)
            .values(
              data.teaCategories.map(slug => ({
                blogPostId: id,
                teaCategorySlug: slug
              }))
            );
        }
      });
    }

    // Return the updated blog post
    const updatedPost = await database.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
    
    return {
      ...updatedPost,
      teaCategories: data.teaCategories || [],
    };
  } catch (error) {
    console.error("Error updating blog post:", error);
    throw new Error(`Failed to update blog post: ${(error as Error).message}`);
  }
} 