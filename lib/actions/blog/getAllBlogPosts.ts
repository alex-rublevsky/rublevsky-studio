'use server';

import { desc, eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, products } from "@/server/schema";
import { BlogPost } from "@/types";

export default async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get all blog posts ordered by publish date
    const allBlogPosts = await db
      .select({
        ...blogPosts,
        productImages: products.images
      })
      .from(blogPosts)
      .leftJoin(
        products,
        eq(blogPosts.productSlug, products.slug)
      )
      .orderBy(desc(blogPosts.publishedAt))
      .all();
    
    if (!Array.isArray(allBlogPosts)) {
      console.error("Blog posts result is not an array:", allBlogPosts);
      return [];
    }

    // Transform the results to match the expected format
    const enrichedBlogPosts = allBlogPosts.map((post) => ({
      ...post,
      images: post.productSlug ? post.productImages : post.images
    }));
    
    return enrichedBlogPosts;
  } catch (error) {
    console.error("Error in getAllBlogPosts:", error);
    return [];
  }
}
