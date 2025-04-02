"use server";

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
    if (!data.name || !data.slug) {
      throw new Error("Name and slug are required");
    }

    // Fetch existing brand and check for duplicate slug in a single query
    const [brand, duplicateSlug] = await Promise.all([
      db.select().from(brands).where(eq(brands.id, id)).get(),
      db.select().from(brands).where(eq(brands.slug, data.slug)).get()
    ]);

    if (!brand) throw new Error("Brand not found");
    if (duplicateSlug && duplicateSlug.id !== id) {
      throw new Error("A brand with this slug already exists");
    }

    // Update brand
    await db.update(brands)
      .set({
        name: data.name,
        slug: data.slug,
        image: data.image || null,
        isActive: data.isActive ?? brand.isActive
      })
      .where(eq(brands.id, id));

    // Fetch and return updated brand
    const updatedBrand = await db.select()
      .from(brands)
      .where(eq(brands.id, id))
      .get();

    return updatedBrand as Brand;
  } catch (error) {
    throw new Error(`Failed to update brand: ${(error as Error).message}`);
  }
} 