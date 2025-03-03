'use server';

import { eq, and, ne } from "drizzle-orm";
import db from "@/server/db";
import { products, productVariations, variationAttributes } from "@/server/schema";
import { Product, ProductFormData } from "@/types";

/**
 * Server action to update a product with variations
 * @param id - The ID of the product to update
 * @param data - The product data to update
 * @returns The updated product object
 */
export default async function updateProduct(id: number, data: ProductFormData): Promise<Product> {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }
    
    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      throw new Error("Name, slug, and price are required");
    }
    
    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .get();
    
    if (!existingProduct) {
      throw new Error("Product not found");
    }
    
    // Check if slug already exists for another product
    const existingSlug = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, data.slug), ne(products.id, id)))
      .get();
    
    if (existingSlug) {
      throw new Error("Another product with this slug already exists");
    }
    
    // Update the product
    const result = await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: parseFloat(data.price),
        categorySlug: data.categorySlug || null,
        brandSlug: data.brandSlug || null,
        stock: parseInt(data.stock || "0"),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        onSale: data.onSale,
        hasVariations: data.hasVariations,
        hasVolume: data.hasVolume,
        volume: data.volume || null,
        images: data.images || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id))
      .returning()
      .get();
    
    // If product has variations, update them
    if (data.hasVariations && data.variations && data.variations.length > 0) {
      // First, delete existing variations for this product
      await db
        .delete(productVariations)
        .where(eq(productVariations.productId, id))
        .run();

      // Then insert the new variations
      for (const variation of data.variations) {
        // Insert the variation
        const variationResult = await db
          .insert(productVariations)
          .values({
            productId: id,
            sku: variation.sku,
            price: parseFloat(variation.price.toString()),
            stock: parseInt(variation.stock.toString()),
            sort: variation.sort,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning()
          .get();

        // Insert the variation attributes
        if (variation.attributes && variation.attributes.length > 0) {
          for (const attribute of variation.attributes) {
            await db
              .insert(variationAttributes)
              .values({
                productVariationId: variationResult.id,
                name: attribute.name,
                value: attribute.value,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .run();
          }
        }
      }
    } else if (!data.hasVariations) {
      // If product no longer has variations, delete existing ones
      await db
        .delete(productVariations)
        .where(eq(productVariations.productId, id))
        .run();
    }
    
    return result;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
} 