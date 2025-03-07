'use server';

import db from "@/server/db";
import { products, productVariations } from "@/server/schema";
import { eq } from "drizzle-orm";

export interface StockValidationResult {
  isAvailable: boolean;
  availableStock: number;
  unlimitedStock: boolean;
}

/**
 * Validates if a product or variation has sufficient stock
 * This is a server action that can be called from client components
 */
export async function validateStock(
  productId: number,
  requestedQuantity: number = 1,
  variationId?: number
): Promise<StockValidationResult> {
  try {
    // First, check if the product has unlimited stock
    const product = await db
      .select({
        unlimitedStock: products.unlimitedStock,
        hasVariations: products.hasVariations,
        stock: products.stock,
      })
      .from(products)
      .where(eq(products.id, productId))
      .get();

    if (!product) {
      return { isAvailable: false, availableStock: 0, unlimitedStock: false };
    }

    // If product has unlimited stock, it's always available regardless of variations
    if (product.unlimitedStock) {
      return {
        isAvailable: true,
        availableStock: Number.MAX_SAFE_INTEGER,
        unlimitedStock: true
      };
    }

    // If we have a variation ID, check the variation stock
    if (variationId) {
      const variation = await db
        .select({ stock: productVariations.stock })
        .from(productVariations)
        .where(eq(productVariations.id, variationId))
        .get();

      if (!variation) {
        return { isAvailable: false, availableStock: 0, unlimitedStock: false };
      }

      return {
        isAvailable: variation.stock >= requestedQuantity,
        availableStock: variation.stock,
        unlimitedStock: false
      };
    }

    // If product has variations but no variation ID was provided
    if (product.hasVariations && !variationId) {
      return { isAvailable: false, availableStock: 0, unlimitedStock: false };
    }

    // Check product stock for non-variation products
    return {
      isAvailable: product.stock >= requestedQuantity,
      availableStock: product.stock,
      unlimitedStock: false
    };
  } catch (error) {
    console.error("Error validating stock:", error);
    return { isAvailable: false, availableStock: 0, unlimitedStock: false };
  }
} 