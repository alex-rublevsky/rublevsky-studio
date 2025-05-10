import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '../../src/schema';

export interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    "rublevsky-storage": R2Bucket;
}

//export const app = new Hono<{Bindings: Env}>();

// Note: Changed API path to /hono/api/products to avoid conflicts with TanStack routes
// app.get('/hono/api/products', async (c) => {
//     try {
//         const db = drizzle(c.env.DB);
//         const allProducts = await db.select().from(products).all();
        
//         if (!allProducts || allProducts.length === 0) {
//             return c.json({ message: 'No products found' }, 404);
//         }
        
//         return c.json(allProducts);
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         return c.json({ error: 'Failed to fetch products' }, 500);
//     }
// });