import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import {
  products,
  categories,
  teaCategories,
  brands,
  productVariations,
  variationAttributes,
  productTeaCategories,
} from "~/schema";
import { db } from "~/db";
import type { ProductWithVariations } from "~/types";
import { 
  isProductAvailable, 
  getEffectiveStock, 
  getStockDisplayText 
} from "~/utils/validateStock";
import { drizzle } from "drizzle-orm/d1";
import { getBindings } from "~/utils/bindings";
import type { ProductFormData } from "~/types";

export const APIRoute = createAPIFileRoute("/api/dashboard/products")({
  POST: async ({ request }) => {
    // TODO: remove
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const productData: ProductFormData = await request.json();
      console.log(
        "Creating product with data:",
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
      const bindings = getBindings();
      const d1Database = bindings.DB;
      const db = drizzle(d1Database);

      // Check for duplicate slug
      const duplicateSlug = await db
        .select()
        .from(products)
        .where(eq(products.slug, productData.slug))
        .limit(1);

      if (duplicateSlug[0]) {
        return json(
          { error: "A product with this slug already exists" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Process images
      const imageString = productData.images?.trim() || "";

      // Insert main product
      const insertedProducts = await db
        .insert(products)
        .values({
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
          createdAt: new Date(),
        })
        .returning();

      const newProduct = insertedProducts[0];

      // Handle tea categories
      if (productData.teaCategories?.length) {
        await db.insert(productTeaCategories).values(
          productData.teaCategories.map((slug) => ({
            productId: newProduct.id,
            teaCategorySlug: slug,
          }))
        );
      }

      // Handle variations
      if (productData.hasVariations && productData.variations?.length) {
        // Insert variations and get their IDs
        const insertedVariations = await db
          .insert(productVariations)
          .values(
            productData.variations.map((v) => ({
              productId: newProduct.id,
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
      }

      return json(
        {
          message: "Product created successfully",
          product: newProduct,
        },
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error("Error creating product:", error);
      return json(
        { error: `Failed to create product: ${(error as Error).message}` },
        { status: 500, headers: corsHeaders }
      );
    }
  },

  GET: async ({ request, params }) => {
   // TODO: remove
            const corsHeaders = {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            };

    try {
      // Fetch all base data
      const categoriesResult = await db.select().from(categories).all();
      const teaCategoriesResult = await db.select().from(teaCategories).all();
      const brandsResult = await db.select().from(brands).all();

      // Fetch products with variations in a single complex query
      const rows = await db
        .select()
        .from(products)
        .leftJoin(
          productVariations,
          eq(productVariations.productId, products.id)
        )
        .leftJoin(
          variationAttributes,
          eq(variationAttributes.productVariationId, productVariations.id)
        )
        .leftJoin(
          productTeaCategories,
          eq(productTeaCategories.productId, products.id)
        )
        .leftJoin(
          teaCategories,
          eq(teaCategories.slug, productTeaCategories.teaCategorySlug)
        )
        .all();

      if (!rows || rows.length === 0) {
        return json(
          { message: "No products found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      // Group products and build variations
      const productMap = new Map<number, ProductWithVariations>();
      const variationMap = new Map<number, any>();

      for (const row of rows) {
        const product = row.products;
        const variation = row.product_variations;
        const attribute = row.variation_attributes;
        const teaCategory = row.tea_categories;

        // Initialize product if not exists
        if (!productMap.has(product.id)) {
          productMap.set(product.id, {
            ...product,
            teaCategories: [],
            variations: [],
          });
        }

        const currentProduct = productMap.get(product.id)!;

        // Add tea category if exists and not already added
        if (
          teaCategory &&
          !currentProduct.teaCategories!.includes(teaCategory.slug)
        ) {
          currentProduct.teaCategories!.push(teaCategory.slug);
        }

        // Process variations if product has them
        if (variation) {
          // Initialize variation if not exists
          if (!variationMap.has(variation.id)) {
            variationMap.set(variation.id, {
              id: variation.id,
              sku: variation.sku,
              price: variation.price,
              stock: variation.stock,
              sort: variation.sort,
              discount: variation.discount,
              shippingFrom: variation.shippingFrom,
              attributes: [],
            });
          }

          // Add attribute to variation if exists
          if (attribute) {
            const currentVariation = variationMap.get(variation.id)!;
            const existingAttribute = currentVariation.attributes.find(
              (attr: any) => attr.attributeId === attribute.attributeId
            );

            if (!existingAttribute) {
              currentVariation.attributes.push({
                attributeId: attribute.attributeId,
                value: attribute.value,
              });
            }
          }
        }
      }

      // Assign variations to products
      for (const variation of variationMap.values()) {
        const productId = rows.find(
          (row) => row.product_variations?.id === variation.id
        )?.products.id;
        if (productId) {
          const product = productMap.get(productId);
          if (
            product &&
            !product.variations!.find((v) => v.id === variation.id)
          ) {
            product.variations!.push(variation);
          }
        }
      }

      // Sort variations by sort field
      for (const product of productMap.values()) {
        product.variations!.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      }

      // Convert to array and add computed stock fields
      const productsArray = Array.from(productMap.values()).map((product) => {
        // Add computed fields for enhanced stock detection
        const effectiveStock = getEffectiveStock(product, []); // No cart items on server
        const isAvailable = isProductAvailable(product, []);
        const stockDisplayText = getStockDisplayText(product, []);
        
        return {
          ...product,
          // Add computed fields that frontend can use directly
          _computed: {
            effectiveStock,
            isAvailable,
            stockDisplayText,
            isSticker: product.categorySlug === "stickers",
            hasUnlimitedStock: product.unlimitedStock || product.categorySlug === "stickers"
          }
        };
      });

      const result = {
        products: productsArray,
        categories: categoriesResult,
        teaCategories: teaCategoriesResult,
        brands: brandsResult,
      };

      return json(result, { headers: corsHeaders });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return json(
        { error: "Failed to fetch dashboard data" },
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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
});
