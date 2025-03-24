'use server';

import { eq, inArray } from "drizzle-orm";
import db from "@/server/db";
import { products, productVariations, variationAttributes, productTeaCategories } from "@/server/schema";
import { revalidateTag } from "next/cache";

/**
 * Server action to delete a product and its variations
 * @param id - The ID of the product to delete
 */
export default async function deleteProduct(id: number): Promise<void> {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    // Get all variation IDs for this product
    const variations = await db
      .select()
      .from(productVariations)
      .where(eq(productVariations.productId, id))
      .all();

    const variationIds = variations.map(v => v.id);

    // Delete all related data in parallel if there are variations
    if (variationIds.length > 0) {
      await db
        .delete(variationAttributes)
        .where(inArray(variationAttributes.productVariationId, variationIds));
    }

    // Delete remaining relations and product in parallel
    await Promise.all([
      db.delete(productVariations)
        .where(eq(productVariations.productId, id)),
      db.delete(productTeaCategories)
        .where(eq(productTeaCategories.productId, id))
    ]);

    // Delete the product itself
    await db
      .delete(products)
      .where(eq(products.id, id));

    // Revalidate cache
    revalidateTag('products');
  } catch (error) {
    throw new Error(`Failed to delete product: ${(error as Error).message}`);
  }
} 