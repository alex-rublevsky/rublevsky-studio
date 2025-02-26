import { NextResponse } from "next/server";
import db from "../../../../server/db";
import { products, categories, brands, productVariations, variationAttributes } from "../../../../server/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    
    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter is required" },
        { status: 400 }
      );
    }
    
    // Get product by slug with category and brand information
    const product = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .get();
    
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    
    // Format the response to include category and brand names
    const formattedProduct = {
      ...product.products,
      category: product.categories ? {
        id: product.categories.id,
        name: product.categories.name,
        slug: product.categories.slug
      } : null,
      brand: product.brands ? {
        id: product.brands.id,
        name: product.brands.name,
        slug: product.brands.slug
      } : null
    };
    
    // If product has variations, fetch them
    if (formattedProduct.hasVariations) {
      const variations = await db
        .select()
        .from(productVariations)
        .where(eq(productVariations.productId, formattedProduct.id))
        .all();
      
      // Get attributes for each variation
      for (const variation of variations) {
        const attributes = await db
          .select()
          .from(variationAttributes)
          .where(eq(variationAttributes.productVariationId, variation.id))
          .all();
        
        variation.attributes = attributes;
      }
      
      formattedProduct.variations = variations;
    }
    
    return NextResponse.json(
      { product: formattedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product", error: (error as Error).message },
      { status: 500 }
    );
  }
} 