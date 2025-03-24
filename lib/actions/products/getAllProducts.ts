'use server';

//TODO add data caching for getAllProducts and getProductBySlug
//TODO optimize stock validation to check with locally stored value?
//TODO implement bulk stock validation (all items at once) for cart

import { eq, desc, and, SQL, InferModel, sql } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import db from "@/server/db";
import { products, productVariations, variationAttributes, productTeaCategories } from "@/server/schema";
import { Product, ProductWithVariations, ProductVariation, VariationAttribute } from "@/types";

interface GetAllProductsOptions {
  categorySlug?: string | null;
  brandSlug?: string | null;
  featured?: boolean;
}

type ProductSelect = InferModel<typeof products, "select">;
type VariationSelect = InferModel<typeof productVariations, "select">;
type AttributeSelect = InferModel<typeof variationAttributes, "select">;
type TeaCategorySelect = InferModel<typeof productTeaCategories, "select">;

interface QueryRow {
  products: ProductSelect;
  product_variations: VariationSelect | null;
  variation_attributes: AttributeSelect | null;
  product_tea_categories: TeaCategorySelect | null;
}

/**
 * Fetch products from database with only the data needed for store listing
 */
async function fetchProducts({
  categorySlug = null,
  brandSlug = null,
  featured = false
}: GetAllProductsOptions = {}): Promise<ProductWithVariations[]> {
  try {
    // Build where conditions
    const conditions: SQL[] = [eq(products.isActive, true)];
    if (categorySlug !== null) conditions.push(eq(products.categorySlug, categorySlug));
    if (brandSlug !== null) conditions.push(eq(products.brandSlug, brandSlug));
    if (featured) conditions.push(eq(products.isFeatured, true));

    // Create custom category ordering
    const categoryOrder = sql`CASE ${products.categorySlug}
      WHEN 'apparel' THEN 1
      WHEN 'posters' THEN 2
      WHEN 'produce' THEN 3
      WHEN 'tea' THEN 4
      WHEN 'stickers' THEN 5
      ELSE 6
    END`;

    // Execute a single query to get all necessary data
    const rows = await db
      .select()
      .from(products)
      .leftJoin(
        productVariations,
        and(
          eq(productVariations.productId, products.id),
          eq(products.hasVariations, true)
        )
      )
      .leftJoin(
        variationAttributes,
        productVariations.id
          ? eq(variationAttributes.productVariationId, productVariations.id)
          : undefined
      )
      .leftJoin(
        productTeaCategories,
        eq(productTeaCategories.productId, products.id)
      )
      .where(and(...conditions))
      .orderBy(categoryOrder, desc(products.createdAt));

    // Process the results to group variations and attributes
    const productMap = new Map<number, ProductWithVariations>();

    rows.forEach((row: QueryRow) => {
      if (!productMap.has(row.products.id)) {
        // Convert weight to string if it exists
        const weight = row.products.weight !== null ? String(row.products.weight) : null;

        productMap.set(row.products.id, {
          ...row.products,
          weight,
          variations: [],
          teaCategories: []
        });
      }

      const product = productMap.get(row.products.id)!;
      
      // Add tea category if it exists and isn't already added
      if (row.product_tea_categories?.teaCategorySlug && 
          !product.teaCategories?.includes(row.product_tea_categories.teaCategorySlug)) {
        product.teaCategories = [...(product.teaCategories || []), row.product_tea_categories.teaCategorySlug];
      }

      const variation = row.product_variations;

      if (variation && !product.variations?.find(v => v.id === variation.id)) {
        const newVariation: ProductVariation & { attributes: VariationAttribute[] } = {
          id: variation.id,
          productId: variation.productId!,
          sku: variation.sku,
          price: variation.price,
          stock: variation.stock,
          sort: variation.sort,
          createdAt: variation.createdAt,
          attributes: []
        };

        if (row.variation_attributes) {
          newVariation.attributes.push({
            id: row.variation_attributes.id,
            productVariationId: row.variation_attributes.productVariationId!,
            attributeId: row.variation_attributes.attributeId,
            value: row.variation_attributes.value
          });
        }

        product.variations = product.variations || [];
        product.variations.push(newVariation);
      } else if (row.variation_attributes && variation) {
        const existingVariation = product.variations?.find(v => v.id === variation.id);
        if (existingVariation && !existingVariation.attributes.find(a => a.id === row.variation_attributes!.id)) {
          existingVariation.attributes.push({
            id: row.variation_attributes.id,
            productVariationId: row.variation_attributes.productVariationId!,
            attributeId: row.variation_attributes.attributeId,
            value: row.variation_attributes.value
          });
        }
      }
    });

    return Array.from(productMap.values());
  } catch (error) {
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
}

// Cached version of getAllProducts
export default async function getAllProducts(options: GetAllProductsOptions = {}): Promise<ProductWithVariations[]> {
  return unstable_cache(
    async () => fetchProducts(options),
    ['all-products', options.categorySlug || 'all', options.brandSlug || 'all', options.featured ? 'featured' : 'all'],
    {
      revalidate: 1, // TODO: Change to 259200 (3 days)
      tags: ['products'] // Tag for cache invalidation
    }
  )();
}
