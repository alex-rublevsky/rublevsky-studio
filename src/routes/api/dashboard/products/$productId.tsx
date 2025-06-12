import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getBindings } from "~/utils/bindings";
import { drizzle } from "drizzle-orm/d1";
import {
  products,
  productVariations,
  variationAttributes,
  productTeaCategories,
} from "~/schema";
import { eq } from "drizzle-orm";
import type { ProductFormData } from "~/types";

export const APIRoute = createAPIFileRoute(
  "/api/dashboard/products/$productId"
)({
  GET: async ({ request, params }) => {
    // TODO: remove
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const productId = parseInt(params.productId);

      if (isNaN(productId)) {
        return json(
          { error: "Invalid product ID" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Get CloudFlare D1 database instance
      const bindings = await getBindings();
      const d1Database = bindings.DB;
      const db = drizzle(d1Database);

      // Fetch product with all its data
      const [productResult, variationsResult, teaCategoriesResult] =
        await Promise.all([
          db.select().from(products).where(eq(products.id, productId)).limit(1),
          db
            .select({
              id: productVariations.id,
              sku: productVariations.sku,
              price: productVariations.price,
              stock: productVariations.stock,
              sort: productVariations.sort,
              discount: productVariations.discount,
              shippingFrom: productVariations.shippingFrom,
              attributeId: variationAttributes.attributeId,
              attributeValue: variationAttributes.value,
            })
            .from(productVariations)
            .leftJoin(
              variationAttributes,
              eq(variationAttributes.productVariationId, productVariations.id)
            )
            .where(eq(productVariations.productId, productId)),
          db
            .select({
              teaCategorySlug: productTeaCategories.teaCategorySlug,
            })
            .from(productTeaCategories)
            .where(eq(productTeaCategories.productId, productId)),
        ]);

      if (!productResult[0]) {
        return json(
          { error: "Product not found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      const product = productResult[0];

      // Group variations with their attributes
      const variationsMap = new Map();
      for (const row of variationsResult) {
        if (!variationsMap.has(row.id)) {
          variationsMap.set(row.id, {
            id: row.id.toString(),
            sku: row.sku,
            price: row.price,
            stock: row.stock,
            sort: row.sort,
            discount: row.discount,
            shippingFrom: row.shippingFrom,
            attributes: [],
          });
        }

        if (row.attributeId && row.attributeValue) {
          variationsMap.get(row.id).attributes.push({
            attributeId: row.attributeId,
            value: row.attributeValue,
          });
        }
      }

      const variations = Array.from(variationsMap.values());
      const teaCategories = teaCategoriesResult.map((tc) => tc.teaCategorySlug);

      const productWithDetails = {
        ...product,
        variations,
        teaCategories,
      };

      return json(productWithDetails, { headers: corsHeaders });
    } catch (error) {
      console.error("Error fetching product:", error);
      return json(
        {
          error:
            error instanceof Error ? error.message : "Failed to fetch product",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },

  PUT: async ({ request, params }) => {
    // TODO: remove
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const productId = parseInt(params.productId);

      if (isNaN(productId)) {
        return json(
          { error: "Invalid product ID" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      const productData: ProductFormData = await request.json();
      console.log(
        "Updating product with ID:",
        productId,
        "Data:",
        JSON.stringify(productData, null, 2)
      );

      // Validate required fields
      if (!productData.name || !productData.slug || !productData.price) {
        return json(
          {
            error:
              "Missing required fields: name, slug, and price are required",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Get CloudFlare D1 database instance
      const bindings = await getBindings();
      const d1Database = bindings.DB;
      const db = drizzle(d1Database);

      // Fetch existing product and check for duplicate slug
      const [existingProduct, duplicateSlug] = await Promise.all([
        db.select().from(products).where(eq(products.id, productId)).limit(1),
        db
          .select()
          .from(products)
          .where(eq(products.slug, productData.slug))
          .limit(1),
      ]);

      if (!existingProduct[0]) {
        return json(
          { error: "Product not found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      if (duplicateSlug[0] && duplicateSlug[0].id !== productId) {
        return json(
          { error: "A product with this slug already exists" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Process images
      const imageString =
        productData.images?.trim() || existingProduct[0].images || "";

      // Update product and related data
      await Promise.all([
        // Update main product
        db
          .update(products)
          .set({
            name: productData.name,
            slug: productData.slug,
            description: productData.description || null,
            price: parseFloat(productData.price),
            categorySlug: productData.categorySlug || null,
            brandSlug: productData.brandSlug || null,
            stock: parseInt(productData.stock),
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            discount: productData.discount || null,
            hasVariations: productData.hasVariations,
            weight: productData.weight || null,
            images: imageString,
            shippingFrom: productData.shippingFrom || null,
          })
          .where(eq(products.id, productId)),

        // Handle tea categories
        (async () => {
          await db
            .delete(productTeaCategories)
            .where(eq(productTeaCategories.productId, productId));

          if (productData.teaCategories?.length) {
            await db.insert(productTeaCategories).values(
              productData.teaCategories.map((slug) => ({
                productId: productId,
                teaCategorySlug: slug,
              }))
            );
          }
        })(),

        // Handle variations
        (async () => {
          if (productData.hasVariations && productData.variations?.length) {
            // Get all existing variations for this product
            const existingVariations = await db
              .select()
              .from(productVariations)
              .where(eq(productVariations.productId, productId));

            // Delete old variations and their attributes
            if (existingVariations.length > 0) {
              // Delete variation attributes for all variations
              for (const variation of existingVariations) {
                await db
                  .delete(variationAttributes)
                  .where(
                    eq(variationAttributes.productVariationId, variation.id)
                  );
              }

              // Delete variations
              await db
                .delete(productVariations)
                .where(eq(productVariations.productId, productId));
            }

            // Insert new variations and get their IDs
            const insertedVariations = await db
              .insert(productVariations)
              .values(
                productData.variations.map((v) => ({
                  productId: productId,
                  sku: v.sku,
                  price: parseFloat(v.price.toString()),
                  stock: parseInt(v.stock.toString()),
                  sort: v.sort || 0,
                  discount: v.discount ? parseInt(v.discount.toString()) : null,
                  shippingFrom: v.shippingFrom || null,
                  createdAt: new Date(),
                }))
              )
              .returning();

            // Insert variation attributes if they exist
            const attributesToInsert = productData.variations.flatMap(
              (variation, index) => {
                const insertedVariation = insertedVariations[index];
                return (
                  variation.attributes?.map((attr) => ({
                    productVariationId: insertedVariation.id,
                    attributeId: attr.attributeId,
                    value: attr.value,
                    createdAt: new Date(),
                  })) || []
                );
              }
            );

            if (attributesToInsert.length > 0) {
              await db.insert(variationAttributes).values(attributesToInsert);
            }
          } else {
            // If no variations, clean up any existing ones
            const existingVariations = await db
              .select()
              .from(productVariations)
              .where(eq(productVariations.productId, productId));

            if (existingVariations.length > 0) {
              // Delete variation attributes for all variations
              for (const variation of existingVariations) {
                await db
                  .delete(variationAttributes)
                  .where(
                    eq(variationAttributes.productVariationId, variation.id)
                  );
              }

              await db
                .delete(productVariations)
                .where(eq(productVariations.productId, productId));
            }
          }
        })(),
      ]);

      // Fetch and return updated product
      const updatedProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      return json(
        {
          message: "Product updated successfully",
          product: updatedProduct[0],
        },
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error("Error updating product:", error);
      return json(
        {
          error:
            error instanceof Error ? error.message : "Failed to update product",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },

  DELETE: async ({ request, params }) => {
    // TODO: remove
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const productId = parseInt(params.productId);

      if (isNaN(productId)) {
        return json(
          { error: "Invalid product ID" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Get CloudFlare D1 database instance
      const bindings = await getBindings();
      const d1Database = bindings.DB;
      const db = drizzle(d1Database);

      // Check if product exists
      const existingProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!existingProduct[0]) {
        return json(
          { error: "Product not found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      // Delete related data first (foreign key constraints)
      
      // Get all variations for this product
      const existingVariations = await db
        .select()
        .from(productVariations)
        .where(eq(productVariations.productId, productId));

      // Delete variation attributes for all variations
      if (existingVariations.length > 0) {
        for (const variation of existingVariations) {
          await db
            .delete(variationAttributes)
            .where(eq(variationAttributes.productVariationId, variation.id));
        }

        // Delete variations
        await db
          .delete(productVariations)
          .where(eq(productVariations.productId, productId));
      }

      // Delete tea category associations
      await db
        .delete(productTeaCategories)
        .where(eq(productTeaCategories.productId, productId));

      // Finally delete the product
      await db.delete(products).where(eq(products.id, productId));

      return json(
        { message: "Product deleted successfully" },
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      return json(
        {
          error:
            error instanceof Error ? error.message : "Failed to delete product",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },

  OPTIONS: async ({ request }) => {
    // TODO: remove
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
});
