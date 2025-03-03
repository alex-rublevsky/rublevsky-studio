'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { products, productVariations, variationAttributes } from "@/server/schema";
import { Product } from "@/types";

/**
 * Server action to fetch a product by ID with variations
 * @param id - The ID of the product to fetch
 * @returns The product object with variations or null if not found
 */
export default async function getProductById(id: number): Promise<Product | null> {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }
    
    // Get product by ID
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .get();
    
    if (!product) {
      return null;
    }
    
    // Get product variations if hasVariations is true
    if (product.hasVariations) {
      const variations = await db
        .select()
        .from(productVariations)
        .where(eq(productVariations.productId, id))
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
      
      product.variations = variations;
    }
    
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
} 