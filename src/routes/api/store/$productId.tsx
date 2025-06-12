import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";

import {
  products,
  categories,
  brands,
  productVariations,
  variationAttributes,
  blogPosts,
} from "~/schema";

import { db } from "~/db";
import { ProductWithDetails } from "~/types";

export const APIRoute = createAPIFileRoute("/api/store/$productId")({
  GET: async ({ request, params }) => {
    // TODO: remove
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    try {
      const { productId } = params;

      if (!productId) {
        return json(
          { error: "Product ID is required" },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      const result = await db
        .select()
        .from(products)
        .where(eq(products.slug, productId))
        .leftJoin(categories, eq(products.categorySlug, categories.slug))
        .leftJoin(brands, eq(products.brandSlug, brands.slug))
        .leftJoin(blogPosts, eq(blogPosts.productSlug, products.slug))
        .leftJoin(
          productVariations,
          eq(productVariations.productId, products.id)
        )
        .leftJoin(
          variationAttributes,
          eq(variationAttributes.productVariationId, productVariations.id)
        )
        .all();

      if (!result || result.length === 0) {
        return json(
          { error: "Product not found" },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      const firstRow = result[0];
      const baseProduct = firstRow.products;

      // Process variations and their attributes
      const variationsMap = new Map();

      result.forEach((row) => {
        if (!row.product_variations) return;

        const variationId = row.product_variations.id;
        if (!variationsMap.has(variationId)) {
          variationsMap.set(variationId, {
            id: variationId,
            productId: row.product_variations.productId,
            sku: row.product_variations.sku,
            price: row.product_variations.price,
            stock: row.product_variations.stock,
            sort: row.product_variations.sort || 0,
            discount: row.product_variations.discount,
            shippingFrom: row.product_variations.shippingFrom,
            createdAt: row.product_variations.createdAt,
            attributes: [],
          });
        }

        if (row.variation_attributes) {
          variationsMap.get(variationId)!.attributes.push({
            id: row.variation_attributes.id,
            productVariationId: row.variation_attributes.productVariationId,
            attributeId: row.variation_attributes.attributeId,
            value: row.variation_attributes.value,
            createdAt: row.variation_attributes.createdAt,
          });
        }
      });

      // Construct the properly formatted product with all necessary details
      const productWithDetails: ProductWithDetails = {
        ...baseProduct,
        category: firstRow.categories
          ? {
              name: firstRow.categories.name,
              slug: firstRow.categories.slug,
            }
          : null,
        brand: firstRow.brands
          ? {
              name: firstRow.brands.name,
              slug: firstRow.brands.slug,
            }
          : null,
        blogPost: firstRow.blog_posts
          ? {
              id: firstRow.blog_posts.id,
              title: firstRow.blog_posts.title || "",
              slug: firstRow.blog_posts.slug,
              body: firstRow.blog_posts.body || "",
              blogUrl: `/blog#${firstRow.blog_posts.slug}`,
            }
          : null,
        // Use blog post body as description if available
        description: firstRow.blog_posts?.body || baseProduct.description,
        variations: Array.from(variationsMap.values()),
      };

      return json(productWithDetails, { headers: corsHeaders });
    } catch (error) {
      console.error("Error fetching product:", error);
      return json(
        { error: `Failed to fetch product: ${(error as Error).message}` },
        { status: 500, headers: corsHeaders }
      );
    }
  },
});
