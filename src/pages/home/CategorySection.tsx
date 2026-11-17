import { categories, GRAY_IMAGE } from "../../utils/marketplace";

export function CategorySection({
  activeCategory,
  onSelectCategory,
  onClearCategory,
}: {
  activeCategory: string | null;
  onSelectCategory: (categoryName: string) => void;
  onClearCategory: () => void;
}) {
  return (
    <section className="category-section" id="categorieen">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Find your next treasure</span>
          <h2>What are you looking for?</h2>
        </div>
        {activeCategory && (
          <button className="text-button" onClick={onClearCategory} type="button">
            Clear selection
          </button>
        )}
      </div>
      <div className="categories">
        {categories.map((category, index) => (
          <button
            aria-pressed={activeCategory === category.name}
            className={activeCategory === category.name ? "category-active" : ""}
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
            type="button"
          >
            <span className={`category-image category-image-${index}`}>
              <img
                alt=""
                loading="lazy"
                src={category.image}
                onError={(e) => {
                  e.currentTarget.src = GRAY_IMAGE;
                }}
              />
            </span>
            <b>{category.name}</b>
          </button>
        ))}
      </div>
    </section>
  );
}
