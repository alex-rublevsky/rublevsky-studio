import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import {
  products,
  categories,
  teaCategories,
  productVariations,
  variationAttributes,
  productTeaCategories,
} from "~/schema";
import { db } from "~/db";
import type { ProductWithVariations } from "~/types";

export const APIRoute = createAPIFileRoute("/api/store")({
  GET: async ({ request, params }) => {
    // TODO: remove
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    try {
      // Fetch all base data
      const categoriesResult = await db.select().from(categories).all();
      const teaCategoriesResult = await db.select().from(teaCategories).all();

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

      // Convert to array
      const productsArray = Array.from(productMap.values());

      const result = {
        products: productsArray,
        categories: categoriesResult,
        teaCategories: teaCategoriesResult,
      };

      return json(result, { headers: corsHeaders });
    } catch (error) {
      console.error("Error fetching store data:", error);
      return json(
        { error: "Failed to fetch store data" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
});
