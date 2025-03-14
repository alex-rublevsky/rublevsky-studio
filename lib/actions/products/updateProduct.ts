'use server';

import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import db from "@/server/db";
import { products, productVariations, variationAttributes, productTeaCategories } from "@/server/schema";
import { Product, ProductFormData } from "@/types";

/**
 * Server action to update an existing product with variations
 * @param id - The ID of the product to update
 * @param data - The updated product data
 * @returns The updated product object
 */
export default async function updateProduct(id: number, data: ProductFormData): Promise<Product> {
  try {
    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      throw new Error("Name, slug, and price are required");
    }

    // Check if product exists and if slug is unique (run concurrently for efficiency)
    const [existingProduct, duplicateSlug] = await Promise.all([
      db.select().from(products).where(eq(products.id, id)).get(),
      db.select().from(products).where(eq(products.slug, data.slug)).get()
    ]);

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new Error("A product with this slug already exists");
    }

    // Use a transaction for all updates
    return await db.transaction(async (tx: BetterSQLite3Database) => {
      // Update the product
      const product = await tx.update(products)
        .set({
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
          images: data.images
        })
        .where(eq(products.id, id))
        .returning()
        .get();

      // Delete existing tea categories and insert new ones if provided
      await tx.delete(productTeaCategories)
        .where(eq(productTeaCategories.productId, id))
        .run();

      if (data.teaCategories?.length) {
        await tx.insert(productTeaCategories).values(
          data.teaCategories.map(teaCategorySlug => ({
            productId: id,
            teaCategorySlug,
            createdAt: new Date().toISOString()
          }))
        ).run();
      }

      // Handle variations if they exist
      if (data.hasVariations && data.variations?.length) {
        // Delete existing variations and their attributes
        const existingVariations = await tx.select()
          .from(productVariations)
          .where(eq(productVariations.productId, id))
          .all();

        if (existingVariations.length) {
          await Promise.all([
            tx.delete(variationAttributes)
              .where(eq(variationAttributes.productVariationId, existingVariations[0].id))
              .run(),
            tx.delete(productVariations)
              .where(eq(productVariations.productId, id))
              .run()
          ]);
        }

        // Insert new variations
        const variations = await tx.insert(productVariations).values(
          data.variations.map(variation => ({
            productId: id,
            sku: variation.sku,
            price: parseFloat(variation.price.toString()),
            stock: parseInt(variation.stock.toString()),
            sort: variation.sort,
            createdAt: new Date().toISOString(),
          }))
        ).returning().all();

        // Prepare all attributes for batch insert
        const allAttributes = variations.flatMap((variation: typeof productVariations.$inferSelect, index: number) => {
          const variationData = data.variations[index];
          return (variationData.attributes || []).map(attr => ({
            productVariationId: variation.id,
            attributeId: attr.attributeId,
            value: attr.value,
            createdAt: new Date().toISOString(),
          }));
        });

        // Batch insert all attributes if there are any
        if (allAttributes.length) {
          await tx.insert(variationAttributes).values(allAttributes).run();
        }
      }

      return product;
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
} 