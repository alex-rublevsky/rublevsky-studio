import { Hono } from 'hono';

interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    "rublevsky-storage": R2Bucket;
}

export const app = new Hono<{Bindings: Env}>();

app.get('/api/', (c) => {
    console.log('Request received');
    return c.json({
        name: "Cloudflare with Hono",
    });
});