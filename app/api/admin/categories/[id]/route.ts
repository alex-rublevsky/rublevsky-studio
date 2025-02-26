import { NextResponse } from "next/server";
import db from "../../../../../server/db";
import { categories } from "../../../../../server/schema";
import { eq } from "drizzle-orm";
import { Category } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const existingCategory = await db.select().from(categories).where(eq(categories.id, categoryId)).get();
    
    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    
    // Check if slug already exists (but not for this category)
    const slugExists = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, body.slug))
      .all();
    
    if (slugExists.length > 0 && slugExists.some((c: { id: number }) => c.id !== categoryId)) {
      return NextResponse.json(
        { message: "A different category with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Format data for update
    const categoryData = {
      name: body.name,
      slug: body.slug,
      image: body.image || null,
      isActive: Boolean(body.isActive),
      updatedAt: new Date().toISOString(),
    };
    
    // Update category in database
    await db.update(categories).set(categoryData).where(eq(categories.id, categoryId)).run();
    
    return NextResponse.json(
      { 
        message: "Category updated successfully", 
        category: { 
          id: categoryId, 
          ...categoryData, 
          createdAt: existingCategory.createdAt 
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Failed to update category", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);
    
    // Get category by ID
    const category = await db.select().from(categories).where(eq(categories.id, categoryId)).get();
    
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { category },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { message: "Failed to fetch category", error: (error as Error).message },
      { status: 500 }
    );
  }
} 