import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { blogPosts, teaCategories, blogTeaCategories, products } from '~/schema'
import { db } from '~/db'
import { desc, eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/blog')({
  GET: async ({ request, params }) => {
    // TODO: remove
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
        
        };
 

    try {
      // Get blog posts with their tea categories and product images (if linked) using a cleaner approach
      const blogResults = await db
        .select()
        .from(blogPosts)
        .leftJoin(blogTeaCategories, eq(blogTeaCategories.blogPostId, blogPosts.id))
        .leftJoin(products, eq(products.slug, blogPosts.productSlug))
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
              images: finalImages,
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

      // Convert Sets to arrays and get final posts with preview data only
      const posts = Array.from(postsWithCategories.values()).map(({ post, categories }) => {
        // Get first image only
        const firstImage = post.images 
          ? post.images.split(',').map((img: string) => img.trim()).filter((img: string) => img !== '')[0] || null
          : null;
        
        // Create excerpt from body (first 150 characters)
        const excerpt = post.body && post.body.length > 150 
          ? post.body.substring(0, 150).trim() + '...'
          : post.body;
          
        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt, // Only excerpt, not full body
          firstImage, // Only first image, not all images
          publishedAt: post.publishedAt,
          teaCategories: Array.from(categories)
        };
      });
      
      if (!posts || posts.length === 0) {
        return json({ 
          posts: [],
          teaCategories: allTeaCategories,
          totalCount: 0
        }, { 
          headers: corsHeaders
        });
      }
      
      return json({
        posts,
        teaCategories: allTeaCategories,
        totalCount: posts.length
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

