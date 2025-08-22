import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { blogPosts, teaCategories, blogTeaCategories } from '~/schema'
import { db } from '~/db'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/blog/$slug')({
  GET: async ({ params }) => {
    // TODO: remove CORS headers in production
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    const { slug } = params;

    if (!slug) {
      return json({ error: 'Slug parameter is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    try {
      // Get the specific blog post with its tea categories
      const blogResults = await db
        .select()
        .from(blogPosts)
        .leftJoin(blogTeaCategories, eq(blogTeaCategories.blogPostId, blogPosts.id))
        .where(eq(blogPosts.slug, slug));

      if (!blogResults || blogResults.length === 0) {
        return json({ error: 'Blog post not found' }, { 
          status: 404,
          headers: corsHeaders
        });
      }

      // Extract the blog post data and collect tea categories
      const post = blogResults[0].blog_posts;
      const teaCategorySlugs: string[] = [];

      for (const row of blogResults) {
        if (row.blog_tea_categories?.teaCategorySlug) {
          teaCategorySlugs.push(row.blog_tea_categories.teaCategorySlug);
        }
      }

      // Format the response
      const formattedPost = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        body: post.body,
        productSlug: post.productSlug,
        images: post.images,
        publishedAt: post.publishedAt.getTime(),
        teaCategories: teaCategorySlugs
      };

      return json(formattedPost, { 
        headers: corsHeaders 
      });
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return json({ error: 'Failed to fetch blog post' }, { 
        status: 500,
        headers: corsHeaders
      });
    }
  },
});