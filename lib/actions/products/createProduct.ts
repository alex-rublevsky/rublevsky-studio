'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { products, productVariations, productTeaCategories } from "@/server/schema";
import { ProductFormData } from "@/types";

/**
 * Server action to create a new product with variations
 * @param data - The product data to create
 */
export default async function createProduct(data: ProductFormData): Promise<void> {
  try {
    if (!data.name || !data.slug || !data.price || !data.categorySlug) {
      throw new Error("Name, slug, price, and category are required");
    }

    // Check if slug already exists and create product in parallel
    const [existingProduct] = await Promise.all([
      db.select().from(products).where(eq(products.slug, data.slug)).get(),
      db.insert(products).values({
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
        images: data.images?.trim() || '',
        createdAt: new Date()
      })
    ]);

    if (existingProduct) {
      throw new Error("A product with this slug already exists");
    }

    // Get the inserted product
    const newProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, data.slug))
      .get();

    if (!newProduct) throw new Error("Failed to create product");

    // Insert related data in parallel if needed
    if ((data.teaCategories?.length || 0) + (data.hasVariations && data.variations?.length ? 1 : 0) > 0) {
      await Promise.all([
        // Insert tea categories if they exist
        data.teaCategories?.length ?
          db.insert(productTeaCategories)
            .values(data.teaCategories.map(slug => ({
              productId: newProduct.id,
              teaCategorySlug: slug
            })))
          : null,

        // Insert variations if they exist
        (data.hasVariations && data.variations?.length) ?
          db.insert(productVariations)
            .values(data.variations.map(v => ({
              productId: newProduct.id,
              sku: v.sku,
              price: parseFloat(v.price.toString()),
              stock: parseInt(v.stock.toString()),
              sort: v.sort,
              createdAt: new Date()
            })))
          : null
      ].filter(Boolean));
    }
  } catch (error) {
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
} 