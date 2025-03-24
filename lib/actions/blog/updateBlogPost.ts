'use server';

import { eq } from "drizzle-orm";
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
    if (!data.slug || !data.body) {
      throw new Error("Slug and body are required");
    }

    // Fetch existing post and check for duplicate slug in parallel
    const [post, duplicateSlug] = await Promise.all([
      db.select().from(blogPosts).where(eq(blogPosts.id, id)).get(),
      db.select().from(blogPosts).where(eq(blogPosts.slug, data.slug)).get()
    ]);

    if (!post) throw new Error("Blog post not found");
    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new Error("A blog post with this slug already exists");
    }

    // Update blog post and handle tea categories in parallel
    await Promise.all([
      // Update main blog post
      db.update(blogPosts)
        .set({
          title: data.title,
          slug: data.slug,
          body: data.body,
          productSlug: data.productSlug || null,
          images: data.images || null,
          publishedAt: new Date(Math.floor(data.publishedAt / 1000) * 1000)
        })
        .where(eq(blogPosts.id, id)),

      // Handle tea categories
      (async () => {
        await db.delete(blogTeaCategories)
          .where(eq(blogTeaCategories.blogPostId, id));

        if (data.teaCategories?.length) {
          await db.insert(blogTeaCategories)
            .values(
              data.teaCategories.map(slug => ({
                blogPostId: id,
                teaCategorySlug: slug
              }))
            );
        }
      })()
    ]);

    // Fetch updated blog post with its tea categories
    const results = await db
      .select()
      .from(blogPosts)
      .leftJoin(
        blogTeaCategories,
        eq(blogTeaCategories.blogPostId, blogPosts.id)
      )
      .where(eq(blogPosts.id, id));

    if (results.length === 0) throw new Error("Failed to fetch updated blog post");

    // Format the response
    const updatedPost = results[0].blog_posts;
    const teaCategories = results
      .map(row => row.blog_tea_categories?.teaCategorySlug)
      .filter((slug): slug is string => slug !== null && slug !== undefined);

    return {
      id: updatedPost.id,
      title: updatedPost.title ?? "",
      slug: updatedPost.slug,
      body: updatedPost.body ?? "",
      images: updatedPost.images ?? "",
      productSlug: updatedPost.productSlug ?? "",
      publishedAt: updatedPost.publishedAt.getTime(),
      teaCategories
    };
  } catch (error) {
    throw new Error(`Failed to update blog post: ${(error as Error).message}`);
  }
} 