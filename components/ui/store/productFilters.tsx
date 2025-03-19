"use client";

import { Category, TeaCategory } from "@/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

interface ProductFiltersProps {
  categories: Category[];
  teaCategories: TeaCategory[];
  selectedCategory: string | null;
  selectedTeaCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onTeaCategoryChange: (category: string | null) => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceRangeChange?: (range: [number, number]) => void;
}

export default function ProductFilters({
  categories,
  teaCategories,
  selectedCategory,
  selectedTeaCategory,
  onCategoryChange,
  onTeaCategoryChange,
  minPrice = 0,
  maxPrice = 0,
  onPriceRangeChange,
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);

  // Update local price range when min/max props change
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const handlePriceRangeChange = (newValue: number[]) => {
    const range: [number, number] = [newValue[0], newValue[1]];
    setPriceRange(range);
    onPriceRangeChange?.(range);
  };

  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous && latest > previous && latest > 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.div
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
      className="sticky top-0 z-10 backdrop-blur-sm bg-white/60 flex flex-col flex-wrap  md:flex-row gap-6 md:gap-10 p-4"
    >
      {/* Main Categories */}
      <div className="space-y-2 min-w-[20rem]">
        <h3 className="text-sm font-medium">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              onCategoryChange(null);
              onTeaCategoryChange(null);
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => {
                onCategoryChange(category.slug);
                // Clear tea category when switching to non-tea category
                if (category.slug !== "tea") {
                  onTeaCategoryChange(null);
                }
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                selectedCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tea Categories - Only show when Tea category is selected */}
      {selectedCategory === "tea" && (
        <div className="space-y-2 min-w-[20rem]">
          <h3 className="text-sm font-medium">Tea Types</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTeaCategoryChange(null)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                selectedTeaCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              All Tea
            </button>
            {teaCategories.map((category) => (
              <button
                key={category.slug}
                onClick={() => onTeaCategoryChange(category.slug)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  selectedTeaCategory === category.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-4 min-w-[20rem] w-full sm:max-w-[20rem]">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium">Price Range</Label>
          <output className="text-sm font-medium tabular-nums">
            ${priceRange[0]} - ${priceRange[1]}
          </output>
        </div>
        <Slider
          value={priceRange}
          min={minPrice}
          max={maxPrice}
          step={1}
          onValueChange={handlePriceRangeChange}
          className="w-full"
          showTooltip
          tooltipContent={(value) => `$${value}`}
        />
      </div>
    </motion.div>
  );
}
