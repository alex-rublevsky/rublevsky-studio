"use client";

import { useState, useMemo, useEffect } from "react";
import { Category, TeaCategory, Product } from "@/types";
import ProductList from "./productList";
import ProductFilters from "./productFilters";

interface StoreFeedProps {
  products: Product[];
  categories: Category[];
  teaCategories: TeaCategory[];
}

export default function StoreFeed({
  products = [],
  categories = [],
  teaCategories = [],
}: StoreFeedProps) {
  // Calculate min and max prices from products
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = products.map((product) => product.price);
    return {
      minPrice: Math.floor(Math.min(...prices, 0)),
      maxPrice: Math.ceil(Math.max(...prices, 0)),
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

    // Apply price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

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
