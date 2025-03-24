import { cn } from "@/lib/utils";

interface FilterOption {
  slug: string;
  name: string;
}

interface FilterButtonProps {
  onClick: () => void;
  isSelected: boolean;
  children: React.ReactNode;
  className?: string;
}

function FilterButton({
  onClick,
  isSelected,
  children,
  className,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-full transition-colors",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "border border-gray-400 hover:bg-gray-400",
        className
      )}
    >
      {children}
    </button>
  );
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
    <div className="space-y-2 min-w-[20rem]">
      {title && <p className="text-sm font-medium">{title}</p>}
      <div className={cn("flex flex-wrap gap-2", className)}>
        {showAllOption && !multiSelect && (
          <FilterButton
            onClick={() => onOptionChange(null)}
            isSelected={selectedOptions === null}
          >
            {allOptionLabel}
          </FilterButton>
        )}
        {options.map((option) => (
          <FilterButton
            key={option.slug}
            onClick={() => handleOptionClick(option.slug)}
            isSelected={isSelected(option.slug)}
          >
            {option.name}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}
