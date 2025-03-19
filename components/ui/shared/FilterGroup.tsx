import { cn } from "@/lib/utils";

interface FilterOption {
  slug: string;
  name: string;
}

interface FilterGroupProps {
  title?: string;
  options: FilterOption[];
  selectedOptions: string | string[] | null;
  onOptionChange: (option: string | null) => void;
  onOptionsChange?: (options: string[]) => void;
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  multiSelect?: boolean;
}

export function FilterGroup({
  title,
  options,
  selectedOptions,
  onOptionChange,
  onOptionsChange,
  className,
  showAllOption = true,
  allOptionLabel = "All",
  multiSelect = false,
}: FilterGroupProps) {
  const handleOptionClick = (optionSlug: string) => {
    if (multiSelect && onOptionsChange) {
      const selected = selectedOptions as string[];
      if (selected.includes(optionSlug)) {
        onOptionsChange(selected.filter((slug) => slug !== optionSlug));
      } else {
        onOptionsChange([...selected, optionSlug]);
      }
    } else {
      onOptionChange(
        optionSlug === (selectedOptions as string) ? null : optionSlug
      );
    }
  };

  const isSelected = (optionSlug: string) => {
    if (multiSelect) {
      return (selectedOptions as string[]).includes(optionSlug);
    }
    return selectedOptions === optionSlug;
  };

  return (
    <div className={cn("space-y-2 min-w-[20rem]", className)}>
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      <div className="flex flex-wrap gap-2">
        {showAllOption && !multiSelect && (
          <button
            onClick={() => onOptionChange(null)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              selectedOptions === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {allOptionLabel}
          </button>
        )}
        {options.map((option) => (
          <button
            key={option.slug}
            onClick={() => handleOptionClick(option.slug)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              isSelected(option.slug)
                ? "bg-primary text-primary-foreground"
                : "border border-gray-400 hover:bg-gray-400 "
            )}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}
