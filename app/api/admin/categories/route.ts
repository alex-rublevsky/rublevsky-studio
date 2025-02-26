import { NextResponse } from "next/server";
import db from "../../../../server/db";
import { categories } from "../../../../server/schema";
import { eq } from "drizzle-orm";
import { Category, NewCategory } from "@/types";

export async function GET() {
  try {
    const allCategories = await db.select().from(categories).all();
    
    return NextResponse.json(
      { categories: allCategories },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }
    
    // Check if slug already exists
    const existingCategory = await db.select().from(categories).where(eq(categories.slug, body.slug)).get();
    
    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Format data for insertion
    const categoryData = {
      name: body.name,
      slug: body.slug,
      image: body.image || null,
      isActive: Boolean(body.isActive),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Insert category into database
    const result = await db.insert(categories).values(categoryData).run();
    
    return NextResponse.json(
      { message: "Category created successfully", category: categoryData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "Failed to create category", error: (error as Error).message },
      { status: 500 }
    );
  }
} 