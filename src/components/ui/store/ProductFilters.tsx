import { Category, TeaCategory } from "~/types";
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Slider } from "~/components/ui/shared/Slider";
import { FilterGroup } from "../shared/FilterGroup";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useDeviceType } from "~/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/shared/Select";
import styles from "./ProductFilters.module.css";

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
  currentPriceRange: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

const ProductFilters = memo(function ProductFilters({
  categories,
  teaCategories,
  selectedCategory,
  selectedTeaCategory,
  onCategoryChange,
  onTeaCategoryChange,
  priceRange,
  currentPriceRange,
  onPriceRangeChange,
  sortBy = "relevant",
  onSortChange,
}: ProductFiltersProps) {
  const { isMobileOrTablet } = useDeviceType();

  const handlePriceRangeChange = useCallback(
    (newValue: number[]) => {
      const range: [number, number] = [newValue[0], newValue[1]];
      onPriceRangeChange?.(range);
    },
    [onPriceRangeChange]
  );

  const handleMainCategoryChange = useCallback(
    (category: string | null) => {
      onCategoryChange(category);
      // Clear tea category when switching to non-tea category
      if (category !== "tea") {
        onTeaCategoryChange(null);
      }
    },
    [onCategoryChange, onTeaCategoryChange]
  );

  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const difference = y - lastYRef.current;
    if (Math.abs(difference) > 50) {
      setIsHidden(difference > 0);
      lastYRef.current = y;
    }
  });

  return (
    <motion.div
      animate={isHidden ? "hidden" : "visible"}
      whileHover="visible"
      onClick={() => setIsHidden(false)}
      onFocusCapture={() => setIsHidden(false)}
      transition={{ duration: 0.3 }}
      variants={{
        hidden: isMobileOrTablet ? { y: "-91%" } : { y: "-86%" },
        visible: { y: "0%" },
      }}
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
          <AnimatedGroup delay={0} staggerChildren={0.1}>
            {/* First Row: Categories and Sort By */}
            <div className="flex gap-4 items-start">
              {/* Categories section - takes most space with proper wrapping */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <FilterGroup
                  title="Categories"
                  options={categories}
                  selectedOptions={selectedCategory}
                  onOptionChange={handleMainCategoryChange}
                  className="flex-wrap"
                />
              </div>

              {/* Sort By Filter - Right side, compact */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <label className="text-sm font-medium text-foreground">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-[15ch]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="relevant">Relevant</SelectItem>
                    <SelectItem value="price-asc">$ Low to High</SelectItem>
                    <SelectItem value="price-desc">$ High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tea Categories - Only show when Tea category is selected */}
            <AnimatePresence mode="wait">
              {selectedCategory === "tea" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FilterGroup
                    title="Tea Types"
                    options={teaCategories}
                    selectedOptions={selectedTeaCategory}
                    onOptionChange={onTeaCategoryChange}
                    allOptionLabel="All Tea"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Range Filter - Full width */}
            <Slider
              className="pt-3 pb-5 lg:pt-0"
              value={currentPriceRange}
              min={priceRange.min}
              max={priceRange.max}
              step={1}
              onValueChange={handlePriceRangeChange}
              showTooltip
              tooltipContent={(value) => `$${value}`}
              label="Price Range"
              valueDisplay={
                <output className="text-sm font-medium tabular-nums">
                  ${currentPriceRange[0]} - ${currentPriceRange[1]}
                </output>
              }
            />
          </AnimatedGroup>
        ) : (
          /* Desktop Layout*/
          <AnimatedGroup
            delay={0}
            staggerChildren={0.1}
            className="flex gap-10"
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FilterGroup
                    title="Tea Types"
                    options={teaCategories}
                    selectedOptions={selectedTeaCategory}
                    onOptionChange={onTeaCategoryChange}
                    allOptionLabel="All Tea"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Range Filter */}
            <Slider
              value={currentPriceRange}
              min={priceRange.min}
              max={priceRange.max}
              step={1}
              onValueChange={handlePriceRangeChange}
              showTooltip
              tooltipContent={(value) => `$${value}`}
              label="Price Range"
              valueDisplay={
                <output className="text-sm font-medium tabular-nums">
                  ${currentPriceRange[0]} - ${currentPriceRange[1]}
                </output>
              }
            />

            {/* Sort By Filter */}
            <div className="flex flex-col gap-2 self-start">
              <label className="text-sm font-medium text-foreground">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[15ch]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="relevant">Relevant</SelectItem>
                  <SelectItem value="price-asc">$ Low to High</SelectItem>
                  <SelectItem value="price-desc">$ High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AnimatedGroup>
        )}
        <div className="mx-auto h-1.5 w-[5rem] rounded-full bg-secondary shrink-0" />
          </div>
        </div>
   
    </motion.div>
  );
});

export default ProductFilters;
