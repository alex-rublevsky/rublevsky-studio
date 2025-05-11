import { useState, useMemo } from "react";
import { Category, TeaCategory, ProductWithVariations } from "~/types";
import ProductList from "./ProductList";
import ProductFilters from "./ProductFilters";

interface StoreFeedProps {
  products: ProductWithVariations[];
  categories?: Category[];
  teaCategories?: TeaCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export default function StoreFeed({
  products = [],
  categories = [],
  teaCategories = [],
  priceRange,
}: StoreFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTeaCategory, setSelectedTeaCategory] = useState<string | null>(
    null
  );
  // const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
  //   priceRange.min,
  //   priceRange.max,
  // ]);

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
    filtered = filtered.filter((product) => {
      // For products with variations, check all variation prices
      if (product.hasVariations && product.variations?.length) {
        const variationPrices = product.variations.map((v) => v.price);
        const minVariationPrice = Math.min(...variationPrices);
        const maxVariationPrice = Math.max(...variationPrices);
        return (
          // maxVariationPrice >= localPriceRange[0] &&
          // minVariationPrice <= localPriceRange[1]
          null
        );
      }
      // For products without variations, check the base price
      return null;
      // product.price >= localPriceRange[0] &&
      // product.price <= localPriceRange[1]
    });

    return filtered;
  }, [
    products,
    selectedCategory,
    selectedTeaCategory,
    //localPriceRange
  ]);

  return (
    <div className="space-y-8 [view-transition-name:main-content]">
      {/* <ProductFilters
        categories={categories}
        teaCategories={filteredTeaCategories}
        selectedCategory={selectedCategory}
        selectedTeaCategory={selectedTeaCategory}
        onCategoryChange={setSelectedCategory}
        onTeaCategoryChange={setSelectedTeaCategory}
        priceRange={priceRange}
        onPriceRangeChange={setLocalPriceRange}
      /> */}
      <ProductList data={products} />
    </div>
  );
}
