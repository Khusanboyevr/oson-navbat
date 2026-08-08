export const CATEGORIES = ["Barchasi", "Erkaklar", "Ayollar", "Bolalar"] as const;

export type CategoryOption = (typeof CATEGORIES)[number];

interface CategoryFiltersProps {
  selected: CategoryOption;
  onChange: (category: CategoryOption) => void;
}

export default function CategoryFilters({ selected, onChange }: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((category) => {
        const isActive = category === selected;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={isActive}
            className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all duration-200 ease-in-out active:scale-95 ${
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-white/30 bg-white/20 text-foreground/80 hover:bg-white/30"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
