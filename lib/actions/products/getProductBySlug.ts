'use server';

import { eq } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import db from "@/server/db";
import { products, categories, brands, productVariations, variationAttributes, blogPosts } from "@/server/schema";
import { Product, ProductVariationWithAttributes } from "@/types";

interface ProductWithDetails extends Product {
  category?: {
    name: string;
    slug: string;
  } | null;
  brand?: {
    name: string;
    slug: string;
  } | null;
  variations?: ProductVariationWithAttributes[];
  blogPost?: {
    id: number;
    title: string;
    slug: string;
    body: string;
    blogUrl: string;
  } | null;
}

/**
 * Fetch a product by slug with all its related data
 * Since most products have both variations and blog posts,
 * we use a single efficient JOIN query to get all data at once
 */
async function fetchProduct(slug: string): Promise<ProductWithDetails | null> {
  try {
    if (!slug) {
      throw new Error("Slug parameter is required");
    }
    
    // Get all product data in a single efficient query
    const result = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .leftJoin(categories, eq(products.categorySlug, categories.slug))
      .leftJoin(brands, eq(products.brandSlug, brands.slug))
      .leftJoin(blogPosts, eq(blogPosts.productSlug, products.slug))
      .leftJoin(productVariations, eq(productVariations.productId, products.id))
      .leftJoin(variationAttributes, eq(variationAttributes.productVariationId, productVariations.id))
      .all();

    if (!result.length) {
      return null;
    }

    const firstRow = result[0];
    const baseProduct = firstRow.products;
    
    // Process variations and their attributes
    const variationsMap = new Map();
    
    result.forEach(row => {
      if (!row.product_variations) return;
      
      const variationId = row.product_variations.id;
      if (!variationsMap.has(variationId)) {
        variationsMap.set(variationId, {
          id: variationId,
          productId: row.product_variations.productId,
          sku: row.product_variations.sku,
          price: row.product_variations.price,
          stock: row.product_variations.stock,
          sort: row.product_variations.sort || 0,
          createdAt: row.product_variations.createdAt,
          attributes: []
        });
      }

      if (row.variation_attributes) {
        variationsMap.get(variationId)!.attributes.push({
          id: row.variation_attributes.id,
          productVariationId: row.variation_attributes.productVariationId,
          attributeId: row.variation_attributes.attributeId,
          value: row.variation_attributes.value,
          createdAt: row.variation_attributes.createdAt
        });
      }
    });

    // Construct the final response
    return {
      ...baseProduct,
      category: firstRow.categories ? {
        name: firstRow.categories.name,
        slug: firstRow.categories.slug
      } : null,
      brand: firstRow.brands ? {
        name: firstRow.brands.name,
        slug: firstRow.brands.slug
      } : null,
      blogPost: firstRow.blog_posts && firstRow.blog_posts.title ? {
        id: firstRow.blog_posts.id,
        title: firstRow.blog_posts.title,
        slug: firstRow.blog_posts.slug,
        body: firstRow.blog_posts.body || '',
        blogUrl: `/blog#${firstRow.blog_posts.slug}`
      } : null,
      description: (firstRow.blog_posts?.body) || baseProduct.description,
      variations: Array.from(variationsMap.values())
    };
  } catch (error) {
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
}

// Cached version of getProductBySlug
export default async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  return unstable_cache(
    async () => fetchProduct(slug),
    ['product', slug],
    {
      revalidate: 1, // TODO: change to 259200 (3 days)
      tags: ['products', `product-${slug}`] // Tags for cache invalidation
    }
  )();
}
