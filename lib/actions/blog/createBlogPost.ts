'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { BlogPost, BlogPostFormData } from "@/types";

/**
 * Server action to create a new blog post
 * @param data - The blog post data to create
 * @returns The created blog post object
 */
export async function createBlogPost(data: BlogPostFormData): Promise<BlogPost> {
  try {
    // Validate required fields - only slug is required
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

    // Check if slug already exists
    const existingPost = await database
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, data.slug))
      .get();

    if (existingPost) {
      throw new Error("A blog post with this slug already exists");
    }

    // Prepare images and publishedAt
    const images = data.images || null;
    const publishedAt = new Date(data.publishedAt);

    if (isProduction) {
      const d1 = (globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB;

      // Create the blog post first
      const result = await d1.prepare(`
        INSERT INTO blog_posts (
          title, slug, body, product_slug, images, published_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
        data.title,
        data.slug,
        data.body,
        data.productSlug || null,
        images,
        Math.floor(data.publishedAt / 1000) // Convert milliseconds to seconds for SQLite timestamp
      ).first();

      if (!result) {
        throw new Error("Failed to create blog post");
      }

      const blogPostId = result.id;

      // Insert tea categories if they exist
      if (data.teaCategories?.length) {
        await d1.prepare(`
          INSERT INTO blog_tea_categories (blog_post_id, tea_category_slug)
          VALUES ${data.teaCategories.map(() => '(?, ?)').join(', ')}
        `).bind(
          ...data.teaCategories.flatMap(slug => [blogPostId, slug])
        ).run();
      }

      return {
        ...result,
        teaCategories: data.teaCategories || [],
      };
    } else {
      // Development: Use Drizzle's transaction API
      return await database.transaction(async (tx: BetterSQLite3Database) => {
        // Insert blog post
        const result = await tx
          .insert(blogPosts)
          .values({
            title: data.title,
            slug: data.slug,
            body: data.body,
            productSlug: data.productSlug || null,
            images: images,
            publishedAt: publishedAt
          })
          .returning()
          .get();

        // Insert tea categories
        if (data.teaCategories?.length) {
          await tx.insert(blogTeaCategories).values(
            data.teaCategories.map(slug => ({
              blogPostId: result.id,
              teaCategorySlug: slug
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
    console.error("Error creating blog post:", error);
    throw new Error(`Failed to create blog post: ${(error as Error).message}`);
  }
} 