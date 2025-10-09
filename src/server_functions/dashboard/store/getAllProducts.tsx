import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { DB } from "~/db";
import {
  products,
  categories,
  teaCategories,
  brands,
  productVariations,
  variationAttributes,
  productTeaCategories,
} from "~/schema";

export const getAllProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const db = DB() as any;

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
        setResponseStatus(404);
        throw new Error("No products found");
      }

      // Group products and build variations
      const productMap = new Map<number, any>();
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
          (row: any) => row.product_variations?.id === variation.id
        )?.products.id;
        if (productId) {
          const product = productMap.get(productId);
          if (
            product &&
            !product.variations!.find((v: any) => v.id === variation.id)
          ) {
            product.variations!.push(variation);
          }
        }
      }

      // Sort variations by sort field
      for (const product of productMap.values()) {
        product.variations!.sort(
          (a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0)
        );
      }

      // Convert to array
      const productsArray = Array.from(productMap.values());

      // Group products by category and inactive status
      interface ProductGroup {
        title: string;
        products: any[];
        categorySlug?: string;
      }

      const groupedProducts: ProductGroup[] = [];
      const categoryOrder = ["tea", "posters"]; // Customize order as needed

      // Group active products by category
      const categoriesBySlug = new Map(
        categoriesResult.map((cat: any) => [cat.slug, cat])
      );

      const productsByCategory = new Map<string, any[]>();
      const inactive: any[] = [];

      // Single pass through products to categorize them
      for (const product of productsArray) {
        if (!product.isActive) {
          inactive.push(product);
        } else if (product.categorySlug) {
          const categoryProducts =
            productsByCategory.get(product.categorySlug) || [];
          categoryProducts.push(product);
          productsByCategory.set(product.categorySlug, categoryProducts);
        }
      }

      // Add category groups in specified order
      const allCategorySlugs = Array.from(productsByCategory.keys());
      const sortedCategorySlugs = allCategorySlugs.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });

      for (const slug of sortedCategorySlugs) {
        const products = productsByCategory.get(slug)!;
        const category: any = categoriesBySlug.get(slug);
        groupedProducts.push({
          title: category?.name || slug,
          products,
          categorySlug: slug,
        });
      }

      // Add inactive group
      if (inactive.length > 0) {
        groupedProducts.push({ title: "Inactive", products: inactive });
      }

      return {
        groupedProducts,
        categories: categoriesResult,
        teaCategories: teaCategoriesResult,
        brands: brandsResult,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setResponseStatus(500);
      throw new Error("Failed to fetch dashboard data");
    }
  }
);
