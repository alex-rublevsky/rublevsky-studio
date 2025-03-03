'use server';

import { eq } from "drizzle-orm";
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

export default async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  try {
    if (!slug) {
      throw new Error("Slug parameter is required");
    }
    
    // Get product by slug with category and brand information
    const product = await db
      .select({
        products: products,
        categories: {
          name: categories.name,
          slug: categories.slug
        },
        brands: {
          name: brands.name,
          slug: brands.slug
        }
      })
      .from(products)
      .where(eq(products.slug, slug))
      .leftJoin(categories, eq(products.categorySlug, categories.slug))
      .leftJoin(brands, eq(products.brandSlug, brands.slug))
      .get();
    
    if (!product) {
      return null;
    }
    
    // Format the response to include category and brand names
    const formattedProduct: ProductWithDetails = {
      ...product.products,
      category: product.categories ? {
        name: product.categories.name,
        slug: product.categories.slug
      } : null,
      brand: product.brands ? {
        name: product.brands.name,
        slug: product.brands.slug
      } : null
    };
    
    // Look for a related blog post using productSlug
    const relatedBlogPost = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        body: blogPosts.body
      })
      .from(blogPosts)
      .where(eq(blogPosts.productSlug, slug))
      .get();
    
    if (relatedBlogPost) {
      formattedProduct.blogPost = {
        ...relatedBlogPost,
        blogUrl: `/blog#${relatedBlogPost.slug}`
      };
      
      // Always use blog post body as description when available
      formattedProduct.description = relatedBlogPost.body;
    }
    
    // If product has variations, fetch them
    if (formattedProduct.hasVariations) {
      const variations = await db
        .select()
        .from(productVariations)
        .where(eq(productVariations.productId, formattedProduct.id))
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
      
      formattedProduct.variations = variations;
    }
    
    return formattedProduct;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
}
