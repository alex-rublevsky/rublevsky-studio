'use server';

import { eq } from "drizzle-orm";
import db from "@/server/db";
import { brands } from "@/server/schema";
import { Brand } from "@/types";

interface CreateBrandData {
  name: string;
  slug: string;
  image?: string | null;
  isActive?: boolean;
}

/**
 * Server action to create a new brand
 * @param data - The brand data to create
 * @returns The created brand object
 */
export default async function createBrand(data: CreateBrandData): Promise<Brand> {
  try {
    // Validate required fields
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
    
    // Format data for insertion
    const brandData = {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Insert brand into database
    const result = await db.insert(brands).values(brandData).run();
    
    // Get the inserted ID
    const insertedId = result.lastInsertRowid as number;
    
    // Return the created brand with ID
    return {
      id: insertedId,
      ...brandData
    };
  } catch (error) {
    console.error("Error creating brand:", error);
    throw new Error(`Failed to create brand: ${(error as Error).message}`);
  }
} 