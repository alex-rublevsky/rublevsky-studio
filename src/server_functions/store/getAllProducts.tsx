import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { DB } from "~/db";
import {
  products,
  categories,
  teaCategories,
  productVariations,
  variationAttributes,
  productTeaCategories,
} from "~/schema";
// GET server function that mirrors the former /api/store route behavior exactly
export const getStoreData = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const db = DB() as any;

      const [categoriesResult, teaCategoriesResult, productsResult] =
        await Promise.all([
          db.select().from(categories),
          db.select().from(teaCategories),
          db
            .select()
            .from(products)
            .where(eq((products as any).isActive, true as any)),
        ]);

      if (!productsResult.length) {
        setResponseStatus(404);
        throw new Error("No products found");
      }

      const [variationsResult, teaCategoryLinksResult, attributesResult] =
        await Promise.all([
          db.select().from(productVariations),
          db.select().from(productTeaCategories),
          db.select().from(variationAttributes),
        ]);

      const activeProductIds = new Set(productsResult.map((p: any) => p.id));
      const filteredVariations = variationsResult.filter(
        (v: any) => v.productId && activeProductIds.has(v.productId)
      );
      const filteredTeaCategoryLinks = teaCategoryLinksResult.filter(
        (link: any) => activeProductIds.has(link.productId)
      );

      const activeVariationIds = new Set(
        filteredVariations.map((v: any) => v.id)
      );
      const filteredAttributes = attributesResult.filter(
        (attr: any) =>
          attr.productVariationId &&
          activeVariationIds.has(attr.productVariationId)
      );

      const teaCategoryMap = new Map<number, string[]>();
      filteredTeaCategoryLinks.forEach((link: any) => {
        if (!teaCategoryMap.has(link.productId)) {
          teaCategoryMap.set(link.productId, []);
        }
        teaCategoryMap.get(link.productId)!.push(link.teaCategorySlug);
      });

      const variationsByProduct = new Map<number, any[]>();
      filteredVariations.forEach((variation: any) => {
        if (variation.productId) {
          if (!variationsByProduct.has(variation.productId)) {
            variationsByProduct.set(variation.productId, []);
          }
          variationsByProduct.get(variation.productId)!.push(variation);
        }
      });

      const attributesByVariation = new Map<number, any[]>();
      filteredAttributes.forEach((attr: any) => {
        if (attr.productVariationId) {
          if (!attributesByVariation.has(attr.productVariationId)) {
            attributesByVariation.set(attr.productVariationId, []);
          }
          attributesByVariation.get(attr.productVariationId)!.push(attr);
        }
      });

      const productsArray = productsResult.map((product: any) => {
        const variations = variationsByProduct.get(product.id) || [];
        const teaCategories = teaCategoryMap.get(product.id) || [];

        const variationsWithAttributes = variations
          .map((variation) => ({
            ...variation,
            attributes: attributesByVariation.get(variation.id) || [],
          }))
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

        return {
          ...product,
          variations: variationsWithAttributes,
          teaCategories,
        };
      });

      return {
        products: productsArray,
        categories: categoriesResult,
        teaCategories: teaCategoriesResult,
      };
    } catch (error) {
      console.error("Error fetching store data:", error);
      setResponseStatus(500);
      throw new Error("Failed to fetch store data");
    }
  }
);
