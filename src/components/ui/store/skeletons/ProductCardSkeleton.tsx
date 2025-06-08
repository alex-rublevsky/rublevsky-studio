import { Skeleton } from "~/components/ui/dashboard/skeleton";
import { Badge } from "~/components/ui/shared/Badge";
import styles from "../productCard.module.css";

export function ProductCardSkeleton() {
  return (
    <div className="block h-full relative">
      <div
        className="w-full product-card overflow-hidden group"
        id={styles.productCard}
      >
        <div className="bg-background flex flex-col">
          {/* Image section - matching exact structure with square corners */}
          <div className="relative aspect-square overflow-hidden">
            <div>
              {/* Primary Image container */}
              <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
              </div>
            </div>

            {/* Desktop Add to Cart button - invisible but present for layout */}
            <button
              className="absolute bottom-0 left-0 right-0 hidden md:flex items-center justify-center space-x-2 bg-muted/70 backdrop-blur-xs text-black transition-all duration-500 py-2 opacity-0 pointer-events-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 33 30"
                className="cart-icon"
              >
                <path
                  d="M1.94531 1.80127H7.27113L11.9244 18.602C12.2844 19.9016 13.4671 20.8013 14.8156 20.8013H25.6376C26.9423 20.8013 28.0974 19.958 28.495 18.7154L31.9453 7.9303H19.0041"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="13.4453" cy="27.3013" r="2.5" fill="currentColor" />
                <circle cx="26.4453" cy="27.3013" r="2.5" fill="currentColor" />
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Content Section */}
          <div className="flex flex-col h-auto md:h-full">
            {/* Info Section */}
            <div className="p-4 flex flex-col h-auto md:h-full">
              {/* Price and Stock */}
              <div className="flex flex-col mb-2">
                <div className="flex flex-wrap items-baseline justify-between w-full gap-x-2">
                  <div className="flex flex-col items-baseline gap-1">
                    <Skeleton className="h-6 w-20" />
                  </div>

                  <div className="mt-1 text-xs">
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <Skeleton className="h-5 w-3/4 mb-3" />

              {/* Variations */}
              <div className="space-y-2">
                {/* First variation group */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-8 mb-1" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-7 w-8 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                </div>
                
                {/* Second variation group */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-10 mb-1" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-7 w-10 rounded-full" />
                    <Skeleton className="h-7 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Add to Cart button */}
            <div className="md:hidden mt-auto">
              <Skeleton className="h-10 w-full rounded-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 