'use server';

import { desc, eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, products } from "@/server/schema";
import { BlogPost } from "@/types";

export default async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get all blog posts ordered by publish date
    const allBlogPosts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))
      .all();
    
    if (!Array.isArray(allBlogPosts)) {
      console.error("Blog posts result is not an array:", allBlogPosts);
      return [];
    }

    const enrichedBlogPosts = await Promise.all(allBlogPosts.map(async (post) => {
      // If there's a linked product, use its images
      if (post.productSlug) {
        const linkedProduct = await db
          .select({
            images: products.images
          })
          .from(products)
          .where(eq(products.slug, post.productSlug))
          .get();
        
        return {
          ...post,
          images: linkedProduct?.images
        };
      }

      return post;
    }));
    
    return enrichedBlogPosts;
  } catch (error) {
    console.error("Error in getAllBlogPosts:", error);
    return [];
  }
}
