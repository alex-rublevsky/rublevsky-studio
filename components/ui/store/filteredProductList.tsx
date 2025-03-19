"use client";

import { useState, useMemo, useEffect } from "react";
import { Category, TeaCategory, ProductWithVariations } from "@/types";
import ProductList from "./productList";
import ProductFilters from "./productFilters";

interface FilteredProductListProps {
  products: ProductWithVariations[];
  categories: Category[];
  teaCategories: TeaCategory[];
}

export default function FilteredProductList({
  products = [],
  categories = [],
  teaCategories = [],
}: FilteredProductListProps) {
  // Calculate min and max prices from products and their variations
  const { minPrice, maxPrice } = useMemo(() => {
    const allPrices = products.flatMap((product) => {
      const prices = [product.price];
      // Include variation prices if they exist
      if (product.variations && product.variations.length > 0) {
        prices.push(...product.variations.map((variation) => variation.price));
      }
      return prices;
    });

    return {
      minPrice: Math.floor(Math.min(...allPrices, 0)),
      maxPrice: Math.ceil(Math.max(...allPrices, 0)),
    };
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTeaCategory, setSelectedTeaCategory] = useState<string | null>(
    null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);

  // Update price range when min/max prices change
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Filter tea categories to only show those that are used in products
  const filteredTeaCategories = useMemo(() => {
    const usedCategories = new Set(
      products.flatMap((product) => product.teaCategories || [])
    );
    return teaCategories.filter((category) =>
      usedCategories.has(category.slug)
    );
  }, [products, teaCategories]);

  // Filter products based on selected categories and price range
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categorySlug === selectedCategory
      );
    }

    // Apply tea category filter (only when tea category is selected)
    if (selectedCategory === "tea" && selectedTeaCategory) {
      filtered = filtered.filter((product) =>
        product.teaCategories?.includes(selectedTeaCategory)
      );
    }

    // Apply price range filter (check both base price and variation prices)
    filtered = filtered.filter((product) => {
      const basePrice = product.price;
      const variationPrices = product.variations?.map((v) => v.price) || [];
      const allPrices = [basePrice, ...variationPrices];

      // Product matches if any of its prices fall within the range
      return allPrices.some(
        (price) => price >= priceRange[0] && price <= priceRange[1]
      );
    });

    return filtered;
  }, [products, selectedCategory, selectedTeaCategory, priceRange]);

  return (
    <div className="space-y-8">
      <ProductFilters
        categories={categories}
        teaCategories={filteredTeaCategories}
        selectedCategory={selectedCategory}
        selectedTeaCategory={selectedTeaCategory}
        onCategoryChange={setSelectedCategory}
        onTeaCategoryChange={setSelectedTeaCategory}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceRangeChange={setPriceRange}
      />
      <ProductList data={filteredProducts} />
    </div>
  );
}
