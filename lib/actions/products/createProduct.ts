'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { products, productVariations, variationAttributes } from "@/server/schema";
import { Product, ProductFormData } from "@/types";

/**
 * Server action to create a new product with variations
 * @param data - The product data to create
 * @returns The created product object
 */
export default async function createProduct(data: ProductFormData): Promise<Product> {
  try {
    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      throw new Error("Name, slug, and price are required");
    }

    // Check if slug already exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, data.slug))
      .get();

    if (existingProduct) {
      throw new Error("A product with this slug already exists");
    }

    // Insert the product
    const result = await db
      .insert(products)
      .values({
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning()
      .get();

    // If product has variations, insert them into the productVariations table
    if (data.hasVariations && data.variations && data.variations.length > 0) {
      for (const variation of data.variations) {
        // Insert the variation
        const variationResult = await db
          .insert(productVariations)
          .values({
            productId: result.id,
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
    }

    return result;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
} 