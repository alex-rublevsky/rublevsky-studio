import { NextResponse } from "next/server";
import db from "../../../../../server/db";
import { brands } from "../../../../../server/schema";
import { eq } from "drizzle-orm";
import { Brand } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = parseInt(params.id);
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }
    
    // Check if brand exists
    const existingBrand = await db.select().from(brands).where(eq(brands.id, brandId)).get();
    
    if (!existingBrand) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }
    
    // Check if slug already exists (but not for this brand)
    const slugExists = await db
      .select()
      .from(brands)
      .where(eq(brands.slug, body.slug))
      .all();
    
    if (slugExists.length > 0 && slugExists.some((b: { id: number }) => b.id !== brandId)) {
      return NextResponse.json(
        { message: "A different brand with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Format data for update
    const brandData = {
      name: body.name,
      slug: body.slug,
      image: body.image || null,
      isActive: Boolean(body.isActive),
      updatedAt: new Date().toISOString(),
    };
    
    // Update brand in database
    await db.update(brands).set(brandData).where(eq(brands.id, brandId)).run();
    
    return NextResponse.json(
      { 
        message: "Brand updated successfully", 
        brand: { 
          id: brandId, 
          ...brandData, 
          createdAt: existingBrand.createdAt 
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { message: "Failed to update brand", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = parseInt(params.id);
    
    // Get brand by ID
    const brand = await db.select().from(brands).where(eq(brands.id, brandId)).get();
    
    if (!brand) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { brand },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { message: "Failed to fetch brand", error: (error as Error).message },
      { status: 500 }
    );
  }
} 