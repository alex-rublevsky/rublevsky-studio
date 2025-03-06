'use server';

import db from "@/server/db";
import { products, productVariations } from "@/server/schema";
import { eq } from "drizzle-orm";

export interface StockValidationResult {
  isAvailable: boolean;
  availableStock: number;
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
    // If we have a variation ID, check the variation stock
    if (variationId) {
      const variation = await db
        .select({ stock: productVariations.stock })
        .from(productVariations)
        .where(eq(productVariations.id, variationId))
        .get();

      if (!variation) {
        return { isAvailable: false, availableStock: 0 };
      }

      return {
        isAvailable: variation.stock >= requestedQuantity,
        availableStock: variation.stock,
      };
    }
    
    // Otherwise, check the product stock
    const product = await db
      .select({
        stock: products.stock,
        unlimitedStock: products.unlimitedStock,
        hasVariations: products.hasVariations,
      })
      .from(products)
      .where(eq(products.id, productId))
      .get();

    if (!product) {
      return { isAvailable: false, availableStock: 0 };
    }

    // If product has unlimited stock, it's always available
    if (product.unlimitedStock) {
      return { isAvailable: true, availableStock: Number.MAX_SAFE_INTEGER };
    }

    // If product has variations, we should check those instead
    if (product.hasVariations && !variationId) {
      return { isAvailable: false, availableStock: 0 };
    }

    return {
      isAvailable: product.stock >= requestedQuantity,
      availableStock: product.stock,
    };
  } catch (error) {
    console.error("Error validating stock:", error);
    return { isAvailable: false, availableStock: 0 };
  }
} 