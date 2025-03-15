'use server';

import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import db from "@/server/db";
import { products, productVariations, variationAttributes, productTeaCategories } from "@/server/schema";
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

    // Check if slug already exists (this needs to be a separate query for data integrity)
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, data.slug))
      .get();

    if (existingProduct) {
      throw new Error("A product with this slug already exists");
    }

    // Use a transaction for all inserts
    return await db.transaction(async (tx: BetterSQLite3Database) => {
      // Insert the product
      const product = await tx.insert(products).values({
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
        createdAt: new Date()
      }).returning().get();

      // Batch insert tea categories if provided
      if (data.teaCategories?.length) {
        await tx.insert(productTeaCategories).values(
          data.teaCategories.map(teaCategorySlug => ({
            productId: product.id,
            teaCategorySlug,
            createdAt: new Date()
          }))
        ).run();
      }

      // Batch insert variations and their attributes if they exist
      if (data.hasVariations && data.variations?.length) {
        // Insert all variations in a batch
        const variations = await tx.insert(productVariations).values(
          data.variations.map(variation => ({
            productId: product.id,
            sku: variation.sku,
            price: parseFloat(variation.price.toString()),
            stock: parseInt(variation.stock.toString()),
            sort: variation.sort,
            createdAt: new Date(),
          }))
        ).returning().all();

        // Prepare all attributes for batch insert
        const allAttributes = variations.flatMap((variation: typeof productVariations.$inferSelect, index: number) => {
          const variationData = data.variations[index];
          return (variationData.attributes || []).map(attr => ({
            productVariationId: variation.id,
            attributeId: attr.attributeId,
            value: attr.value,
            createdAt: new Date(),
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
    console.error("Error creating product:", error);
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
} 