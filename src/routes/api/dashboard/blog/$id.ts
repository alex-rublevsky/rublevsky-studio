import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { blogPosts, blogTeaCategories } from '~/schema'
import { db } from '~/db'
import { eq } from 'drizzle-orm'
import { BlogPostFormData } from '~/types'

// Extract CORS headers to reduce duplication
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const APIRoute = createAPIFileRoute('/api/dashboard/blog/$id')({
  PUT: async ({ request, params }) => {
    // TODO: remove

    try {
      const postId = parseInt(params.id);

      if (isNaN(postId)) {
        return json(
          { error: "Invalid blog post ID" },
          {
            status: 400,
            headers: CORS_HEADERS,
          }
        );
      }

      const blogData: BlogPostFormData = await request.json();
      console.log('Updating blog post with ID:', postId, 'Data:', JSON.stringify(blogData, null, 2));

      // Validate required fields
      if (!blogData.slug || !blogData.body) {
        return json(
          {
            error: "Missing required fields: slug and body are required",
          },
          {
            status: 400,
            headers: CORS_HEADERS,
          }
        );
      }

      // Combine existence check and duplicate slug check in parallel (optimization)
      const [existingPost, duplicateSlug] = await Promise.all([
        db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.id, postId)).limit(1),
        db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, blogData.slug)).limit(1)
      ]);

      if (existingPost.length === 0) {
        return json(
          { error: "Blog post not found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      if (duplicateSlug.length > 0 && duplicateSlug[0].id !== postId) {
        return json(
          { error: "A blog post with this slug already exists" },
          {
            status: 409,
            headers: CORS_HEADERS,
          }
        );
      }

      // Update the blog post
      await db
        .update(blogPosts)
        .set({
          title: blogData.title,
          slug: blogData.slug,
          body: blogData.body,
          productSlug: blogData.productSlug || null,
          images: blogData.images || null,
          isVisible: blogData.isVisible ?? true,
          publishedAt: new Date(blogData.publishedAt),
        })
        .where(eq(blogPosts.id, postId));

      // Remove existing tea category relationships
      await db
        .delete(blogTeaCategories)
        .where(eq(blogTeaCategories.blogPostId, postId));

      // Insert new tea category relationships if provided
      if (blogData.teaCategories && blogData.teaCategories.length > 0) {
        const categoryInserts = blogData.teaCategories.map(categorySlug => ({
          blogPostId: postId,
          teaCategorySlug: categorySlug,
        }));

        await db.insert(blogTeaCategories).values(categoryInserts);
      }

      return json(
        {
          message: "Blog post updated successfully",
          id: postId,
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error updating blog post:', error);
      return json(
        { error: 'Failed to update blog post' },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
  },

  DELETE: async ({ params }) => {
    // TODO: remove

    try {
      const postId = parseInt(params.id);

      if (isNaN(postId)) {
        return json(
          { error: "Invalid blog post ID" },
          {
            status: 400,
            headers: CORS_HEADERS,
          }
        );
      }

      console.log('Deleting blog post with ID:', postId);

      // Check if blog post exists (optimized to select only needed field)
      const existingPost = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.id, postId))
        .limit(1);

      if (existingPost.length === 0) {
        return json(
          { error: "Blog post not found" },
          {
            status: 404,
            headers: CORS_HEADERS,
          }
        );
      }

      // Delete tea category relationships first (cascade delete should handle this, but being explicit)
      await db
        .delete(blogTeaCategories)
        .where(eq(blogTeaCategories.blogPostId, postId));

      // Delete the blog post
      await db
        .delete(blogPosts)
        .where(eq(blogPosts.id, postId));

      return json(
        {
          message: "Blog post deleted successfully",
          id: postId,
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return json(
        { error: 'Failed to delete blog post' },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
  },

  OPTIONS: async ({ request }) => {
    // TODO: remove
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  },
});
