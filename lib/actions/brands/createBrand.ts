"use server";

import { eq } from "drizzle-orm";

import db from "@/server/db";
import { brands } from "@/server/schema";

interface CreateBrandData {
  name: string;
  slug: string;
  image?: string | null;
  isActive?: boolean;
}

/**
 * Server action to create a new brand
 * @param data - The brand data to create
 */
export default async function createBrand(data: CreateBrandData): Promise<void> {
  try {
    if (!data.name || !data.slug) {
      throw new Error("Name and slug are required");
    }

    // Check if slug already exists
    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.slug, data.slug))
      .get();

    if (existingBrand) {
      throw new Error("A brand with this slug already exists");
    }

    // Create brand
    await db.insert(brands)
      .values({
        name: data.name,
        slug: data.slug,
        image: data.image || null,
        isActive: data.isActive ?? true
      });
  } catch (error) {
    throw new Error(`Failed to create brand: ${(error as Error).message}`);
  }
} 