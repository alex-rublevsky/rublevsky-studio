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

interface QueryRow {
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
  variation: {
    id: number | null;
    sku: string | null;
    price: number | null;
    stock: number | null;
    sort: number | null;
    attributeId: number | null;
    attributeValue: string | null;
  };
}

// Function to fetch product from database
async function fetchProduct(slug: string): Promise<ProductWithDetails | null> {
  try {
    if (!slug) {
      throw new Error("Slug parameter is required");
    }
    
    // Execute a single efficient query to get all related data
    const result = await db
      .select({
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          categorySlug: products.categorySlug,
          brandSlug: products.brandSlug,
          stock: products.stock,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          discount: products.discount,
          hasVariations: products.hasVariations,
          weight: products.weight,
          images: products.images,
          createdAt: products.createdAt,
          unlimitedStock: products.unlimitedStock
        },
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
        variation: {
          id: productVariations.id,
          sku: productVariations.sku,
          price: productVariations.price,
          stock: productVariations.stock,
          sort: productVariations.sort,
          attributeId: variationAttributes.attributeId,
          attributeValue: variationAttributes.value
        }
      })
      .from(products)
      .where(eq(products.slug, slug))
      .leftJoin(categories, eq(products.categorySlug, categories.slug))
      .leftJoin(brands, eq(products.brandSlug, brands.slug))
      .leftJoin(blogPosts, eq(blogPosts.productSlug, products.slug))
      .leftJoin(productVariations, eq(productVariations.productId, products.id))
      .leftJoin(
        variationAttributes,
        eq(variationAttributes.productVariationId, productVariations.id)
      )
      .all();
    
    if (!result.length) {
      return null;
    }

    // Get the first row for base product data
    const firstRow = result[0];
    
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

      result.forEach((row: QueryRow) => {
        if (row.variation.id) {
          if (!variationsMap.has(row.variation.id)) {
            variationsMap.set(row.variation.id, {
              id: row.variation.id,
              sku: row.variation.sku,
              price: row.variation.price,
              stock: row.variation.stock,
              sort: row.variation.sort,
              attributes: []
            });
          }

          if (row.variation.attributeId && row.variation.attributeValue) {
            const variation = variationsMap.get(row.variation.id);
            variation.attributes.push({
              attributeId: row.variation.attributeId,
              value: row.variation.attributeValue
            });
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
      revalidate: 1, // TODO: change to 259200
      tags: ['products', `product-${slug}`] // Tags for cache invalidation
    }
  )();
}
