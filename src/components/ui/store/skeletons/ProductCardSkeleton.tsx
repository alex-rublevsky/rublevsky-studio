import { Skeleton } from "~/components/ui/dashboard/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="w-full product-card overflow-hidden group bg-background flex flex-col">
      {/* Image skeleton */}
      <div className="relative aspect-square overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col h-auto md:h-full">
        {/* Info Section */}
        <div className="p-4 flex flex-col h-auto md:h-full">
          {/* Price skeleton */}
          <div className="flex flex-col mb-2">
            <div className="flex flex-wrap items-baseline justify-between w-full gap-x-2">
              <div className="flex flex-col items-baseline gap-1">
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="mt-1">
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>

          {/* Product Name skeleton */}
          <Skeleton className="h-5 w-3/4 mb-3" />

          {/* Variations skeleton */}
          <div className="space-y-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Add to Cart button skeleton */}
        <div className="md:hidden mt-auto">
          <Skeleton className="h-10 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
} 