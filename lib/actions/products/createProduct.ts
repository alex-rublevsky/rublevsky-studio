'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import db from "@/server/db";
import { products, productVariations, productTeaCategories } from "@/server/schema";
import { Product, ProductFormData } from "@/types";

/**
 * Server action to create a new product with variations
 * @param data - The product data to create
 * @returns The created product object
 */
export default async function createProduct(data: ProductFormData): Promise<Product> {
  try {
    // Validate required fields
    if (!data.name || !data.slug || !data.price || !data.categorySlug) {
      throw new Error("Name, slug, price, and category are required");
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

    // Check if slug already exists
    const existingProduct = await database
      .select()
      .from(products)
      .where(eq(products.slug, data.slug))
      .get();

    if (existingProduct) {
      throw new Error("A product with this slug already exists");
    }

    // Format images string with proper type checking
    let imageString = '';
    if (typeof data.images === 'string') {
      imageString = data.images.trim();
    } else if (Array.isArray(data.images)) {
      imageString = (data.images as string[]).join(',');
    }

    if (isProduction) {
      const d1 = (globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB;

      // Create the product first
      const result = await d1.prepare(`
        INSERT INTO products (
          name, slug, description, price, category_slug, brand_slug,
          stock, is_active, is_featured, discount, has_variations,
          weight, images, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
        data.name,
        data.slug,
        data.description,
        parseFloat(data.price),
        data.categorySlug,
        data.brandSlug || null,
        parseInt(data.stock),
        data.isActive ? 1 : 0,
        data.isFeatured ? 1 : 0,
        data.discount,
        data.hasVariations ? 1 : 0,
        data.weight || null,
        imageString,
        new Date().toISOString()
      ).first();

      if (!result) {
        throw new Error("Failed to create product");
      }

      const productId = result.id;

      // Insert tea categories if they exist
      if (data.teaCategories?.length) {
        await d1.prepare(`
          INSERT INTO product_tea_categories (product_id, tea_category_slug)
          VALUES ${data.teaCategories.map(() => '(?, ?)').join(', ')}
        `).bind(
          ...data.teaCategories.flatMap(slug => [productId, slug])
        ).run();
      }

      // Insert variations if they exist
      if (data.hasVariations && data.variations?.length) {
        await d1.prepare(`
          INSERT INTO product_variations (product_id, sku, price, stock, sort, created_at)
          VALUES ${data.variations.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}
        `).bind(
          ...data.variations.flatMap(v => [
            productId,
            v.sku,
            parseFloat(v.price.toString()),
            parseInt(v.stock.toString()),
            v.sort,
            new Date().toISOString()
          ])
        ).run();
      }

      return result as Product;
    } else {
      // Development: Use Drizzle's transaction API
      return await database.transaction(async (tx: BetterSQLite3Database) => {
        // Create the product first
        const product = await tx.insert(products).values({
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: parseFloat(data.price),
          categorySlug: data.categorySlug,
          brandSlug: data.brandSlug || null,
          stock: parseInt(data.stock),
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          discount: data.discount,
          hasVariations: data.hasVariations,
          weight: data.weight || null,
          images: imageString,
          createdAt: new Date()
        }).returning().get();

        // Insert tea categories if they exist
        if (data.teaCategories?.length) {
          await tx.insert(productTeaCategories).values(
            data.teaCategories.map(slug => ({
              productId: product.id,
              teaCategorySlug: slug
            }))
          );
        }

        // Insert variations if they exist
        if (data.hasVariations && data.variations?.length) {
          await tx.insert(productVariations).values(
            data.variations.map(v => ({
              productId: product.id,
              sku: v.sku,
              price: parseFloat(v.price.toString()),
              stock: parseInt(v.stock.toString()),
              sort: v.sort,
              createdAt: new Date()
            }))
          );
        }

        return product;
      });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
} 