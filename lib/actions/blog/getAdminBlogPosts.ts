'use server';

import db from "@/server/db";
import { blogPosts, blogTeaCategories } from "@/server/schema";
import { sql } from "drizzle-orm";
import { BlogPost } from "@/types";

interface QueryResult {
  id: number;
  title: string;
  slug: string;
  body: string | null;
  images: string | null;
  productSlug: string | null;
  publishedAt: string | null;
  teaCategorySlug: string | null;
}

export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  const results = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      body: blogPosts.body,
      images: blogPosts.images,
      productSlug: blogPosts.productSlug,
      publishedAt: blogPosts.publishedAt,
      teaCategorySlug: blogTeaCategories.teaCategorySlug,
    })
    .from(blogPosts)
    .leftJoin(
      blogTeaCategories,
      sql`${blogTeaCategories.blogPostId} = ${blogPosts.id}`
    ) as QueryResult[];

  const blogPostsMap = new Map<number, BlogPost>();

  for (const row of results) {
    if (!blogPostsMap.has(row.id)) {
      blogPostsMap.set(row.id, {
        id: row.id,
        title: row.title,
        slug: row.slug,
        body: row.body ?? "",
        images: row.images ?? "",
        productSlug: row.productSlug ?? "",
        publishedAt: row.publishedAt ?? "",
        teaCategories: [] as string[],
      });
    }

    const post = blogPostsMap.get(row.id)!;
    if (row.teaCategorySlug && post.teaCategories) {
      post.teaCategories.push(row.teaCategorySlug);
    }
  }

  return Array.from(blogPostsMap.values());
}