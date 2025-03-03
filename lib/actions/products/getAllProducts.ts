'use server';

import { eq, desc, and } from "drizzle-orm";
import db from "@/server/db";
import { products, categories, brands, productVariations, variationAttributes, blogPosts } from "@/server/schema";
import { Product, ProductWithVariations, ProductVariationWithAttributes } from "@/types";

interface GetAllProductsOptions {
  categorySlug?: string | null;
  brandSlug?: string | null;
  featured?: boolean;
  limit?: number;
}

export default async function getAllProducts({
  categorySlug = null,
  brandSlug = null,
  featured = false,
  limit = 12
}: GetAllProductsOptions = {}): Promise<ProductWithVariations[]> {
  try {
    // Build the query
    let query = db
      .select()
      .from(products)
      .where(eq(products.isActive, true));
    
    // Add filters
    if (categorySlug) {
      query = query.where(eq(products.categorySlug, categorySlug));
    }
    
    if (brandSlug) {
      query = query.where(eq(products.brandSlug, brandSlug));
    }
    
    if (featured) {
      query = query.where(eq(products.isFeatured, true));
    }
    
    // Order by newest first and limit results
    query = query.orderBy(desc(products.createdAt)).limit(limit);
    
    // Execute the query
    const productList = await query.all();
    
    // Fetch variations and blog post descriptions for products
    const enrichedProducts = await Promise.all(
      productList.map(async (product: Product) => {
        const enrichedProduct: ProductWithVariations = { ...product };

        // Check for linked blog post and use its body as description
        const linkedBlogPost = await db
          .select({
            body: blogPosts.body
          })
          .from(blogPosts)
          .where(eq(blogPosts.productSlug, product.slug))
          .get();

        if (linkedBlogPost) {
          enrichedProduct.description = linkedBlogPost.body;
        }

        // Fetch variations if product has them
        if (product.hasVariations) {
          const variations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.productId, product.id))
            .all();
          
          // Get attributes for each variation and convert to ProductVariationWithAttributes
          const enrichedVariations: ProductVariationWithAttributes[] = [];
          
          for (const variation of variations) {
            const attributes = await db
              .select()
              .from(variationAttributes)
              .where(eq(variationAttributes.productVariationId, variation.id))
              .all();
            
            enrichedVariations.push({
              ...variation,
              attributes
            });
          }
          
          enrichedProduct.variations = enrichedVariations;
        }
        
        return enrichedProduct;
      })
    );
    
    return enrichedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
}
