import { Product } from "~/types";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "./ProductCard";
import { memo, useMemo } from "react";
import { ProductCardSkeleton } from "./skeletons/ProductCardSkeleton";

interface ProductListProps {
  data: Product[];
  isLoading?: boolean;
}

// Memoize individual product items to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard);

// Memoize the entire ProductList component
const ProductList = memo(function ProductList({ data, isLoading = false }: ProductListProps) {
  // Memoize the motion variants to prevent recreation
  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, filter: "blur(8px)", y: 20 },
      visible: (index: number) => ({
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          type: "spring",
          bounce: 0.4,
          duration: 0.5,
          delay: index * 0.05, // Always apply stagger delay
        },
      }),
    }),
    []
  );

  const containerVariants = useMemo(
    () => ({
      hidden: {
        opacity: 1,
      },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05, // Always apply stagger
          delayChildren: 0.1, // Always apply initial delay
        },
      },
    }),
    []
  );

  // Show skeleton cards when loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20">
        {Array.from({ length: 8 }, (_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key="product-grid"
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.length === 0 ? (
          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-center text-lg col-span-full"
          >
            No products found.
          </motion.p>
        ) : (
          data.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              variants={itemVariants}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              <MemoizedProductCard product={product} />
            </motion.div>
          ))
        )}
      </motion.div>
    </AnimatePresence>
  );
});

export default ProductList;
