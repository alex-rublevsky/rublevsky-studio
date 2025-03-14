"use client";

import { useState, useMemo } from "react";
import { Category, TeaCategory, Product } from "@/types";
import ProductList from "./productList";
import ProductFilters from "./productFilters";

interface FilteredProductListProps {
  products: Product[];
  categories: Category[];
  teaCategories: TeaCategory[];
}

export default function FilteredProductList({
  products = [],
  categories = [],
  teaCategories = [],
}: FilteredProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTeaCategory, setSelectedTeaCategory] = useState<string | null>(
    null
  );

  // Filter tea categories to only show those that are used in products
  const filteredTeaCategories = useMemo(() => {
    const usedCategories = new Set(
      products.flatMap((product) => product.teaCategories || [])
    );
    return teaCategories.filter((category) =>
      usedCategories.has(category.slug)
    );
  }, [products, teaCategories]);

  // Filter products based on selected categories
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

    return filtered;
  }, [products, selectedCategory, selectedTeaCategory]);

  return (
    <div className="space-y-8">
      <ProductFilters
        categories={categories}
        teaCategories={filteredTeaCategories}
        selectedCategory={selectedCategory}
        selectedTeaCategory={selectedTeaCategory}
        onCategoryChange={setSelectedCategory}
        onTeaCategoryChange={setSelectedTeaCategory}
      />
      <ProductList data={filteredProducts} />
    </div>
  );
}
