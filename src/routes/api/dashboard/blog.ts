import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { blogPosts, teaCategories, blogTeaCategories, products } from '~/schema'
import { db } from '~/db'
import { eq, desc } from 'drizzle-orm'
import { BlogPostFormData } from '~/types'

// Extract CORS headers to reduce duplication
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const APIRoute = createAPIFileRoute('/api/dashboard/blog')({
  GET: async ({ request, params }) => {
    // TODO: remove

    try {
      // Get blog posts with their tea categories and product images (if linked) using the same approach as public API
      const blogResults = await db
        .select()
        .from(blogPosts)
        .leftJoin(blogTeaCategories, eq(blogTeaCategories.blogPostId, blogPosts.id))
        .leftJoin(products, eq(products.slug, blogPosts.productSlug))
        .orderBy(desc(blogPosts.publishedAt));

      // Get all tea categories for the UI
      const allTeaCategories = await db.select().from(teaCategories).all();
      
      // Group blog results by post ID and collect tea categories
      const postsWithCategories = new Map();
      
      for (const row of blogResults) {
        const post = row.blog_posts;
        const teaCategory = row.blog_tea_categories;
        const linkedProduct = row.products;

        if (!postsWithCategories.has(post.id)) {
          // Determine which images to use: blog images or product images as fallback
          let finalImages = post.images;
          if ((!post.images || post.images.trim() === '') && linkedProduct?.images) {
            finalImages = linkedProduct.images;
          }

          postsWithCategories.set(post.id, {
            post: {
              id: post.id,
              title: post.title,
              slug: post.slug,
              body: post.body,
              productSlug: post.productSlug,
              productName: linkedProduct?.name || null,
              images: finalImages,
              isVisible: post.isVisible,
              publishedAt: post.publishedAt ? post.publishedAt.getTime() : Date.now(),
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
          message: 'No blog posts found',
          posts: [],
          teaCategories: allTeaCategories 
        }, { 
          status: 404,
          headers: CORS_HEADERS
        });
      }
      
      return json({
        posts,
        teaCategories: allTeaCategories
      }, { 
        headers: CORS_HEADERS 
      });
    } catch (error) {
      console.error('Error fetching blog data:', error);
      return json({ error: 'Failed to fetch blog data' }, { 
        status: 500,
        headers: CORS_HEADERS
      });
    }
  },

  POST: async ({ request }) => {
    // TODO: remove

    try {
      const blogData: BlogPostFormData = await request.json();
      console.log('Creating blog post with data:', JSON.stringify(blogData, null, 2));

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

      // Check for duplicate slug (optimized to select only needed fields)
      const existingPost = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, blogData.slug))
        .limit(1);

      if (existingPost.length > 0) {
        return json(
          { error: "A blog post with this slug already exists" },
          {
            status: 409,
            headers: CORS_HEADERS,
          }
        );
      }

      // Insert the blog post
      const insertResult = await db
        .insert(blogPosts)
        .values({
          title: blogData.title,
          slug: blogData.slug,
          body: blogData.body,
          productSlug: blogData.productSlug || null,
          images: blogData.images || null,
          isVisible: blogData.isVisible ?? true,
          publishedAt: new Date(blogData.publishedAt),
        })
        .returning({ id: blogPosts.id });

      const newPostId = insertResult[0].id;

      // Insert tea category relationships if provided
      if (blogData.teaCategories && blogData.teaCategories.length > 0) {
        const categoryInserts = blogData.teaCategories.map(categorySlug => ({
          blogPostId: newPostId,
          teaCategorySlug: categorySlug,
        }));

        await db.insert(blogTeaCategories).values(categoryInserts);
      }

      return json(
        {
          message: "Blog post created successfully",
          id: newPostId,
        },
        {
          headers: CORS_HEADERS,
        }
      );
    } catch (error) {
      console.error('Error creating blog post:', error);
      return json(
        { error: 'Failed to create blog post' },
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

