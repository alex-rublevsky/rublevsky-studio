"use client";

import { Category, TeaCategory } from "@/types";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  categories: Category[];
  teaCategories: TeaCategory[];
  selectedCategory: string | null;
  selectedTeaCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onTeaCategoryChange: (category: string | null) => void;
}

export default function ProductFilters({
  categories,
  teaCategories,
  selectedCategory,
  selectedTeaCategory,
  onCategoryChange,
  onTeaCategoryChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-10 p-4">
      {/* Main Categories */}
      <div className="space-y-2">
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

      {/* Tea Categories (always shown) */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Tea Types</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (selectedCategory === "tea") {
                onTeaCategoryChange(null);
              } else {
                onCategoryChange("tea");
                onTeaCategoryChange(null);
              }
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              selectedCategory === "tea" && selectedTeaCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            All Tea
          </button>
          {teaCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => {
                // Always ensure tea category is selected when choosing a tea type
                if (selectedCategory !== "tea") {
                  onCategoryChange("tea");
                }
                onTeaCategoryChange(category.slug);
              }}
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
    </div>
  );
}
