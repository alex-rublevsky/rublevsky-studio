import { NextResponse } from "next/server";
import db from "../../../../server/db";
import { products, productVariations, variationAttributes } from "../../../../server/schema";
import { eq, and, ne } from "drizzle-orm";
import { NewProduct } from "@/types";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      return NextResponse.json(
        { error: "Name, slug, and price are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, data.slug))
      .get();

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    // Insert the product
    const result = await db
      .insert(products)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: parseFloat(data.price),
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        brandId: data.brandId ? parseInt(data.brandId) : null,
        stock: parseInt(data.stock),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        onSale: data.onSale,
        hasVariations: data.hasVariations,
        hasVolume: data.hasVolume,
        volume: data.volume || null,
        images: data.images || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning()
      .get();

    // If product has variations, insert them into the productVariations table
    if (data.hasVariations && data.variations && data.variations.length > 0) {
      for (const variation of data.variations) {
        // Insert the variation
        const variationResult = await db
          .insert(productVariations)
          .values({
            productId: result.id,
            sku: variation.sku,
            price: parseFloat(variation.price),
            stock: parseInt(variation.stock),
            sort: variation.sort,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning()
          .get();

        // Insert the variation attributes
        if (variation.attributes && variation.attributes.length > 0) {
          for (const attribute of variation.attributes) {
            await db
              .insert(variationAttributes)
              .values({
                productVariationId: variationResult.id,
                name: attribute.name,
                value: attribute.value,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .run();
          }
        }
      }
    }

    return NextResponse.json({
      message: "Product created successfully",
      product: result,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allProducts = await db.select().from(products).all();
    
    return NextResponse.json(
      { products: allProducts },
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

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const productId = parseInt(request.url.split("/").pop() || "0");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      return NextResponse.json(
        { error: "Name, slug, and price are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists for another product
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, data.slug), ne(products.id, productId)))
      .get();

    if (existingProduct) {
      return NextResponse.json(
        { error: "Another product with this slug already exists" },
        { status: 400 }
      );
    }

    // Update the product
    const result = await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: parseFloat(data.price),
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        brandId: data.brandId ? parseInt(data.brandId) : null,
        stock: parseInt(data.stock),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        onSale: data.onSale,
        hasVariations: data.hasVariations,
        hasVolume: data.hasVolume,
        volume: data.volume || null,
        images: data.images || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, productId))
      .returning()
      .get();

    // If product has variations, update them
    if (data.hasVariations && data.variations && data.variations.length > 0) {
      // First, delete existing variations for this product
      await db
        .delete(productVariations)
        .where(eq(productVariations.productId, productId))
        .run();

      // Then insert the new variations
      for (const variation of data.variations) {
        // Insert the variation
        const variationResult = await db
          .insert(productVariations)
          .values({
            productId: productId,
            sku: variation.sku,
            price: parseFloat(variation.price),
            stock: parseInt(variation.stock),
            sort: variation.sort,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning()
          .get();

        // Insert the variation attributes
        if (variation.attributes && variation.attributes.length > 0) {
          for (const attribute of variation.attributes) {
            await db
              .insert(variationAttributes)
              .values({
                productVariationId: variationResult.id,
                name: attribute.name,
                value: attribute.value,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .run();
          }
        }
      }
    } else if (!data.hasVariations) {
      // If product no longer has variations, delete existing ones
      await db
        .delete(productVariations)
        .where(eq(productVariations.productId, productId))
        .run();
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: result,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
} 