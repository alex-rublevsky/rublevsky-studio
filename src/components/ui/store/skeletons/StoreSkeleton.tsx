import { motion } from "motion/react";
import { ProductFiltersSkeleton } from "./ProductFiltersSkeleton";
import { ProductGridSkeleton } from "./ProductGridSkeleton";

export function StoreSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="no-padding space-y-8 [view-transition-name:main-content]"
    >
      {/* Filters skeleton */}
      <div className="px-4 sm:px-6">
        <ProductFiltersSkeleton />
      </div>
      
      {/* Products grid skeleton */}
      <ProductGridSkeleton />
    </motion.section>
  );
}
