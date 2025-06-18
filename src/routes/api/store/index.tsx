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
        
        // For products with variations, calculate stock per country based on variations
        if (product.hasVariations && variationsWithAttributes.length > 0) {
          // Reset the map for variation-based calculation
          countryStockMap.clear();
          
          // Group variations by country and sum their stock
          variationsWithAttributes.forEach(variation => {
            const countryCode = variation.shippingFrom || product.shippingFrom;
            if (countryCode && countryCode !== '' && countryCode !== 'NONE') {
              const variationStock = variation.stock || 0;
              
              // Handle the combined CA_OR_RU case by splitting it into individual countries
              if (countryCode === 'CA_OR_RU') {
                // Add stock to both CA and RU
                const currentCAStock = countryStockMap.get('CA') || 0;
                const currentRUStock = countryStockMap.get('RU') || 0;
                countryStockMap.set('CA', currentCAStock + variationStock);
                countryStockMap.set('RU', currentRUStock + variationStock);
              } else {
                // Handle individual country codes normally
                const currentStock = countryStockMap.get(countryCode) || 0;
                countryStockMap.set(countryCode, currentStock + variationStock);
              }
            }
          });
          
          // If no variations have shipping countries, fall back to product's shipping country
          if (countryStockMap.size === 0 && product.shippingFrom && product.shippingFrom !== '' && product.shippingFrom !== 'NONE') {
            // Calculate total stock from all variations for the product's shipping country
            const totalVariationStock = variationsWithAttributes.reduce((sum, variation) => sum + (variation.stock || 0), 0);
            
            // Handle the combined case for product-level shipping
            if (product.shippingFrom === 'CA_OR_RU') {
              countryStockMap.set('CA', totalVariationStock);
              countryStockMap.set('RU', totalVariationStock);
            } else {
              countryStockMap.set(product.shippingFrom, totalVariationStock);
            }
          }
        } else {
          // For products without variations, use product's own stock and shipping country
          if (product.shippingFrom && product.shippingFrom !== '' && product.shippingFrom !== 'NONE') {
            const productStock = product.stock || 0;
            
            // Handle the combined case for product-level shipping
            if (product.shippingFrom === 'CA_OR_RU') {
              countryStockMap.set('CA', productStock);
              countryStockMap.set('RU', productStock);
            } else {
              countryStockMap.set(product.shippingFrom, productStock);
            }
          }
        }

        // Convert to structured format with pre-calculated display data
        const countryStock = Array.from(countryStockMap.entries())
          .map(([countryCode, stock]) => {
            // Pre-calculate emoji on server - only individual countries now
            let emoji = "🌍";
            if (countryCode === 'CA') emoji = "🇨🇦";
            else if (countryCode === 'RU') emoji = "🇷🇺";
            
            return { countryCode, stock, emoji };
          })
          .sort((a, b) => {
            // Sort by country code to ensure consistent ordering (CA first, then RU)
            const order = { 'CA': 1, 'RU': 2 };
            return (order[a.countryCode as keyof typeof order] || 99) - (order[b.countryCode as keyof typeof order] || 99);
          });

        // Pre-calculate display logic
        const hasWeight = product.weight && product.weight !== '' && product.weight !== '0';
        const isSticker = product.categorySlug === "stickers";
        const totalStock = countryStock.reduce((sum, country) => sum + country.stock, 0);
        
        // Determine if we should show stock values or just shipping info
        const showInStock = hasWeight || (!product.unlimitedStock && !isSticker && totalStock > 0);
        
        // For unlimited stock or stickers, we need to show countries even if stock is 0
        const displayCountries = showInStock 
          ? (hasWeight 
              ? countryStock // For weight-based products, show all countries regardless of stock
              : countryStock.filter(country => country.stock > 0) // Only show countries with stock for regular products
            )
          : countryStock.length > 0 
            ? countryStock // Show all countries for unlimited stock products
            : Array.from(countryStockMap.entries()).map(([countryCode, stock]) => {
                let emoji = "🌍";
                if (countryCode === 'CA') emoji = "🇨🇦";
                else if (countryCode === 'RU') emoji = "🇷🇺";
                return { countryCode, stock, emoji };
              }); // Fallback to all countries in map
        
        // Pre-calculate display text and values
        const stockDisplay = {
          label: showInStock ? "In stock: " : "Shipping from: ",
          showValues: showInStock,
          countries: displayCountries.map(country => ({
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
