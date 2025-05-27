import { useState, useMemo, useEffect } from "react";
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
  const [sortBy, setSortBy] = useState<string>("relevant");
  // Calculate dynamic price range from products
  const dynamicPriceRange = useMemo(() => {
    if (!products.length) return { min: 0, max: 100 };

    const allPrices = products.flatMap((product) => {
      if (product.hasVariations && product.variations?.length) {
        return product.variations.map((v) => v.price);
      }
      return [product.price];
    });

    return {
      min: Math.floor(Math.min(...allPrices)),
      max: Math.ceil(Math.max(...allPrices)),
    };
  }, [products]);

  // Update local price range when products change
  const effectivePriceRange = priceRange || dynamicPriceRange;

  // Initialize price range state
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    effectivePriceRange.min,
    effectivePriceRange.max,
  ]);

  // Update local price range when effective range changes
  useEffect(() => {
    setLocalPriceRange([effectivePriceRange.min, effectivePriceRange.max]);
  }, [effectivePriceRange]);

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
          maxVariationPrice >= localPriceRange[0] &&
          minVariationPrice <= localPriceRange[1]
        );
      }
      // For products without variations, check the base price
      return (
        product.price >= localPriceRange[0] &&
        product.price <= localPriceRange[1]
      );
    });

    return filtered;
  }, [products, selectedCategory, selectedTeaCategory, localPriceRange]);

  // Sort products based on selected sort option
  const sortedAndFilteredProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "relevant":
        return sorted.sort((a, b) => {
          // Define category order: apparel, posters, produce, tea, stickers
          const categoryOrder: Record<string, number> = {
            apparel: 1,
            posters: 2,
            produce: 3,
            tea: 4,
            stickers: 5,
          };

          const aOrder = categoryOrder[a.categorySlug || ""] || 6;
          const bOrder = categoryOrder[b.categorySlug || ""] || 6;

          // If categories are the same, sort by creation date (newest first)
          if (aOrder === bOrder) {
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
          }

          return aOrder - bOrder;
        });

      case "price-asc":
        return sorted.sort((a, b) => {
          const aPrice =
            a.hasVariations && a.variations?.length
              ? Math.min(...a.variations.map((v) => v.price))
              : a.price;
          const bPrice =
            b.hasVariations && b.variations?.length
              ? Math.min(...b.variations.map((v) => v.price))
              : b.price;
          return aPrice - bPrice;
        });
      case "price-desc":
        return sorted.sort((a, b) => {
          const aPrice =
            a.hasVariations && a.variations?.length
              ? Math.max(...a.variations.map((v) => v.price))
              : a.price;
          const bPrice =
            b.hasVariations && b.variations?.length
              ? Math.max(...b.variations.map((v) => v.price))
              : b.price;
          return bPrice - aPrice;
        });
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  return (
    <section className="space-y-8 [view-transition-name:main-content]">
      <ProductFilters
        categories={categories}
        teaCategories={filteredTeaCategories}
        selectedCategory={selectedCategory}
        selectedTeaCategory={selectedTeaCategory}
        onCategoryChange={setSelectedCategory}
        onTeaCategoryChange={setSelectedTeaCategory}
        priceRange={effectivePriceRange}
        onPriceRangeChange={setLocalPriceRange}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <ProductList data={sortedAndFilteredProducts} />
    </section>
  );
}
