"use client";

import { Category, TeaCategory } from "@/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/shared/label";
import { Slider } from "@/components/ui/slider";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { FilterGroup } from "../shared/FilterGroup";

interface ProductFiltersProps {
  categories: Category[];
  teaCategories: TeaCategory[];
  selectedCategory: string | null;
  selectedTeaCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onTeaCategoryChange: (category: string | null) => void;
  priceRange: {
    min: number;
    max: number;
  };
  onPriceRangeChange?: (range: [number, number]) => void;
}

export default function ProductFilters({
  categories,
  teaCategories,
  selectedCategory,
  selectedTeaCategory,
  onCategoryChange,
  onTeaCategoryChange,
  priceRange,
  onPriceRangeChange,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    priceRange.min,
    priceRange.max,
  ]);

  // Update local price range when priceRange prop changes
  useEffect(() => {
    setLocalPriceRange([priceRange.min, priceRange.max]);
  }, [priceRange]);

  const handlePriceRangeChange = (newValue: number[]) => {
    const range: [number, number] = [newValue[0], newValue[1]];
    setLocalPriceRange(range);
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

  const handleMainCategoryChange = (category: string | null) => {
    onCategoryChange(category);
    // Clear tea category when switching to non-tea category
    if (category !== "tea") {
      onTeaCategoryChange(null);
    }
  };

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
      className="md:sticky top-0 z-10 backdrop-blur-md bg-background/60 flex flex-col flex-wrap  md:flex-row gap-6 md:gap-10 p-4"
    >
      {/* Main Categories */}
      <FilterGroup
        title="Categories"
        options={categories}
        selectedOptions={selectedCategory}
        onOptionChange={handleMainCategoryChange}
      />

      {/* Tea Categories - Only show when Tea category is selected */}
      {selectedCategory === "tea" && (
        <FilterGroup
          title="Tea Types"
          options={teaCategories}
          selectedOptions={selectedTeaCategory}
          onOptionChange={onTeaCategoryChange}
          allOptionLabel="All Tea"
        />
      )}

      {/* Price Range Filter */}
      <Slider
        value={localPriceRange}
        min={priceRange.min}
        max={priceRange.max}
        step={1}
        onValueChange={handlePriceRangeChange}
        showTooltip
        tooltipContent={(value) => `$${value}`}
        label="Price Range"
        valueDisplay={
          <output className="text-sm font-medium tabular-nums">
            ${localPriceRange[0]} - ${localPriceRange[1]}
          </output>
        }
      />
    </motion.div>
  );
}
