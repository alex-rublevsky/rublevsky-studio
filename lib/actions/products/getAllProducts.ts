'use server';

//TODO add data caching for getAllProducts and getProductBySlug
//TODO optimize stock validation to check with locally stored value?
//TODO implement bulk stock validation (all items at once) for cart

import { eq, desc, and, SQL } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import db from "@/server/db";
import { products, categories, brands, productVariations, variationAttributes, blogPosts, productTeaCategories, teaCategories } from "@/server/schema";
import { Product, ProductWithVariations, ProductVariationWithAttributes } from "@/types";

interface GetAllProductsOptions {
  categorySlug?: string | null;
  brandSlug?: string | null;
  featured?: boolean;
}

interface EnrichedProductWithVariations extends ProductWithVariations {
  _categoryOrder: number;
  variations: ProductVariationWithAttributes[];
  teaCategories: string[];
}

// Function to fetch products from database
async function fetchProducts({
  categorySlug = null,
  brandSlug = null,
  featured = false
}: GetAllProductsOptions = {}): Promise<ProductWithVariations[]> {
  try {
    // Execute a single query to get all related data
    const result = await db
      .select({
        product: products,
        blogPost: {
          body: blogPosts.body
        },
        variations: productVariations,
        attributes: variationAttributes,
        teaCategorySlug: teaCategories.slug
      })
      .from(products)
      .leftJoin(blogPosts, eq(blogPosts.productSlug, products.slug))
      .leftJoin(productVariations, eq(productVariations.productId, products.id))
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
      .leftJoin(
        teaCategories,
        eq(teaCategories.slug, productTeaCategories.teaCategorySlug)
      )
      .where(eq(products.isActive, true))
      .where(categorySlug ? eq(products.categorySlug, categorySlug) : undefined)
      .where(brandSlug ? eq(products.brandSlug, brandSlug) : undefined)
      .where(featured ? eq(products.isFeatured, true) : undefined)
      .orderBy(desc(products.createdAt))
      .all();

    // Process the results to group variations and attributes
    const productMap = new Map<number, EnrichedProductWithVariations>();

    result.forEach((row: any) => {
      if (!productMap.has(row.product.id)) {
        // Define category order
        const categoryOrder = {
          'apparel': 1,
          'posters': 2,
          'produce': 3,
          'tea': 4,
          'stickers': 5
        };

        productMap.set(row.product.id, {
          ...row.product,
          images: row.product.images,
          description: row.blogPost?.body || row.product.description,
          variations: [],
          teaCategories: [],
          _categoryOrder: categoryOrder[row.product.categorySlug as keyof typeof categoryOrder] || 999
        });
      }

      const product = productMap.get(row.product.id)!;

      // Add tea category if it exists and isn't already in the array
      if (row.teaCategorySlug && !product.teaCategories.includes(row.teaCategorySlug)) {
        product.teaCategories.push(row.teaCategorySlug);
      }

      if (row.variations && !product.variations.find(v => v.id === row.variations.id)) {
        const variation: ProductVariationWithAttributes = {
          ...row.variations,
          attributes: []
        };

        if (row.attributes) {
          variation.attributes = [row.attributes];
        }

        product.variations.push(variation);
      } else if (row.attributes && row.variations) {
        const variation = product.variations.find(v => v.id === row.variations.id);
        if (variation && !variation.attributes.find(a => a.id === row.attributes.id)) {
          variation.attributes.push(row.attributes);
        }
      }
    });

    // Convert map to array and sort by category order
    const sortedProducts = Array.from(productMap.values()).sort((a, b) => {
      if (a._categoryOrder !== b._categoryOrder) {
        return a._categoryOrder - b._categoryOrder;
      }
      return 0;
    });

    // Remove the temporary _categoryOrder property and return the products
    return sortedProducts.map(({ _categoryOrder, ...product }) => product);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
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
