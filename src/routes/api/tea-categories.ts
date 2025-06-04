import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { drizzle } from 'drizzle-orm/d1'
import { teaCategories } from '~/schema'
import { getBindings } from '~/utils/bindings'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/tea-categories')({
  GET: async ({ request, params }) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://rublevsky.studio',
    };

    try {
      // Try to get bindings from our utility
      const bindings = await getBindings();
      const dbInstance = bindings.DB;
      
      // If not available, return an error
      if (!dbInstance) {
        console.error('DB binding not available in environment');
        return json({ error: 'Database connection unavailable' }, { 
          status: 500,
          headers: corsHeaders 
        });
      }
      
      const db = drizzle(dbInstance);
      const allTeaCategories = await db.select().from(teaCategories)
        .where(eq(teaCategories.isActive, true))
        .all();
      
      if (!allTeaCategories || allTeaCategories.length === 0) {
        return json({ message: 'No tea categories found' }, { 
          status: 404,
          headers: corsHeaders 
        });
      }
      
      return json(allTeaCategories, { headers: corsHeaders });
    } catch (error) {
      console.error('Error fetching tea categories:', error);
      return json({ error: 'Failed to fetch tea categories' }, { 
        status: 500,
        headers: corsHeaders 
      });
    }
  },
});
