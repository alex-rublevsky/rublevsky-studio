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

    // Handle images: convert array to comma-separated string or keep existing
    let imageString = existingProduct.images || '';
    if (data.images) {
      // If images is a string and not empty, use it directly
      if (typeof data.images === 'string' && data.images.trim() !== '') {
        imageString = data.images.trim();
      }
      // If images is an array, join it with commas
      else if (Array.isArray(data.images)) {
        imageString = data.images.join(',');
      }
    }

    // Check if we're in production/Workers environment
    const isProduction = typeof process === 'undefined' || typeof globalThis.caches !== 'undefined';

    if (isProduction) {
      // In production, use D1's native transaction API
      // @ts-ignore - Cloudflare Workers specific
      const context = globalThis[Symbol.for("__cloudflare-context__")];
      if (!context?.env?.DB) throw new Error('Database binding not found in Cloudflare context');

      return await context.env.DB.prepare('SELECT 1').bind().first().then(async () => {
        return await context.env.DB.batch([
          // Update product
          context.env.DB.prepare(`
            UPDATE products 
            SET name = ?, slug = ?, description = ?, price = ?, category_slug = ?, 
                brand_slug = ?, stock = ?, is_active = ?, is_featured = ?, 
                discount = ?, has_variations = ?, weight = ?, images = ?
            WHERE id = ?
          `).bind(
            data.name,
            data.slug,
            data.description,
            parseFloat(data.price),
            data.categorySlug,
            data.brandSlug,
            parseInt(data.stock),
            data.isActive ? 1 : 0,
            data.isFeatured ? 1 : 0,
            data.discount,
            data.hasVariations ? 1 : 0,
            data.weight || null,
            imageString,
            id
          ),

          // Delete existing tea categories
          context.env.DB.prepare(`
            DELETE FROM product_tea_categories 
            WHERE product_id = ?
          `).bind(id),

          ...(data.teaCategories?.length ? [
            // Insert new tea categories
            context.env.DB.prepare(`
              INSERT INTO product_tea_categories (product_id, tea_category_slug, created_at)
              VALUES ${data.teaCategories.map(() => '(?, ?, ?)').join(', ')}
            `).bind(
              ...data.teaCategories.flatMap(slug => [id, slug, new Date().toISOString()])
            )
          ] : []),

          // Handle variations if they exist
          ...(data.hasVariations && data.variations?.length ? [
            // Delete existing variations and their attributes
            context.env.DB.prepare(`
              DELETE FROM variation_attributes 
              WHERE product_variation_id IN (
                SELECT id FROM product_variations WHERE product_id = ?
              )
            `).bind(id),
            context.env.DB.prepare(`
              DELETE FROM product_variations 
              WHERE product_id = ?
            `).bind(id),
            // Insert new variations
            context.env.DB.prepare(`
              INSERT INTO product_variations (product_id, sku, price, stock, sort, "createdAt")
              VALUES ${data.variations.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}
            `).bind(
              ...data.variations.flatMap(v => [
                id,
                v.sku,
                parseFloat(v.price.toString()),
                parseInt(v.stock.toString()),
                v.sort,
                new Date().toISOString()
              ])
            )
          ] : [])
        ]);
      }).then(async () => {
        // Return the updated product
        const updatedProduct = await db.select().from(products).where(eq(products.id, id)).get();
        
        // Add parsedImages field for frontend compatibility
        if (updatedProduct && updatedProduct.images) {
          (updatedProduct as any).parsedImages = updatedProduct.images.split(',').filter(Boolean);
        } else {
          (updatedProduct as any).parsedImages = [];
        }
        
        return updatedProduct;
      });
    } else {
      // In development, use Drizzle's transaction API
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
            images: imageString
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
              createdAt: new Date()
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

        // Add parsedImages field for frontend compatibility
        if (product && product.images) {
          (product as any).parsedImages = product.images.split(',').filter(Boolean);
        } else {
          (product as any).parsedImages = [];
        }

        return product;
      });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
} 
