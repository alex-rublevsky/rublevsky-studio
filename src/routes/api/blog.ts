import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { blogPosts, teaCategories, blogTeaCategories } from '~/schema'
import { db } from '~/db'
import { desc, eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/blog')({
  GET: async ({ request, params }) => {
    // Add CORS headers to allow requests from localhost
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
    };

    try {
      // Get blog posts with their tea categories using a cleaner approach
      const blogResults = await db
        .select()
        .from(blogPosts)
        .leftJoin(blogTeaCategories, eq(blogTeaCategories.blogPostId, blogPosts.id))
        .orderBy(desc(blogPosts.publishedAt));

      // Get all active tea categories separately for the filter
      const allTeaCategories = await db
        .select()
        .from(teaCategories)
        .where(eq(teaCategories.isActive, true));

      // Group blog results by post ID and collect tea categories
      const postsWithCategories = new Map();
      
      for (const row of blogResults) {
        const post = row.blog_posts;
        const teaCategory = row.blog_tea_categories;

        if (!postsWithCategories.has(post.id)) {
          postsWithCategories.set(post.id, {
            post: {
              id: post.id,
              title: post.title,
              slug: post.slug,
              body: post.body,
              productSlug: post.productSlug,
              images: post.images,
              publishedAt: post.publishedAt.getTime(),
              teaCategories: []
            },
            categories: new Set()
          });
        }

        if (teaCategory?.teaCategorySlug) {
          postsWithCategories.get(post.id).categories.add(teaCategory.teaCategorySlug);
        }
      }

      // Convert Sets to arrays and get final posts
      const posts = Array.from(postsWithCategories.values()).map(({ post, categories }) => ({
        ...post,
        teaCategories: Array.from(categories)
      }));
      
      if (!posts || posts.length === 0) {
        return json({ 
          posts: [],
          teaCategories: allTeaCategories 
        }, { 
          headers: corsHeaders
        });
      }
      
      return json({
        posts,
        teaCategories: allTeaCategories
      }, { 
        headers: corsHeaders 
      });
    } catch (error) {
      console.error('Error fetching blog data:', error);
      return json({ error: 'Failed to fetch blog data' }, { 
        status: 500,
        headers: corsHeaders
      });
    }
  },
});

