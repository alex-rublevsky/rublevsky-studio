'use server';

import { eq } from "drizzle-orm";
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from "drizzle-orm/d1";
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

    // Initialize database (works for both local and production)
    const database = typeof process === 'undefined' 
      ? drizzle((globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB as D1Database)
      : db;

    // Check if slug already exists
    const existingBrand = await database
      .select()
      .from(brands)
      .where(eq(brands.slug, data.slug))
      .get();

    if (existingBrand) {
      throw new Error("A brand with this slug already exists");
    }

    // Create brand
    await database.insert(brands)
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