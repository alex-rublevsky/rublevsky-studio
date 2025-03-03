'use server';

import { desc, eq } from "drizzle-orm";
import db from "@/server/db";
import { blogPosts, products } from "@/server/schema";
import { BlogPost } from "@/types";

export default async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get all blog posts ordered by publish date
    const allBlogPosts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))
      .all();
    
    if (!Array.isArray(allBlogPosts)) {
      console.error("Blog posts result is not an array:", allBlogPosts);
      return [];
    }

    const enrichedBlogPosts = await Promise.all(allBlogPosts.map(async (post) => {
      let parsedImages: string[] = [];

      // Debug log the raw post data
      console.log(`Raw post data for ${post.id}:`, JSON.stringify(post, null, 2));

      if (post.productSlug) {
        const linkedProduct = await db
          .select({
            images: products.images
          })
          .from(products)
          .where(eq(products.slug, post.productSlug))
          .get();

        // Debug log the raw product data
        console.log(`Raw product data for post ${post.id}:`, JSON.stringify(linkedProduct, null, 2));

        if (linkedProduct?.images) {
          try {
            let productImages: string[] = [];
            
            // Handle product images
            if (typeof linkedProduct.images === 'object' && Array.isArray(linkedProduct.images)) {
              productImages = linkedProduct.images;
            } else if (typeof linkedProduct.images === 'string') {
              try {
                const parsed = JSON.parse(linkedProduct.images);
                if (Array.isArray(parsed)) {
                  productImages = parsed;
                }
              } catch {
                // If JSON.parse fails, try using the string as a single image
                productImages = [linkedProduct.images];
              }
            }

            // Use image identifiers directly without adding products/ prefix
            parsedImages = productImages;
          } catch (error) {
            console.error(`Error processing product images for post ${post.id}:`, error);
          }
        }
      } else if (post.images) {
        try {
          let postImages: string[] = [];

          // Handle blog post images
          if (typeof post.images === 'object' && Array.isArray(post.images)) {
            postImages = post.images;
          } else if (typeof post.images === 'string') {
            try {
              const parsed = JSON.parse(post.images);
              if (Array.isArray(parsed)) {
                postImages = parsed;
              }
            } catch {
              // If JSON.parse fails, try using the string as a single image
              postImages = [post.images];
            }
          }

          // Use image identifiers directly without adding blog/ prefix
          parsedImages = postImages;
        } catch (error) {
          console.error(`Error processing blog images for post ${post.id}:`, error);
        }
      }

      // Debug log the final processed images
      console.log(`Processed images for post ${post.id}:`, parsedImages);

      return {
        ...post,
        images: parsedImages
      };
    }));
    
    return enrichedBlogPosts;
  } catch (error) {
    console.error("Error in getAllBlogPosts:", error);
    return [];
  }
}
