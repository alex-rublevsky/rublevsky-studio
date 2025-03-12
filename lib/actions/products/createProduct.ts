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
    const product = await db.insert(products).values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: parseFloat(data.price),
      categorySlug: data.categorySlug,
      brandSlug: data.brandSlug,
      stock: parseInt(data.stock),
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      discount: data.discount,
      hasVariations: data.hasVariations,
      weight: data.weight || null,
      images: data.images,
      createdAt: new Date().toISOString()
    }).returning();

    // If product has variations, insert them into the productVariations table
    if (data.hasVariations && data.variations && data.variations.length > 0) {
      for (const variation of data.variations) {
        // Insert the variation
        const variationResult = await db
          .insert(productVariations)
          .values({
            productId: product.id,
            sku: variation.sku,
            price: parseFloat(variation.price.toString()),
            stock: parseInt(variation.stock.toString()),
            sort: variation.sort,
            createdAt: new Date().toISOString(),
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
                name: attribute.attributeId,
                value: attribute.value,
                createdAt: new Date().toISOString(),
              })
              .run();
          }
        }
      }
    }

    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
} 