'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { products, productTeaCategories, productVariations, variationAttributes } from "@/server/schema";
import { ProductWithVariations } from "@/types";

interface QueryResult {
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
  teaCategorySlug: string | null;
  variationId: number | null;
  sku: string | null;
  variationPrice: number | null;
  variationStock: number | null;
  sort: number | null;
  attributeId: number | null;
  attributeValue: string | null;
}

/**
 * Get a product by ID with all its related data
 * @param id - The product ID to fetch
 * @returns The product with all its variations and attributes
 */
export default async function getProductById(id: number): Promise<ProductWithVariations | null> {
  try {
    // Fetch product with all related data in a single query using joins
    const results = await db
      .select({
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
        teaCategorySlug: productTeaCategories.teaCategorySlug,
        variationId: productVariations.id,
        sku: productVariations.sku,
        variationPrice: productVariations.price,
        variationStock: productVariations.stock,
        sort: productVariations.sort,
        attributeId: variationAttributes.attributeId,
        attributeValue: variationAttributes.value,
      })
      .from(products)
      .leftJoin(productTeaCategories, eq(productTeaCategories.productId, products.id))
      .leftJoin(productVariations, eq(productVariations.productId, products.id))
      .leftJoin(variationAttributes, eq(variationAttributes.productVariationId, productVariations.id))
      .where(eq(products.id, id))
      .all() as QueryResult[];

    if (!results.length) {
      return null;
    }

    // Process results to construct the product object
    const firstRow = results[0];
    const product: ProductWithVariations = {
      id: firstRow.id,
      name: firstRow.name,
      slug: firstRow.slug,
      description: firstRow.description,
      price: firstRow.price,
      categorySlug: firstRow.categorySlug,
      brandSlug: firstRow.brandSlug,
      stock: firstRow.stock,
      isActive: firstRow.isActive,
      isFeatured: firstRow.isFeatured,
      discount: firstRow.discount,
      hasVariations: firstRow.hasVariations,
      weight: firstRow.weight,
      images: firstRow.images || '[]',
      teaCategories: [],
      variations: [],
      unlimitedStock: false,
      createdAt: new Date()
    };

    // Validate that images is a valid JSON array
    if (product.images) {
      try {
        const parsedImages = JSON.parse(product.images);
        if (!Array.isArray(parsedImages)) {
          product.images = '[]';
        }
      } catch (e) {
        console.error("Error validating product images JSON:", e);
        product.images = '[]';
      }
    }

    // Extract unique tea categories
    const teaCategories = new Set<string>();
    results.forEach(row => {
      if (row.teaCategorySlug) {
        teaCategories.add(row.teaCategorySlug);
      }
    });
    product.teaCategories = Array.from(teaCategories);

    // Process variations and their attributes
    if (firstRow.hasVariations) {
      const variationsMap = new Map();

      results.forEach(row => {
        if (row.variationId) {
          if (!variationsMap.has(row.variationId)) {
            variationsMap.set(row.variationId, {
              id: row.variationId,
              sku: row.sku,
              price: row.variationPrice,
              stock: row.variationStock,
              sort: row.sort,
              attributes: []
            });
          }

          if (row.attributeId && row.attributeValue) {
            const variation = variationsMap.get(row.variationId);
            variation.attributes.push({
              attributeId: row.attributeId,
              value: row.attributeValue
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