import { motion } from "motion/react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function ProductGridSkeleton() {
  return (
    <div className="px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-4 mb-20"
      >
        {/* Generate 12 skeleton cards for a full grid appearance */}
        {Array.from({ length: 12 }, (_, index) => (
          <ProductCardSkeleton key={index} index={index} />
        ))}
      </motion.div>
    </div>
  );
}
