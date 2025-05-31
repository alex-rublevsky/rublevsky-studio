import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { blogPosts, teaCategories } from '~/schema'
import { db } from '~/db'

export const APIRoute = createAPIFileRoute('/api/dashboard/blog')({
  GET: async ({ request, params }) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://tanstack.rublevsky.studio',
    };

    try {
      const [posts, categories] = await Promise.all([
        db.select().from(blogPosts).all(),
        db.select().from(teaCategories).all()
      ]);
      
      if (!posts || posts.length === 0) {
        return json({ 
          message: 'No blog posts found',
          posts: [],
          teaCategories: categories || [] 
        }, { 
          status: 404,
          headers: corsHeaders
        });
      }
      
      return json({
        posts,
        teaCategories: categories || []
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

