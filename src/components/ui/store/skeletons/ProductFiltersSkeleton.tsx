import { Skeleton } from "~/components/ui/dashboard/skeleton";
import { useDeviceType } from "~/hooks/use-mobile";
import styles from "../ProductFilters.module.css";

export function ProductFiltersSkeleton() {
  const { isMobileOrTablet } = useDeviceType();

  return (
    <div
      className={`sticky overflow-hidden top-3 mt-0 z-10 w-full ${isMobileOrTablet ? "px-2" : ""}`}
    >
      <div className={`relative ${isMobileOrTablet ? "w-full max-w-screen-sm mx-auto" : "w-max mx-auto"}`}>
        <div className={`${styles.backdrop} bg-background/50 rounded-3xl`} />
        
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <mask id="frostyGlassMask">
            <rect
              width="100%"
              height="100%"
              fill="white"
              rx="24"
              ry="24"
            />
          </mask>
        </svg>
        
        <div
          className={`relative flex flex-col gap-3 ${isMobileOrTablet ? "px-4 sm:px-6" : "px-6"} py-3`}
        >
          {isMobileOrTablet ? (
            /* Mobile Layout */
            <div className="space-y-4">
              {/* First Row: Categories and Sort By */}
              <div className="flex gap-4 items-start">
                {/* Categories section */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2 flex-wrap">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-8 w-14" />
                      <Skeleton className="h-8 w-18" />
                    </div>
                  </div>
                </div>

                {/* Sort By Filter - Right side, compact */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-9 w-[15ch]" />
                </div>
              </div>

              {/* Price Range Filter - Full width */}
              <div className="pt-3 pb-5 lg:pt-0">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Layout */
            <div className="flex gap-10">
              {/* Main Categories */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-8 w-18" />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-32" />
              </div>

              {/* Sort By Filter */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-[15ch]" />
              </div>
            </div>
          )}
          
          {/* Bottom handle indicator */}
          <div className="mx-auto h-1.5 w-[5rem] rounded-full bg-secondary shrink-0" />
        </div>
      </div>
    </div>
  );
} 