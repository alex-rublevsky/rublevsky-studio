'use server';

import { desc, eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, products, blogTeaCategories, teaCategories } from "@/server/schema";
import { BlogPost } from "@/types";

export default async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get all blog posts with their tea categories
    const result = await db
      .select({
        ...blogPosts,
        productImages: products.images,
        teaCategorySlug: teaCategories.slug
      })
      .from(blogPosts)
      .leftJoin(
        products,
        eq(blogPosts.productSlug, products.slug)
      )
      .leftJoin(
        blogTeaCategories,
        eq(blogTeaCategories.blogPostId, blogPosts.id)
      )
      .leftJoin(
        teaCategories,
        eq(teaCategories.slug, blogTeaCategories.teaCategorySlug)
      )
      .orderBy(desc(blogPosts.publishedAt))
      .all();
    
    if (!Array.isArray(result)) {
      console.error("Blog posts result is not an array:", result);
      return [];
    }

    // Group the results by blog post ID to handle multiple tea categories per post
    const blogPostMap = new Map();

    result.forEach((row) => {
      const postId = row.id;
      if (!blogPostMap.has(postId)) {
        blogPostMap.set(postId, {
          ...row,
          images: row.productSlug ? row.productImages : row.images,
          teaCategories: []
        });
      }

      // Add tea category if it exists and isn't already in the array
      if (row.teaCategorySlug && !blogPostMap.get(postId).teaCategories.includes(row.teaCategorySlug)) {
        blogPostMap.get(postId).teaCategories.push(row.teaCategorySlug);
      }
    });

    return Array.from(blogPostMap.values());
  } catch (error) {
    console.error("Error in getAllBlogPosts:", error);
    return [];
  }
}
