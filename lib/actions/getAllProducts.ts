'use server';

import { eq, desc, and } from "drizzle-orm";
import db from "@/server/db";
import { products, categories, brands, productVariations, variationAttributes } from "@/server/schema";
import { Product } from "@/types";

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
}: GetAllProductsOptions = {}): Promise<Product[]> {
  try {
    // Build the query
    let query = db
      .select()
      .from(products)
      .where(eq(products.isActive, true));
    
    // Add filters
    if (categorySlug) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .get();
      
      if (category) {
        query = query.where(eq(products.categoryId, category.id));
      }
    }
    
    if (brandSlug) {
      const brand = await db
        .select()
        .from(brands)
        .where(eq(brands.slug, brandSlug))
        .get();
      
      if (brand) {
        query = query.where(eq(products.brandId, brand.id));
      }
    }
    
    if (featured) {
      query = query.where(eq(products.isFeatured, true));
    }
    
    // Order by newest first and limit results
    query = query.orderBy(desc(products.createdAt)).limit(limit);
    
    // Execute the query
    const productList = await query.all();
    
    // Fetch variations for products that have them
    const productsWithVariations = await Promise.all(
      productList.map(async (product: Product) => {
        if (product.hasVariations) {
          const variations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.productId, product.id))
            .all();
          
          // Get attributes for each variation
          for (const variation of variations) {
            const attributes = await db
              .select()
              .from(variationAttributes)
              .where(eq(variationAttributes.productVariationId, variation.id))
              .all();
            
            variation.attributes = attributes;
          }
          
          return { ...product, variations };
        }
        
        return product;
      })
    );
    
    return productsWithVariations;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
}
