'use server';

import { eq } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import db from "@/server/db";
import { products, categories, brands, productVariations, variationAttributes, blogPosts } from "@/server/schema";
import { Product } from "@/types";

interface ProductWithDetails extends Product {
  category?: {
    name: string;
    slug: string;
  } | null;
  brand?: {
    name: string;
    slug: string;
  } | null;
  variations?: any[];
  blogPost?: {
    id: number;
    title: string;
    slug: string;
    body: string;
    blogUrl: string;
  } | null;
}

interface QueryResult {
  product: Product;
  category: {
    name: string;
    slug: string;
  } | null;
  brand: {
    name: string;
    slug: string;
  } | null;
  blogPost: {
    id: number;
    title: string;
    slug: string;
    body: string;
  } | null;
  variation: any;
  attributes: any;
}

// Function to fetch product from database
async function fetchProduct(slug: string): Promise<ProductWithDetails | null> {
  try {
    if (!slug) {
      throw new Error("Slug parameter is required");
    }
    
    // Execute a single query to get all related data
    const result = await db
      .select({
        product: products,
        category: {
          name: categories.name,
          slug: categories.slug
        },
        brand: {
          name: brands.name,
          slug: brands.slug
        },
        blogPost: {
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          body: blogPosts.body
        },
        variation: productVariations,
        attributes: variationAttributes
      })
      .from(products)
      .where(eq(products.slug, slug))
      .leftJoin(categories, eq(products.categorySlug, categories.slug))
      .leftJoin(brands, eq(products.brandSlug, brands.slug))
      .leftJoin(blogPosts, eq(blogPosts.productSlug, products.slug))
      .leftJoin(productVariations, eq(productVariations.productId, products.id))
      .leftJoin(
        variationAttributes,
        productVariations.id
          ? eq(variationAttributes.productVariationId, productVariations.id)
          : undefined
      )
      .all();
    
    if (!result.length) {
      return null;
    }

    // Get the first row for base product data
    const firstRow = result[0] as QueryResult;
    
    // Format the base product with category and brand
    const formattedProduct: ProductWithDetails = {
      ...firstRow.product,
      category: firstRow.category ? {
        name: firstRow.category.name,
        slug: firstRow.category.slug
      } : null,
      brand: firstRow.brand ? {
        name: firstRow.brand.name,
        slug: firstRow.brand.slug
      } : null
    };

    // Add blog post if exists
    if (firstRow.blogPost) {
      formattedProduct.blogPost = {
        ...firstRow.blogPost,
        blogUrl: `/blog#${firstRow.blogPost.slug}`
      };
      // Use blog post body as description when available
      formattedProduct.description = firstRow.blogPost.body;
    }

    // Process variations and attributes if product has variations
    if (formattedProduct.hasVariations) {
      const variationsMap = new Map();

      (result as QueryResult[]).forEach(row => {
        if (row.variation) {
          if (!variationsMap.has(row.variation.id)) {
            variationsMap.set(row.variation.id, {
              ...row.variation,
              attributes: []
            });
          }

          if (row.attributes) {
            const variation = variationsMap.get(row.variation.id);
            if (!variation.attributes.find((attr: any) => attr.id === row.attributes.id)) {
              variation.attributes.push(row.attributes);
            }
          }
        }
      });

      formattedProduct.variations = Array.from(variationsMap.values());
    }
    
    return formattedProduct;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
}

// Cached version of getProductBySlug
export default async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  return unstable_cache(
    async () => fetchProduct(slug),
    ['product', slug],
    {
      revalidate: 259200, // Cache for 3 days
      tags: ['products', `product-${slug}`] // Tags for cache invalidation
    }
  )();
}
