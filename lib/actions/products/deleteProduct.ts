'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { products, productVariations } from "@/server/schema";

/**
 * Server action to delete a product and its variations
 * @param id - The ID of the product to delete
 * @returns A success message
 */
export default async function deleteProduct(id: number): Promise<{ message: string }> {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }
    
    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .get();
    
    if (!existingProduct) {
      throw new Error("Product not found");
    }
    
    // First delete all variations associated with this product
    if (existingProduct.hasVariations) {
      await db
        .delete(productVariations)
        .where(eq(productVariations.productId, id))
        .run();
    }
    
    // Then delete the product
    await db
      .delete(products)
      .where(eq(products.id, id))
      .run();
    
    return { message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${(error as Error).message}`);
  }
} 