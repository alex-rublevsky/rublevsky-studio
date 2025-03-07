'use server';

import db from "@/server/db";
import { products, productVariations } from "@/server/schema";
import { eq, and } from "drizzle-orm";

export interface StockValidationResult {
  isAvailable: boolean;
  availableStock: number;
  unlimitedStock: boolean;
}

/**
 * Validates if a product or variation has sufficient stock
 * This is a server action that can be called from client components
 * Note: Volume-based stock calculations are now handled on the client side
 */
export async function validateStock(
  productId: number,
  requestedQuantity: number = 1,
  variationId?: number
): Promise<StockValidationResult> {
  try {
    // Single query to get all necessary data
    const result = await db
      .select({
        product: {
          unlimitedStock: products.unlimitedStock,
          hasVolume: products.hasVolume,
          volume: products.volume,
          stock: products.stock,
        },
        variation: variationId ? {
          stock: productVariations.stock,
        } : undefined,
      })
      .from(products)
      .leftJoin(
        productVariations,
        variationId ? 
          and(
            eq(productVariations.productId, products.id),
            eq(productVariations.id, variationId)
          ) : undefined
      )
      .where(eq(products.id, productId))
      .get();

    if (!result?.product) {
      return { isAvailable: false, availableStock: 0, unlimitedStock: false };
    }

    const { product } = result;

    // Handle unlimited stock products
    if (product.unlimitedStock) {
      return {
        isAvailable: true,
        availableStock: Number.MAX_SAFE_INTEGER,
        unlimitedStock: true
      };
    }

    // For volume-based products, return the total volume
    // Client will handle the actual stock calculation
    if (product.hasVolume && product.volume) {
      return {
        isAvailable: true, // Client will determine actual availability
        availableStock: parseInt(product.volume),
        unlimitedStock: false
      };
    }

    // For regular variations
    if (variationId && result.variation) {
      return {
        isAvailable: result.variation.stock >= requestedQuantity,
        availableStock: result.variation.stock,
        unlimitedStock: false
      };
    }

    // For non-variation products
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