import { motion } from "motion/react";
import { useIsMobile } from "~/hooks/use-mobile";

export function ProductFiltersSkeleton() {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="md:sticky top-0 z-10 backdrop-blur-md bg-background/60 py-4 w-full"
    >
      <div className="flex flex-col gap-6 md:gap-10 px-4 sm:px-6">
        {isMobile ? (
          /* Mobile Layout: Categories + Sort By on top, Price Range below */
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {/* Categories section - compact on mobile */}
              <div className="flex flex-col gap-4 flex-1">
                {/* Main Categories - only one set by default */}
                <div className="space-y-2">
                  <div className="h-4 bg-muted/40 rounded w-20 animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <div
                        key={index}
                        className="h-8 bg-muted/30 rounded-full animate-pulse"
                        style={{ 
                          width: `${Math.random() * 20 + 60}px`,
                          animationDelay: `${index * 100}ms` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort By Filter - Right side on mobile */}
              <div className="flex flex-col gap-2 self-start">
                <div className="h-3 bg-muted/30 rounded w-12 animate-pulse" />
                <div className="h-9 bg-muted/30 rounded w-24 animate-pulse" />
              </div>
            </div>

            {/* Price Range Filter skeleton */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-muted/30 rounded w-20 animate-pulse" />
                <div className="h-4 bg-muted/25 rounded w-16 animate-pulse" />
              </div>
              {/* Slider track with handles */}
              <div className="relative">
                <div className="h-2 bg-muted/20 rounded-full w-full animate-pulse" />
                {/* Slider handles */}
                <div className="absolute top-0 left-2 w-4 h-4 bg-muted/40 rounded-full -translate-y-1 animate-pulse" />
                <div className="absolute top-0 right-8 w-4 h-4 bg-muted/40 rounded-full -translate-y-1 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout: All filters in one row */
          <div className="flex gap-10">
            {/* Categories Filter - only one set by default */}
            <div className="space-y-2">
              <div className="h-4 bg-muted/40 rounded w-20 animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className="h-8 bg-muted/30 rounded-full animate-pulse"
                    style={{ 
                      width: `${Math.random() * 20 + 60}px`,
                      animationDelay: `${index * 100}ms` 
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Price Range - Desktop */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-muted/30 rounded w-20 animate-pulse" />
                <div className="h-4 bg-muted/25 rounded w-16 animate-pulse" />
              </div>
              {/* Slider track with handles */}
              <div className="relative">
                <div className="h-2 bg-muted/20 rounded-full w-32 animate-pulse" />
                {/* Slider handles */}
                <div className="absolute top-0 left-1 w-4 h-4 bg-muted/40 rounded-full -translate-y-1 animate-pulse" />
                <div className="absolute top-0 right-2 w-4 h-4 bg-muted/40 rounded-full -translate-y-1 animate-pulse" />
              </div>
            </div>

            {/* Sort Dropdown - Desktop */}
            <div className="flex flex-col gap-2 self-start">
              <div className="h-3 bg-muted/30 rounded w-12 animate-pulse" />
              <div className="h-10 bg-muted/25 rounded w-32 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
