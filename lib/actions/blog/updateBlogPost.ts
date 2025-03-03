'use server';

import { eq, and, ne } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts } from "@/server/schema";
import { BlogPost, BlogPostFormData } from "@/types";

/**
 * Server action to update a blog post
 * @param id - The ID of the blog post to update
 * @param data - The blog post data to update
 * @returns The updated blog post object
 */
export default async function updateBlogPost(id: number, data: BlogPostFormData): Promise<BlogPost> {
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
    
    // Check if slug already exists for another blog post
    const existingSlug = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, data.slug), ne(blogPosts.id, id)))
      .get();
    
    if (existingSlug) {
      throw new Error("Another blog post with this slug already exists");
    }
    
    // Format data for update
    const blogPostData = {
      title: data.title,
      slug: data.slug,
      body: data.body,
      blogCategorySlug: data.blogCategorySlug || null,
      productSlug: data.productSlug || null,
      images: data.images || null,
      publishedAt: data.publishedAt || existingPost.publishedAt,
      lastEditedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update blog post in database
    const result = await db
      .update(blogPosts)
      .set(blogPostData)
      .where(eq(blogPosts.id, id))
      .returning()
      .get();
    
    return result;
  } catch (error) {
    console.error("Error updating blog post:", error);
    throw new Error(`Failed to update blog post: ${(error as Error).message}`);
  }
} 