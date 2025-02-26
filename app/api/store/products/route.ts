import { NextResponse } from "next/server";
import db from "../../../../server/db";
import { products, categories, brands, productVariations, variationAttributes } from "../../../../server/schema";
import { eq, desc, and } from "drizzle-orm";
import { Product } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const brandSlug = searchParams.get("brand");
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "12");
    
    // Build the query
    let query = db
      .select()
      .from(products)
      .where(eq(products.isActive, true));
    
    // Add filters
    if (categorySlug) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .get();
      
      if (category) {
        query = query.where(eq(products.categoryId, category.id));
      }
    }
    
    if (brandSlug) {
      const brand = await db
        .select()
        .from(brands)
        .where(eq(brands.slug, brandSlug))
        .get();
      
      if (brand) {
        query = query.where(eq(products.brandId, brand.id));
      }
    }
    
    if (featured) {
      query = query.where(eq(products.isFeatured, true));
    }
    
    // Order by newest first and limit results
    query = query.orderBy(desc(products.createdAt)).limit(limit);
    
    // Execute the query
    const productList = await query.all();
    
    // Fetch variations for products that have them
    const productsWithVariations = await Promise.all(
      productList.map(async (product: Product) => {
        if (product.hasVariations) {
          const variations = await db
            .select()
            .from(productVariations)
            .where(eq(productVariations.productId, product.id))
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
          
          return { ...product, variations };
        }
        
        return product;
      })
    );
    
    return NextResponse.json(
      { products: productsWithVariations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: (error as Error).message },
      { status: 500 }
    );
  }
} 