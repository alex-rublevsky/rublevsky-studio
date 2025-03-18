'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import db from "@/server/db";
import { products, productVariations, variationAttributes, productTeaCategories } from "@/server/schema";
import { Product, ProductFormData } from "@/types";

/**
 * Server action to update an existing product with variations
 */
export default async function updateProduct(id: number, data: ProductFormData): Promise<Product> {
  try {
    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      throw new Error("Name, slug, and price are required");
    }

    // Check if we're in production/Workers environment
    const isProduction = typeof process === 'undefined' || typeof globalThis.caches !== 'undefined';
    
    // Choose the appropriate database instance
    const database = isProduction 
      ? drizzle((globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB as D1Database)
      : db;

    if (isProduction && !(globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB) {
      throw new Error('Database binding not found in Cloudflare context');
    }

    // Check if product exists and if slug is unique
    const [existingProduct, duplicateSlug] = await Promise.all([
      database.select().from(products).where(eq(products.id, id)).get(),
      database.select().from(products).where(eq(products.slug, data.slug)).get()
    ]);

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new Error("A product with this slug already exists");
    }

    // Handle images
    let imageString = existingProduct.images || '';
    if (data.images) {
      if (typeof data.images === 'string' && data.images.trim() !== '') {
        imageString = data.images.trim();
      } else if (Array.isArray(data.images)) {
        imageString = data.images.join(',');
      }
    }

    if (isProduction) {
      // Production: Use D1's native batch API
      const d1 = (globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB;

      // Execute all statements in a batch
      await d1.batch([
        // Update product
        d1.prepare(`
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
        d1.prepare(`
          DELETE FROM product_tea_categories 
          WHERE product_id = ?
        `).bind(id),

        // Add tea categories if they exist
        ...(data.teaCategories?.length ? [
          d1.prepare(`
            INSERT INTO product_tea_categories (product_id, tea_category_slug)
            VALUES ${data.teaCategories.map(() => '(?, ?)').join(', ')}
          `).bind(
            ...data.teaCategories.flatMap(slug => [id, slug])
          )
        ] : []),

        // Handle variations if they exist
        ...(data.hasVariations && data.variations?.length ? [
          // Delete existing variations and their attributes
          d1.prepare(`
            DELETE FROM variation_attributes 
            WHERE product_variation_id IN (
              SELECT id FROM product_variations WHERE product_id = ?
            )
          `).bind(id),
          d1.prepare(`
            DELETE FROM product_variations 
            WHERE product_id = ?
          `).bind(id),

          // Insert new variations
          d1.prepare(`
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
    } else {
      // Development: Use Drizzle's transaction API
      await database.transaction(async (tx: BetterSQLite3Database) => {
        // Update product
        await tx
          .update(products)
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
          .where(eq(products.id, id));

        // Handle tea categories
        await tx.delete(productTeaCategories)
          .where(eq(productTeaCategories.productId, id));

        if (data.teaCategories?.length) {
          await tx.insert(productTeaCategories)
            .values(
              data.teaCategories.map(slug => ({
                productId: id,
                teaCategorySlug: slug
              }))
            );
        }

        // Handle variations
        if (data.hasVariations && data.variations?.length) {
          // Delete existing variations and their attributes
          await tx.delete(variationAttributes)
            .where(
              eq(variationAttributes.productVariationId,
                tx.select({ id: productVariations.id })
                  .from(productVariations)
                  .where(eq(productVariations.productId, id))
                  .limit(1)
              )
            );
          
          await tx.delete(productVariations)
            .where(eq(productVariations.productId, id));

          // Insert new variations
          await tx.insert(productVariations)
            .values(
              data.variations.map(v => ({
                productId: id,
                sku: v.sku,
                price: parseFloat(v.price.toString()),
                stock: parseInt(v.stock.toString()),
                sort: v.sort,
                createdAt: new Date()
              }))
            );
        }
      });
    }

    // Return the updated product
    const updatedProduct = await database.select().from(products).where(eq(products.id, id)).get();
    
    // Add parsedImages field for frontend compatibility
    if (updatedProduct && updatedProduct.images) {
      (updatedProduct as any).parsedImages = updatedProduct.images.split(',').filter(Boolean);
    } else {
      (updatedProduct as any).parsedImages = [];
    }
    
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
} 
