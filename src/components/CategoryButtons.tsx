/**
 * A row of category buttons ("All" + one per category).
 * Reusable: give it the category names, the selected one, and a change handler.
 * - On mobile the row scrolls sideways; on desktop it wraps.
 * - aria-pressed tells screen readers which button is active.
 */
export function CategoryButtons({
  categories,
  selected,
  onSelect,
  allLabel = "All",
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  allLabel?: string;
}) {
  const options = [{ value: "", label: allLabel }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <nav className="category-buttons" aria-label="Filter by category">
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={option.value || "all"}
            type="button"
            className={active ? "category-button active" : "category-button"}
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </nav>
  );
}
