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


export const APIRoute = createAPIFileRoute("/api/store")({
  GET: async ({ request, params }) => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    try {
      // Execute base queries in parallel - keeping this optimization
      const [categoriesResult, teaCategoriesResult, productsResult] = await Promise.all([
        db.select().from(categories),
        db.select().from(teaCategories),
        db.select().from(products).where(eq(products.isActive, true))
      ]);

      if (!productsResult.length) {
        return json(
          { message: "No products found" },
          { status: 404, headers: corsHeaders }
        );
      }

      // Get all related data with simple queries - avoiding inArray issues
      const [variationsResult, teaCategoryLinksResult, attributesResult] = await Promise.all([
        db.select().from(productVariations),
        db.select().from(productTeaCategories),
        db.select().from(variationAttributes)
      ]);

      // Filter results to only active products - keeping performance optimization
      const activeProductIds = new Set(productsResult.map(p => p.id));
      const filteredVariations = variationsResult.filter(v => v.productId && activeProductIds.has(v.productId));
      const filteredTeaCategoryLinks = teaCategoryLinksResult.filter(link => activeProductIds.has(link.productId));
      
      // Filter attributes to only variations from active products
      const activeVariationIds = new Set(filteredVariations.map(v => v.id));
      const filteredAttributes = attributesResult.filter(attr => attr.productVariationId && activeVariationIds.has(attr.productVariationId));

      // Build efficient O(1) lookup maps - keeping this major optimization
      const teaCategoryMap = new Map<number, string[]>();
      filteredTeaCategoryLinks.forEach(link => {
        if (!teaCategoryMap.has(link.productId)) {
          teaCategoryMap.set(link.productId, []);
        }
        teaCategoryMap.get(link.productId)!.push(link.teaCategorySlug);
      });

      const variationsByProduct = new Map<number, any[]>();
      filteredVariations.forEach(variation => {
        if (variation.productId) {
          if (!variationsByProduct.has(variation.productId)) {
            variationsByProduct.set(variation.productId, []);
          }
          variationsByProduct.get(variation.productId)!.push(variation);
        }
      });

      const attributesByVariation = new Map<number, any[]>();
      filteredAttributes.forEach(attr => {
        if (attr.productVariationId) {
          if (!attributesByVariation.has(attr.productVariationId)) {
            attributesByVariation.set(attr.productVariationId, []);
          }
          attributesByVariation.get(attr.productVariationId)!.push(attr);
        }
      });

      // Build final products array with all optimizations intact
      const productsArray = productsResult.map(product => {
        const variations = variationsByProduct.get(product.id) || [];
        const teaCategories = teaCategoryMap.get(product.id) || [];

        // Add attributes to variations and sort efficiently
        const variationsWithAttributes = variations.map(variation => ({
          ...variation,
          attributes: attributesByVariation.get(variation.id) || []
        })).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

        // Pre-calculate country stock on server for performance
        const countryStockMap = new Map<string, number>();
        
        // Add product country and stock
        if (product.shippingFrom && product.shippingFrom !== '' && product.shippingFrom !== 'NONE') {
          countryStockMap.set(product.shippingFrom, product.stock || 0);
        }
        
        // Add variation countries and their stock
        variationsWithAttributes.forEach(variation => {
          const countryCode = variation.shippingFrom || product.shippingFrom;
          if (countryCode && countryCode !== '' && countryCode !== 'NONE') {
            const currentStock = countryStockMap.get(countryCode) || 0;
            const variationStock = variation.stock || 0;
            countryStockMap.set(countryCode, currentStock + variationStock);
          }
        });

        // Convert to structured format with pre-calculated display data
        const countryStock = Array.from(countryStockMap.entries()).map(([countryCode, stock]) => {
          // Pre-calculate emoji on server
          let emoji = "🌍";
          if (countryCode === 'CA') emoji = "🇨🇦";
          else if (countryCode === 'RU') emoji = "🇷🇺";
          else if (countryCode === 'CA_OR_RU') emoji = "🇨🇦 & 🇷🇺";
          
          return { countryCode, stock, emoji };
        });

        // Pre-calculate display logic
        const hasWeight = product.weight && product.weight !== '' && product.weight !== '0';
        const totalStock = countryStock.reduce((sum, country) => sum + country.stock, 0);
        const showInStock = hasWeight || (!product.unlimitedStock && totalStock > 0);
        
        // Pre-calculate display text and values
        const stockDisplay = {
          label: showInStock ? "In stock: " : "Shipping from: ",
          showValues: showInStock,
          countries: countryStock.map(country => ({
            ...country,
            displayValue: showInStock 
              ? (hasWeight ? `${product.weight}g` : (country.stock > 0 ? country.stock.toString() : '0'))
              : null
          }))
        };

        return {
          ...product,
          variations: variationsWithAttributes,
          teaCategories,
          stockDisplay,
        };
      });

      return json({
        products: productsArray,
        categories: categoriesResult,
        teaCategories: teaCategoriesResult,
      }, { headers: corsHeaders });

    } catch (error) {
      console.error("Error fetching store data:", error);
      return json(
        { error: "Failed to fetch store data" },
        { status: 500, headers: corsHeaders }
      );
    }
  },
});
