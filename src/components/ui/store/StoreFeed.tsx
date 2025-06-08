import { useState, useMemo, useEffect } from "react";
import { Category, TeaCategory, ProductWithVariations } from "~/types";
import ProductList from "./ProductList";
import ProductFilters from "./ProductFilters";
import { isProductAvailable } from "~/utils/validateStock";
import { useCart } from "~/lib/cartContext";
import { ProductFiltersSkeleton } from "./skeletons/ProductFiltersSkeleton";

interface StoreFeedProps {
  products: ProductWithVariations[];
  categories?: Category[];
  teaCategories?: TeaCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
}

// Helper function to get product price range
const getProductPriceRange = (product: ProductWithVariations) => {
  // If product has variations, always use variation prices
  if (product.hasVariations && product.variations?.length) {
    const prices = product.variations.map((v) => v.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
  // If product price is zero and no variations, return 0
  if (product.price === 0) {
    return { min: 0, max: 0 };
  }
  return { min: product.price, max: product.price };
};

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

  const { cart, isLoading } = useCart();

  // Pre-calculate price ranges for all products (eliminates redundant calculations)
  const productsWithPriceRanges = useMemo(() => {
    return products.map((product) => ({
      ...product,
      priceRange: getProductPriceRange(product),
    }));
  }, [products]);

  // Calculate dynamic price range from pre-calculated ranges
  const dynamicPriceRange = useMemo(() => {
    if (!productsWithPriceRanges.length) return { min: 0, max: 100 };

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    productsWithPriceRanges.forEach(({ priceRange }) => {
      minPrice = Math.min(minPrice, priceRange.min);
      maxPrice = Math.max(maxPrice, priceRange.max);
    });

    return {
      min: Math.floor(minPrice),
      max: Math.ceil(maxPrice),
    };
  }, [productsWithPriceRanges]);

  const effectivePriceRange = priceRange || dynamicPriceRange;

  // Simple state for user's price range selection
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    effectivePriceRange.min,
    effectivePriceRange.max,
  ]);

  // Reset price range when data bounds change (e.g., new products loaded)
  useEffect(() => {
    setLocalPriceRange([effectivePriceRange.min, effectivePriceRange.max]);
  }, [effectivePriceRange.min, effectivePriceRange.max]);

  // Filter tea categories based on available products
  const filteredTeaCategories = useMemo(() => {
    const usedCategories = new Set<string>();
    products.forEach((product) => {
      product.teaCategories?.forEach((cat) => usedCategories.add(cat));
    });
    return teaCategories.filter((category) =>
      usedCategories.has(category.slug)
    );
  }, [products, teaCategories]);

  // Apply filters and sorting using pre-calculated price ranges
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...productsWithPriceRanges];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categorySlug === selectedCategory
      );
    }

    // Apply tea category filter
    if (selectedCategory === "tea" && selectedTeaCategory) {
      filtered = filtered.filter((product) =>
        product.teaCategories?.includes(selectedTeaCategory)
      );
    }

    // Apply price range filter using pre-calculated ranges
    const [minPrice, maxPrice] = localPriceRange;
    filtered = filtered.filter((product) => {
      const { min, max } = product.priceRange;
      return max >= minPrice && min <= maxPrice;
    });

    // Apply sorting with consistent stock-first approach
    filtered.sort((a, b) => {
      // First priority: Check stock availability for both products
      const aAvailable = isProductAvailable(a, cart.items);
      const bAvailable = isProductAvailable(b, cart.items);

      // Available products always come before out of stock products
      if (aAvailable !== bAvailable) {
        return aAvailable ? -1 : 1;
      }

      // Second priority: Apply the selected sorting method using pre-calculated ranges
      if (sortBy === "price-asc") {
        const aPriceMin = a.priceRange.min;
        const bPriceMin = b.priceRange.min;
        if (aPriceMin !== bPriceMin) {
          return aPriceMin - bPriceMin;
        }
      } else if (sortBy === "price-desc") {
        const aPriceMax = a.priceRange.max;
        const bPriceMax = b.priceRange.max;
        if (aPriceMax !== bPriceMax) {
          return bPriceMax - aPriceMax;
        }
      } else if (sortBy === "newest") {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        if (aDate !== bDate) {
          return bDate - aDate;
        }
      } else {
        // Default: Custom category order - Produce first, Tea second, Stickers third
        const categoryOrder = {
          apparel: 1,
          posters: 2,
          tea: 3,
          stickers: 4,
          produce: 5,
        };

        const aCategoryOrder =
          categoryOrder[a.categorySlug as keyof typeof categoryOrder] || 999;
        const bCategoryOrder =
          categoryOrder[b.categorySlug as keyof typeof categoryOrder] || 999;

        if (aCategoryOrder !== bCategoryOrder) {
          return aCategoryOrder - bCategoryOrder;
        }
      }

      // Final fallback: Sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [
    productsWithPriceRanges,
    selectedCategory,
    selectedTeaCategory,
    localPriceRange,
    sortBy,
    cart.items,
  ]);

  return (
    <section className="no-padding space-y-8 [view-transition-name:main-content]">
      {isLoading ? (
        <ProductFiltersSkeleton />
      ) : (
        <ProductFilters
          categories={categories}
          teaCategories={filteredTeaCategories}
          selectedCategory={selectedCategory}
          selectedTeaCategory={selectedTeaCategory}
          onCategoryChange={setSelectedCategory}
          onTeaCategoryChange={setSelectedTeaCategory}
          priceRange={effectivePriceRange}
          currentPriceRange={localPriceRange}
          onPriceRangeChange={setLocalPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}
      <div className="px-0 sm:px-6">
        <ProductList data={filteredAndSortedProducts} isLoading={isLoading} />
      </div>
    </section>
  );
}
