'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { brands } from "@/server/schema";
import { Brand } from "@/types";

interface UpdateBrandData {
  name: string;
  slug: string;
  image?: string | null;
  isActive?: boolean;
}

/**
 * Server action to update a brand
 * @param id - The ID of the brand to update
 * @param data - The brand data to update
 * @returns The updated brand object
 */
export default async function updateBrand(id: number, data: UpdateBrandData): Promise<Brand> {
  try {
    if (!id) {
      throw new Error("Brand ID is required");
    }
    
    if (!data.name || !data.slug) {
      throw new Error("Name and slug are required");
    }
    
    // Check if brand exists
    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .get();
    
    if (!existingBrand) {
      throw new Error("Brand not found");
    }
    
    // Check if slug already exists (but not for this brand)
    const slugExists = await db
      .select()
      .from(brands)
      .where(eq(brands.slug, data.slug))
      .all();
    
    if (slugExists.length > 0 && slugExists.some((b: { id: number }) => b.id !== id)) {
      throw new Error("A different brand with this slug already exists");
    }
    
    // Format data for update
    const brandData = {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      isActive: data.isActive !== undefined ? data.isActive : existingBrand.isActive,
      updatedAt: new Date().toISOString(),
    };
    
    // Update brand in database
    await db
      .update(brands)
      .set(brandData)
      .where(eq(brands.id, id))
      .run();
    
    // Return the updated brand
    return {
      id,
      ...brandData,
      createdAt: existingBrand.createdAt
    };
  } catch (error) {
    console.error("Error updating brand:", error);
    throw new Error(`Failed to update brand: ${(error as Error).message}`);
  }
} 