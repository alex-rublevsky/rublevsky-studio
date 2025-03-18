'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { products, productTeaCategories, productVariations, variationAttributes } from "@/server/schema";
import { ProductWithVariations } from "@/types";

interface QueryRow {
  product: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    categorySlug: string;
    brandSlug: string;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    discount: number | null;
    hasVariations: boolean;
    weight: string | null;
    images: string | null;
    createdAt: Date;
    unlimitedStock: boolean;
  };
  teaCategorySlug: string | null;
  variation: {
    id: number | null;
    sku: string | null;
    price: number | null;
    stock: number | null;
    sort: number | null;
    attributeId: number | null;
    attributeValue: string | null;
  };
}

/**
 * Get a product by ID with all its related data
 * Unlike getProductBySlug, this:
 * - Returns raw data for admin editing
 * - Includes variations and tea categories
 * - No caching (admin needs real-time data)
 * @param id - The product ID to fetch
 * @returns The product with all its variations and attributes
 */
export default async function getProductById(id: number): Promise<ProductWithVariations | null> {
  try {
    // Fetch product with all related data in a single efficient query
    const result = await db
      .select({
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          categorySlug: products.categorySlug,
          brandSlug: products.brandSlug,
          stock: products.stock,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          discount: products.discount,
          hasVariations: products.hasVariations,
          weight: products.weight,
          images: products.images,
          createdAt: products.createdAt,
          unlimitedStock: products.unlimitedStock
        },
        teaCategorySlug: productTeaCategories.teaCategorySlug,
        variation: {
          id: productVariations.id,
          sku: productVariations.sku,
          price: productVariations.price,
          stock: productVariations.stock,
          sort: productVariations.sort,
          attributeId: variationAttributes.attributeId,
          attributeValue: variationAttributes.value
        }
      })
      .from(products)
      .where(eq(products.id, id))
      .leftJoin(productTeaCategories, eq(productTeaCategories.productId, products.id))
      .leftJoin(productVariations, eq(productVariations.productId, products.id))
      .leftJoin(variationAttributes, eq(variationAttributes.productVariationId, productVariations.id))
      .all();

    if (!result.length) {
      return null;
    }

    // Process results to construct the product object
    const firstRow = result[0];
    const product: ProductWithVariations = {
      ...firstRow.product,
      teaCategories: [],
      variations: [],
      images: firstRow.product.images || ''
    };

    // Extract unique tea categories
    const teaCategories = new Set<string>();
    result.forEach((row: QueryRow) => {
      if (row.teaCategorySlug) {
        teaCategories.add(row.teaCategorySlug);
      }
    });
    product.teaCategories = Array.from(teaCategories);

    // Process variations and their attributes
    if (product.hasVariations) {
      const variationsMap = new Map();

      result.forEach((row: QueryRow) => {
        if (row.variation.id) {
          if (!variationsMap.has(row.variation.id)) {
            variationsMap.set(row.variation.id, {
              id: row.variation.id,
              sku: row.variation.sku,
              price: row.variation.price,
              stock: row.variation.stock,
              sort: row.variation.sort,
              attributes: []
            });
          }

          if (row.variation.attributeId && row.variation.attributeValue) {
            const variation = variationsMap.get(row.variation.id);
            variation.attributes.push({
              attributeId: row.variation.attributeId,
              value: row.variation.attributeValue
            });
          }
        }
      });

      product.variations = Array.from(variationsMap.values());
    }

    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
} 