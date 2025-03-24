'use server';

import { eq, and } from "drizzle-orm";
import db from "@/server/db";
import { products, productVariations, variationAttributes, productTeaCategories } from "@/server/schema";
import { Product, ProductFormData } from "@/types";

/**
 * Server action to update an existing product with variations
 */
export default async function updateProduct(id: number, data: ProductFormData): Promise<Product> {
  try {
    if (!data.name || !data.slug || !data.price) {
      throw new Error("Name, slug, and price are required");
    }

    // Fetch existing product and check for duplicate slug in parallel
    const [product, duplicateSlug] = await Promise.all([
      db.select().from(products).where(eq(products.id, id)).get(),
      db.select().from(products).where(eq(products.slug, data.slug)).get()
    ]);

    if (!product) throw new Error("Product not found");
    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new Error("A product with this slug already exists");
    }

    // Process images - data.images is already a string according to ProductFormData
    const imageString = data.images?.trim() || product.images || '';

    // Update product and related data in parallel
    await Promise.all([
      // Update main product
      db.update(products)
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
          images: imageString
        })
        .where(eq(products.id, id)),

      // Handle tea categories
      (async () => {
        await db.delete(productTeaCategories)
          .where(eq(productTeaCategories.productId, id));

        if (data.teaCategories?.length) {
          await db.insert(productTeaCategories)
            .values(data.teaCategories.map(slug => ({
              productId: id,
              teaCategorySlug: slug
            })));
        }
      })(),

      // Handle variations
      (async () => {
        if (data.hasVariations && data.variations?.length) {
          // Get all variation IDs for this product
          const variations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.productId, id));

          // Delete old variations and their attributes
          if (variations.length > 0) {
            await Promise.all([
              db.delete(variationAttributes)
                .where(and(...variations.map(v => 
                  eq(variationAttributes.productVariationId, v.id)
                ))),
              db.delete(productVariations)
                .where(eq(productVariations.productId, id))
            ]);
          }

          // Insert new variations
          await db.insert(productVariations)
            .values(data.variations.map(v => ({
              productId: id,
              sku: v.sku,
              price: parseFloat(v.price.toString()),
              stock: parseInt(v.stock.toString()),
              sort: v.sort,
              createdAt: new Date()
            })));
        }
      })()
    ]);

    // Fetch and return updated product
    const updatedProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .get();

    return {
      ...updatedProduct,
      parsedImages: updatedProduct?.images ? updatedProduct.images.split(',').filter(Boolean) : []
    } as Product;
  } catch (error) {
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
} 
