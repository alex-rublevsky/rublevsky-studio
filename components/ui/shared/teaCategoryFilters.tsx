import { TeaCategory } from "@/types";

interface TeaCategoryFiltersProps {
  teaCategories: TeaCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categorySlug: string) => void;
}

export default function TeaCategoryFilters({
  teaCategories,
  selectedCategories,
  onCategoryToggle,
}: TeaCategoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {teaCategories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onCategoryToggle(category.slug)}
          className={`px-4 py-2 rounded-full transition-all duration-300 ${
            selectedCategories.includes(category.slug)
              ? "bg-primary text-white"
              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          }`}
        >
          {category.name}
        </button>
      ))}
      {teaCategories.length > 0 && (
        <button
          onClick={() =>
            selectedCategories.forEach((cat) => onCategoryToggle(cat))
          }
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
