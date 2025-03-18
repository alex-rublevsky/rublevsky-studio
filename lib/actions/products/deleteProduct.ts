'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
import db from "@/server/db";
import { products, productVariations, variationAttributes, productTeaCategories } from "@/server/schema";

/**
 * Server action to delete a product and its variations
 * @param id - The ID of the product to delete
 * @returns A success message
 */
export default async function deleteProduct(id: number): Promise<{ message: string }> {
  try {
    if (!id) {
      throw new Error("Product ID is required");
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

    if (isProduction) {
      // Production: Use D1's native batch API
      const d1 = (globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB;

      // Execute all statements in a batch
      await d1.batch([
        // Delete variation attributes first
        d1.prepare(`
          DELETE FROM variation_attributes 
          WHERE product_variation_id IN (
            SELECT id FROM product_variations WHERE product_id = ?
          )
        `).bind(id),

        // Delete variations
        d1.prepare(`
          DELETE FROM product_variations 
          WHERE product_id = ?
        `).bind(id),

        // Delete tea categories
        d1.prepare(`
          DELETE FROM product_tea_categories 
          WHERE product_id = ?
        `).bind(id),

        // Delete the product itself and check if it existed
        d1.prepare(`
          DELETE FROM products 
          WHERE id = ?
          RETURNING id
        `).bind(id)
      ]);

    } else {
      // Development: Use Drizzle's APIs
      await Promise.all([
        // Delete variation attributes and tea categories in parallel
        db.delete(variationAttributes)
          .where(
            eq(variationAttributes.productVariationId,
              db.select({ id: productVariations.id })
                .from(productVariations)
                .where(eq(productVariations.productId, id))
                .limit(1)
            )
          ),
        db.delete(productTeaCategories)
          .where(eq(productTeaCategories.productId, id))
      ]);

      // Delete variations
      await db.delete(productVariations)
        .where(eq(productVariations.productId, id));

      // Delete the product itself
      const deletedProduct = await db.delete(products)
        .where(eq(products.id, id))
        .returning();

      if (!deletedProduct.length) {
        throw new Error("Product not found");
      }
    }

    return { message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${(error as Error).message}`);
  }
} 