import { motion } from "motion/react";
import { cn } from "~/utils/utils";

interface ProductCardSkeletonProps {
  className?: string;
  index?: number;
}

export function ProductCardSkeleton({
  className,
  index = 0,
}: ProductCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      className={cn("block h-full relative", className)}
    >
      <div className="w-full product-card overflow-hidden rounded-lg group">
        <div className="bg-background flex flex-col">
          {/* Image skeleton - matches exact aspect-square */}
          <div className="relative aspect-square overflow-hidden">
            <div className="absolute inset-0 bg-muted/30 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
            </div>
          </div>

          {/* Content Section - matches ProductCard structure */}
          <div className="flex flex-col h-auto md:h-full">
            {/* Info Section */}
            <div className="p-4 flex flex-col h-auto md:h-full">
              {/* Price and Stock section */}
              <div className="flex flex-col mb-2">
                <div className="flex flex-wrap items-baseline justify-between w-full gap-x-2">
                  <div className="flex flex-col items-baseline gap-1">
                    {/* Main price skeleton */}
                    <div className="h-5 bg-muted/40 rounded w-20 animate-pulse" />
                    {/* Secondary price/discount skeleton */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-muted/30 rounded w-14 animate-pulse" />
                      <div className="h-4 bg-muted/25 rounded-full w-12 animate-pulse" />
                    </div>
                  </div>

                  {/* Stock badge skeleton */}
                  <div className="mt-1">
                    <div className="h-5 bg-muted/25 rounded-full w-16 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Product Name skeleton */}
              <div className="mb-3">
                <div className="h-4 bg-muted/40 rounded animate-pulse" />
              </div>

              {/* Variations skeleton */}
              <div className="space-y-2">
                {/* First variation group */}
                <div className="space-y-1">
                  <div className="h-3 bg-muted/30 rounded w-16 animate-pulse" />
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className="h-6 bg-muted/25 rounded w-12 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
                {/* Second variation group */}
                <div className="space-y-1">
                  <div className="h-3 bg-muted/25 rounded w-12 animate-pulse" />
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 2 }, (_, i) => (
                      <div
                        key={i}
                        className="h-6 bg-muted/20 rounded w-10 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Add to Cart button */}
            <div className="md:hidden mt-auto">
              <div className="w-full h-10 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>

          {/* Desktop Add to Cart button - positioned absolutely like real component */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0">
            <div className="h-10 bg-muted/20 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
