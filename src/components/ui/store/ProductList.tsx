import { Product } from "~/types";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "./skeletons/ProductCardSkeleton";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import { useEffect, useState } from "react";

interface ProductListProps {
  data: Product[];
  isLoading?: boolean;
}

const STORE_ANIMATION_KEY = 'store-products-animated';

function ProductList({ data, isLoading = false }: ProductListProps) {
  const [shouldAnimate, setShouldAnimate] = useState<boolean | null>(null); // null = loading state

  useEffect(() => {
    // Check if products have been animated in this browser session
    const hasAnimated = sessionStorage.getItem(STORE_ANIMATION_KEY) === 'true';
    
    if (hasAnimated) {
      // Already animated in this session - show immediately
      setShouldAnimate(false);
    } else {
      // First time this session - animate and remember
      setShouldAnimate(true);
      sessionStorage.setItem(STORE_ANIMATION_KEY, 'true');
    }
  }, []); // Only run once on mount

  // Show skeleton cards when loading OR when determining animation state
  if (isLoading || shouldAnimate === null) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20">
        {Array.from({ length: 8 }, (_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20">
        <p className="text-center text-lg col-span-full">No products found.</p>
      </div>
    );
  }

  // Animate on first visit, show immediately on subsequent visits
  if (shouldAnimate) {
    return (
      <AnimatedGroup
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20"
        once={false}  // We handle the "once" logic ourselves
        amount={0.1}   // Low threshold since we want it to trigger reliably
        delay={0.1}
        staggerChildren={0.06}
      >
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatedGroup>
    );
  }

  // No animation - show immediately
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;
