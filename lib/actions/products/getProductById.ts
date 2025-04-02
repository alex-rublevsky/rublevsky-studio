"use server";

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { products, productTeaCategories, productVariations, variationAttributes } from "@/server/schema";
import { ProductWithVariations } from "@/types";

/**
 * Get a product by ID with all its related data for editing
 * Unlike getProductBySlug, this:
 * - Returns raw data for admin editing
 * - Includes variations and tea categories
 * - No caching (admin needs real-time data)
 */
export default async function getProductById(id: number): Promise<ProductWithVariations | null> {
  try {
    // Get the base product
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .get();

    if (!product) {
      return null;
    }

    // If product has variations, get them with their attributes
    const variations = product.hasVariations ? await db
      .select()
      .from(productVariations)
      .leftJoin(variationAttributes, eq(variationAttributes.productVariationId, productVariations.id))
      .where(eq(productVariations.productId, id))
      .all() : [];

    // Get tea categories
    const teaCategories = await db
      .select()
      .from(productTeaCategories)
      .where(eq(productTeaCategories.productId, id))
      .all();

    // Process variations to group attributes by variation
    const processedVariations = variations.reduce((acc, row) => {
      if (!row.product_variations) return acc;
      
      const variationId = row.product_variations.id;
      if (!acc.has(variationId)) {
        acc.set(variationId, {
          id: variationId,
          sku: row.product_variations.sku,
          price: row.product_variations.price,
          stock: row.product_variations.stock,
          sort: row.product_variations.sort || 0,
          attributes: []
        });
      }

      if (row.variation_attributes) {
        acc.get(variationId)!.attributes.push({
          attributeId: row.variation_attributes.attributeId,
          value: row.variation_attributes.value
        });
      }

      return acc;
    }, new Map());

    return {
      ...product,
      images: product.images || "",
      teaCategories: teaCategories.map((tc) => tc.teaCategorySlug),
      variations: Array.from(processedVariations.values()),
    };
  } catch (error) {
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
} 