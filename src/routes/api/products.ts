import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { products } from '~/schema'
import {db} from '~/db'


export const APIRoute = createAPIFileRoute('/api/products')({
  GET: async ({ request, params }) => {
 
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://tanstack.rublevsky.studio',
    };

    try {
      const result = await db.select().from(products).all();
      
      if (!result || result.length === 0) {
        return json({ message: 'No products found' }, { 
          status: 404,
          headers: corsHeaders
        });
      }
      
      return json(result, { headers: corsHeaders });
    } catch (error) {
      console.error('Error fetching products:', error);
      return json({ error: 'Failed to fetch products' }, { 
        status: 500,
        headers: corsHeaders
      });
    }
  },
});