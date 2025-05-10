

import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { drizzle } from 'drizzle-orm/d1'
import { blogPosts } from '~/schema'
import { getBindings } from '~/utils/bindings'

export const APIRoute = createAPIFileRoute('/api/blog')({
  GET: async ({ request, params }) => {
    try {
      // Try to get bindings from our utility
      const bindings = await getBindings();
      const dbInstance = bindings.DB;
      
      // If not available, return an error
      if (!dbInstance) {
        console.error('DB binding not available in environment');
        return json({ error: 'Database connection unavailable' }, { status: 500 });
      }
      
      const db = drizzle(dbInstance);
      const allBlogPosts = await db.select().from(blogPosts).all();
      
      if (!allBlogPosts || allBlogPosts.length === 0) {
        return json({ message: 'No blog posts found' }, { status: 404 });
      }
      
      return json(allBlogPosts);
    } catch (error) {
      console.error('Error fetching products:', error);
      return json({ error: 'Failed to fetch products' }, { status: 500 });
    }
  },
});
        
//         if (!allProducts || allProducts.length === 0) {
//             return c.json({ message: 'No products found' }, 404);
//         }
        
//         return c.json(allProducts);
//   },
// })
