import { Product } from "~/types";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "./skeletons/ProductCardSkeleton";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import { useEffect, useState } from "react";
import { useDeviceType } from "~/hooks/use-mobile";
import { motion, AnimatePresence } from "motion/react";

interface ProductListProps {
  data: Product[];
  isLoading?: boolean;
}

const STORE_ANIMATION_KEY = 'store-products-animated';

function ProductList({ data, isLoading = false }: ProductListProps) {
  const [shouldAnimate, setShouldAnimate] = useState<boolean | null>(null); // null = loading state
  const { isMobileOrTablet } = useDeviceType();

  useEffect(() => {
    // Check if products have been animated in this browser session
    const hasAnimated = sessionStorage.getItem(STORE_ANIMATION_KEY) === 'true';
    
    if (hasAnimated || isMobileOrTablet) {
      // Already animated in this session OR on mobile/tablet - show immediately
      setShouldAnimate(false);
    } else {
      // First time this session on desktop - animate and remember
      setShouldAnimate(true);
      sessionStorage.setItem(STORE_ANIMATION_KEY, 'true');
    }
  }, [isMobileOrTablet]); // Re-run if device type changes

  // Show skeleton cards when loading OR when determining animation state
  if (isLoading || shouldAnimate === null) {
    // Show enough skeletons to maintain page height for proper scroll restoration
    // 32 skeletons should be enough to cover most scroll positions
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20">
        {Array.from({ length: 32 }, (_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Animate on first visit (desktop only), show immediately on subsequent visits or mobile
  if (shouldAnimate) {
    return (
      <AnimatedGroup
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20"
        once={false}  // We handle the "once" logic ourselves
        amount={0.05}   // Even lower threshold for better mobile compatibility
        delay={0.1}
        staggerChildren={0.06}
      >
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatedGroup>
    );
  }

  // Always use layout animations for filtering changes (like blog page)
  return (
    <AnimatePresence mode="popLayout">
      {data.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-lg col-span-full"
        >
          No products found.
        </motion.p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20">
          {data.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default ProductList;
