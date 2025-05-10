// //TODO add data caching for getAllProducts and getProductBySlug
// //TODO optimize stock validation to check with locally stored value?
// //TODO implement bulk stock validation (all items at once) for cart

// import { eq, desc, and, SQL, InferModel, sql } from "drizzle-orm";
// import db from "~/db";
// import {
//   products,
//   productVariations,
//   variationAttributes,
//   productTeaCategories,
// } from "~/schema";
// import {
//   ProductWithVariations,
//   ProductVariation,
//   VariationAttribute,
// } from "~/types";

// interface GetAllProductsOptions {
//   categorySlug?: string | null;
//   brandSlug?: string | null;
//   featured?: boolean;
//   includePriceRange?: boolean;
// }

// type ProductSelect = InferModel<typeof products, "select">;
// type VariationSelect = InferModel<typeof productVariations, "select">;
// type AttributeSelect = InferModel<typeof variationAttributes, "select">;
// type TeaCategorySelect = InferModel<typeof productTeaCategories, "select">;

// interface QueryRow {
//   products: ProductSelect;
//   product_variations: VariationSelect | null;
//   variation_attributes: AttributeSelect | null;
//   product_tea_categories: TeaCategorySelect | null;
// }

// interface GetAllProductsResult {
//   products: ProductWithVariations[];
//   priceRange: {
//     min: number;
//     max: number;
//   };
// }

// /**
//  * Fetch products from database with only the data needed for store listing
//  */
// export default async function getAllProducts({
//   categorySlug = null,
//   brandSlug = null,
//   featured = false,
// }: GetAllProductsOptions = {}): Promise<GetAllProductsResult> {
//   try {
//     // Build where conditions
//     const conditions: SQL[] = [eq(products.isActive, true)];
//     if (categorySlug !== null)
//       conditions.push(eq(products.categorySlug, categorySlug));
//     if (brandSlug !== null) conditions.push(eq(products.brandSlug, brandSlug));
//     if (featured) conditions.push(eq(products.isFeatured, true));

//     // Create custom category ordering
//     const categoryOrder = sql`CASE ${products.categorySlug}
//       WHEN 'apparel' THEN 1
//       WHEN 'posters' THEN 2
//       WHEN 'produce' THEN 3
//       WHEN 'tea' THEN 4
//       WHEN 'stickers' THEN 5
//       ELSE 6
//     END`;

//     // Execute a single query to get all necessary data
//     const rows = await db
//       .select()
//       .from(products)
//       .leftJoin(
//         productVariations,
//         and(
//           eq(productVariations.productId, products.id),
//           eq(products.hasVariations, true)
//         )
//       )
//       .leftJoin(
//         variationAttributes,
//         productVariations.id
//           ? eq(variationAttributes.productVariationId, productVariations.id)
//           : undefined
//       )
//       .leftJoin(
//         productTeaCategories,
//         eq(productTeaCategories.productId, products.id)
//       )
//       .where(and(...conditions))
//       .orderBy(categoryOrder, desc(products.createdAt));

//     // Process the results to group variations and attributes
//     const productMap = new Map<number, ProductWithVariations>();
//     let minPrice = Infinity;
//     let maxPrice = -Infinity;

//     rows.forEach((row: QueryRow) => {
//       if (!productMap.has(row.products.id)) {
//         // Convert weight to string if it exists
//         const weight =
//           row.products.weight !== null ? String(row.products.weight) : null;

//         productMap.set(row.products.id, {
//           ...row.products,
//           weight,
//           variations: [],
//           teaCategories: [],
//         });

//         // Consider base product price if no variations
//         if (!row.products.hasVariations && row.products.price) {
//           minPrice = Math.min(minPrice, row.products.price);
//           maxPrice = Math.max(maxPrice, row.products.price);
//         }
//       }

//       const product = productMap.get(row.products.id)!;

//       // Add tea category if it exists and isn't already added
//       if (
//         row.product_tea_categories?.teaCategorySlug &&
//         !product.teaCategories?.includes(
//           row.product_tea_categories.teaCategorySlug
//         )
//       ) {
//         product.teaCategories = [
//           ...(product.teaCategories || []),
//           row.product_tea_categories.teaCategorySlug,
//         ];
//       }

//       const variation = row.product_variations;

//       if (
//         variation &&
//         !product.variations?.find((v) => v.id === variation.id)
//       ) {
//         const newVariation: ProductVariation & {
//           attributes: VariationAttribute[];
//         } = {
//           id: variation.id,
//           productId: variation.productId!,
//           sku: variation.sku,
//           price: variation.price,
//           stock: variation.stock,
//           sort: variation.sort,
//           createdAt: variation.createdAt,
//           attributes: [],
//         };

//         // Consider variation price for price range
//         if (variation.price) {
//           minPrice = Math.min(minPrice, variation.price);
//           maxPrice = Math.max(maxPrice, variation.price);
//         }

//         if (row.variation_attributes) {
//           newVariation.attributes.push({
//             id: row.variation_attributes.id,
//             productVariationId: row.variation_attributes.productVariationId!,
//             attributeId: row.variation_attributes.attributeId,
//             value: row.variation_attributes.value,
//           });
//         }

//         product.variations = product.variations || [];
//         product.variations.push(newVariation);
//       } else if (row.variation_attributes && variation) {
//         const existingVariation = product.variations?.find(
//           (v) => v.id === variation.id
//         );
//         if (
//           existingVariation &&
//           !existingVariation.attributes.find(
//             (a) => a.id === row.variation_attributes!.id
//           )
//         ) {
//           existingVariation.attributes.push({
//             id: row.variation_attributes.id,
//             productVariationId: row.variation_attributes.productVariationId!,
//             attributeId: row.variation_attributes.attributeId,
//             value: row.variation_attributes.value,
//           });
//         }
//       }
//     });

//     // If no prices were found, set default values
//     if (minPrice === Infinity) minPrice = 0;
//     if (maxPrice === -Infinity) {
//       // If no prices found, calculate from products array
//       const allPrices = Array.from(productMap.values()).flatMap((product) => {
//         const prices = [];
//         if (!product.hasVariations && product.price) {
//           prices.push(product.price);
//         }
//         if (product.variations?.length) {
//           prices.push(...product.variations.map((v) => v.price));
//         }
//         return prices;
//       });
//       maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 1000;
//     }

//     return {
//       products: Array.from(productMap.values()),
//       priceRange: { min: minPrice, max: maxPrice },
//     };
//   } catch (error) {
//     throw new Error(`Failed to fetch products: ${(error as Error).message}`);
//   }
// }
