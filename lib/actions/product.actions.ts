'use server'

import db from "@/server/db";
import { products, categories, brands, productVariations, variationAttributes } from "@/server/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { NewProduct, Product, ProductWithVariations } from "@/types";

// ===== STORE ACTIONS =====
// These actions are for the public-facing store

/**
 * Get a list of products for the store with optional filtering
 */
export async function getStoreProducts({
  
}: {
  
}) {
  try {
    const productsList = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .all();
    
    return { products: productsList };
  } catch (error) {
    console.error("Error fetching store products:", error);
    return { products: [] };
  }
}

/**
 * Get a single product by slug for the store
 */
export async function getStoreProductBySlug(slug: string) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(and(
        eq(products.slug, slug),
        eq(products.isActive, true)
      ))
      .get();
    
    return product;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Get the latest products for the homepage
 */
// export async function getLatestProducts(limit = 4) {
//   try {
//     const data = await db
//       .select()
//       .from(products)
//       .where(eq(products.isActive, true))
//       .orderBy(desc(products.createdAt))
//       .limit(limit)
//       .all();
    
//     return { products: data };
//   } catch (error) {
//     console.error("Error fetching latest products:", error);
//     throw new Error(`Failed to fetch latest products: ${(error as Error).message}`);
//   }
// }



// ===== TODO protect with middleware ADMIN ACTIONS =====
// These actions are for the admin panel and should be protected

/**
 * Get all products for admin panel
 */
export async function getAdminProducts() {
  try {
    const allProducts = await db.select().from(products).all();
    
    return { products: allProducts };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
}

/**
 * Get a single product by ID with all its details for admin panel
 */
export async function getAdminProductById(productId: number) {
  try {
    // Get product by ID
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .get() as ProductWithVariations;
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    // Get product variations if hasVariations is true
    if (product.hasVariations) {
      const variations = await db
        .select()
        .from(productVariations)
        .where(eq(productVariations.productId, productId))
        .all();
      
      // Get attributes for each variation
      for (const variation of variations) {
        const attributes = await db
          .select()
          .from(variationAttributes)
          .where(eq(variationAttributes.productVariationId, variation.id))
          .all();
        
        (variation as any).attributes = attributes;
      }
      
      product.variations = variations as any;
    }
    
    return { product };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: NewProduct) {
  try {
    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      throw new Error("Name, slug, and price are required");
    }

    // Check if slug already exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, data.slug))
      .get();

    if (existingProduct) {
      throw new Error("A product with this slug already exists");
    }

    // Insert the product
    const result = await db
      .insert(products)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: parseFloat(data.price.toString()),
        categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : null,
        brandId: data.brandId ? parseInt(data.brandId.toString()) : null,
        stock: data.stock !== undefined ? parseInt(data.stock.toString()) : 0,
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
    // @ts-ignore - variations property is added dynamically and not part of the NewProduct type
    if (data.hasVariations && Array.isArray(data.variations) && data.variations.length > 0) {
      // @ts-ignore - variations property is added dynamically and not part of the NewProduct type
      for (const variation of data.variations) {
        // Insert the variation
        const variationResult = await db
          .insert(productVariations)
          .values({
            productId: result.id,
            sku: variation.sku,
            price: parseFloat(variation.price.toString()),
            stock: parseInt(variation.stock.toString()),
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

    return {
      message: "Product created successfully",
      product: result,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: number, data: NewProduct) {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      throw new Error("Name, slug, and price are required");
    }

    // Check if slug already exists for another product
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, data.slug), ne(products.id, productId)))
      .get();

    if (existingProduct) {
      throw new Error("Another product with this slug already exists");
    }

    // Update the product
    const result = await db
      .update(products)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: parseFloat(data.price.toString()),
        categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : null,
        brandId: data.brandId ? parseInt(data.brandId.toString()) : null,
        stock: data.stock !== undefined ? parseInt(data.stock.toString()) : 0,
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
    // @ts-ignore - variations property is added dynamically and not part of the NewProduct type
    if (data.hasVariations && Array.isArray(data.variations) && data.variations.length > 0) {
      // First, delete existing variations for this product
      await db
        .delete(productVariations)
        .where(eq(productVariations.productId, productId))
        .run();

      // Then insert the new variations
      // @ts-ignore - variations property is added dynamically and not part of the NewProduct type
      for (const variation of data.variations) {
        // Insert the variation
        const variationResult = await db
          .insert(productVariations)
          .values({
            productId: productId,
            sku: variation.sku,
            price: parseFloat(variation.price.toString()),
            stock: parseInt(variation.stock.toString()),
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

    return {
      message: "Product updated successfully",
      product: result,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: number) {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .get();

    if (!product) {
      throw new Error("Product not found");
    }

    // Delete the product (this will cascade delete variations due to foreign key constraints)
    await db
      .delete(products)
      .where(eq(products.id, productId))
      .run();

    return {
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${(error as Error).message}`);
  }
}

/**
 * Get all product attributes for admin panel
 */
export async function getProductAttributes() {
  try {
    // Get all unique attribute names from the database
    const attributes = await db
      .selectDistinct({ name: variationAttributes.name })
      .from(variationAttributes)
      .all();
    
    return { 
      attributes: attributes.map((attr: { name: string }) => attr.name)
    };
  } catch (error) {
    console.error("Error fetching product attributes:", error);
    throw new Error(`Failed to fetch product attributes: ${(error as Error).message}`);
  }
}