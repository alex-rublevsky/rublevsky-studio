import { Category, TeaCategory } from "~/types";
import { useState, useEffect } from "react";
import { Slider } from "~/components/ui/shared/Slider";
import { FilterGroup } from "../shared/FilterGroup";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import { AnimatePresence, motion } from "motion/react";

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

  const handleMainCategoryChange = (category: string | null) => {
    onCategoryChange(category);
    // Clear tea category when switching to non-tea category
    if (category !== "tea") {
      onTeaCategoryChange(null);
    }
  };

  return (
    <AnimatedGroup
      delay={0.9}
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
      <AnimatePresence mode="wait">
        {selectedCategory === "tea" && (
          <AnimatedGroup delay={0} staggerChildren={0.07}>
            <FilterGroup
              title="Tea Types"
              options={teaCategories}
              selectedOptions={selectedTeaCategory}
              onOptionChange={onTeaCategoryChange}
              allOptionLabel="All Tea"
            />
          </AnimatedGroup>
        )}
      </AnimatePresence>

      {/* Price Range Filter */}
      <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
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
    </AnimatedGroup>
  );
}
