import { useEffect, useMemo, useState } from "react";
import type { LocationPreference, Page, Product } from "../types";
import { categories, distanceBetween, products as defaultProducts } from "../utils/marketplace";
import { Icon, LocationControls, ProductCard, ProductCardSkeleton } from "../components/ui";

function FilterPanel({
  onClose,
  location,
  onLocationChange,
  resultCount,
  selectedCategory,
  onCategoryChange,
  maxPrice,
  onMaxPriceChange,
  selectedCondition,
  onConditionChange,
  shippingOnly,
  onShippingOnlyChange,
  protectionOnly,
  onProtectionOnlyChange,
  onResetFilters,
}: {
  onClose?: () => void;
  location: LocationPreference;
  onLocationChange: (location: LocationPreference) => void;
  resultCount: number;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  selectedCondition: string;
  onConditionChange: (condition: string) => void;
  shippingOnly: boolean;
  onShippingOnlyChange: (val: boolean) => void;
  protectionOnly: boolean;
  onProtectionOnlyChange: (val: boolean) => void;
  onResetFilters: () => void;
}) {
  return (
    <aside className="filters">
      <div className="filter-head">
        <h2>Filters</h2>
        {onClose && (
          <button className="icon-btn" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        )}
      </div>

      <div className="filter-location">
        <b>Locatie en afstand</b>
        <LocationControls location={location} onChange={onLocationChange} />
      </div>

      <div className="filter-group">
        <b>Categorie</b>
        <select
          className="select-like"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}
        >
          <option value="">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <b>Maximale prijs (€ {maxPrice})</b>
        <div className="range-label">
          <span>€ 0</span>
          <span>€ 1.000+</span>
        </div>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
        />
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Max €"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value) || 1000)}
          />
        </div>
      </div>

      <div className="filter-group">
        <b>Staat</b>
        {["Alle", "Nieuw", "Zo goed als nieuw", "Goed", "Gebruikt"].map((state) => (
          <label className="check" key={state}>
            <input
              type="radio"
              name="condition"
              checked={selectedCondition === (state === "Alle" ? "" : state)}
              onChange={() => onConditionChange(state === "Alle" ? "" : state)}
            />
            <span>{state}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <b>Bezorgopties & service</b>
        <label className="check" style={{ marginBottom: "8px" }}>
          <input
            type="checkbox"
            checked={shippingOnly}
            onChange={(e) => onShippingOnlyChange(e.target.checked)}
            style={{ accentColor: "var(--primary)" }}
          />
          <span>Verzenden mogelijk</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={protectionOnly}
            onChange={(e) => onProtectionOnlyChange(e.target.checked)}
            style={{ accentColor: "var(--primary)" }}
          />
          <span>Met Kopersbescherming</span>
        </label>
      </div>

      <button
        className="secondary"
        onClick={onResetFilters}
        type="button"
        style={{ width: "100%", marginBottom: "10px" }}
      >
        Wis filters
      </button>

      <button className="primary apply-filter" onClick={onClose} type="button">
        Toon {resultCount} resultaten
      </button>
    </aside>
  );
}

export default function SearchPage({
  setPage,
  favorites,
  toggle,
  location,
  onLocationChange,
  initialQuery = "",
  initialCategory = "",
  products = defaultProducts,
  onSelectProduct,
}: {
  setPage: (p: Page) => void;
  favorites: Set<number>;
  toggle: (id: number) => void;
  location: LocationPreference;
  onLocationChange: (location: LocationPreference) => void;
  initialQuery?: string;
  initialCategory?: string | null;
  products?: Product[];
  onSelectProduct?: (productId: number) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("Meest relevant");
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || "");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [condition, setCondition] = useState("");
  const [shippingOnly, setShippingOnly] = useState(false);
  const [protectionOnly, setProtectionOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategory(initialCategory || "");
  }, [initialCategory]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 220);
    return () => clearTimeout(timer);
  }, [query, category, condition, maxPrice, sort, shippingOnly, protectionOnly]);

  useEffect(() => {
    setPageSize(8);
  }, [query, category, condition, maxPrice, sort, shippingOnly, protectionOnly]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    if (filtersOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [filtersOpen]);

  const filteredProducts = useMemo(() => {
    return products
      .map((product) => ({
        ...product,
        calculatedDistance: distanceBetween(location, product),
      }))
      .filter((product) => {
        // Distance check
        if (product.calculatedDistance > location.radius) {
          return false;
        }

        // Query check
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchCat = product.category.toLowerCase().includes(q);
          const matchCity = product.city.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchCity) return false;
        }

        // Category check
        if (category && product.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }

        // Condition check
        if (condition && product.state.toLowerCase() !== condition.toLowerCase()) {
          return false;
        }

        // Shipping check
        if (shippingOnly && product.allowsShipping === false) {
          return false;
        }

        // Protection check
        if (protectionOnly && product.allowsProtection === false) {
          return false;
        }

        // Price check
        const priceNum =
          product.priceAmount ?? (Number(product.price.replace(/[^\d]/g, "")) || 0);
        if (maxPrice < 1000 && priceNum > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "Dichtstbij") return a.calculatedDistance - b.calculatedDistance;
        const priceA = a.priceAmount ?? (Number(a.price.replace(/[^\d]/g, "")) || 0);
        const priceB = b.priceAmount ?? (Number(b.price.replace(/[^\d]/g, "")) || 0);
        if (sort === "Prijs laag-hoog") return priceA - priceB;
        if (sort === "Prijs hoog-laag") return priceB - priceA;
        return 0;
      });
  }, [products, location, query, category, condition, maxPrice, sort, shippingOnly, protectionOnly]);

  const handleCardClick = (productId: number) => {
    if (onSelectProduct) {
      onSelectProduct(productId);
    }
    setPage("detail");
  };

  const handleResetFilters = () => {
    setQuery("");
    setCategory("");
    setMaxPrice(1000);
    setCondition("");
    setShippingOnly(false);
    setProtectionOnly(false);
  };

  return (
    <main className="shell search-page">
      <div className="breadcrumbs">
        <button onClick={() => setPage("home")}>Home</button>
        <Icon name="chevron" size={14} />
        {category ? (
          <>
            <button onClick={() => setCategory("")}>{category}</button>
            {query && (
              <>
                <Icon name="chevron" size={14} />
                <span>“{query}”</span>
              </>
            )}
          </>
        ) : (
          <span>{query ? `Zoeken naar “${query}”` : "Alle advertenties"}</span>
        )}
      </div>

      <div className="results-heading">
        <div>
          <span className="eyebrow">{filteredProducts.length} resultaten</span>
          <h1>
            {query
              ? `Resultaten voor “${query}”`
              : category
                ? category
                : `Advertenties rond ${location.city}`}
          </h1>
        </div>
        <button
          className={saved ? "secondary saved" : "secondary"}
          onClick={() => setSaved(!saved)}
          type="button"
        >
          <Icon name="bell" />
          {saved ? "Zoekopdracht opgeslagen" : "Bewaar zoekopdracht"}
        </button>
      </div>

      <div className="chips">
        <span>
          {location.city} + {location.radius} km
        </span>
        {category && (
          <span>
            {category} <button onClick={() => setCategory("")}>×</button>
          </span>
        )}
        {query && (
          <span>
            “{query}” <button onClick={() => setQuery("")}>×</button>
          </span>
        )}
        {condition && (
          <span>
            {condition} <button onClick={() => setCondition("")}>×</button>
          </span>
        )}
        {maxPrice < 1000 && (
          <span>
            Tot € {maxPrice} <button onClick={() => setMaxPrice(1000)}>×</button>
          </span>
        )}
        {shippingOnly && (
          <span>
            Verzenden mogelijk <button onClick={() => setShippingOnly(false)}>×</button>
          </span>
        )}
        {protectionOnly && (
          <span>
            Kopersbescherming <button onClick={() => setProtectionOnly(false)}>×</button>
          </span>
        )}
        {(category || query || condition || maxPrice < 1000 || shippingOnly || protectionOnly) && (
          <button className="clear" onClick={handleResetFilters}>
            Wis alle filters
          </button>
        )}
      </div>

      <div className="mobile-filter-row">
        <button onClick={() => setFiltersOpen(true)} type="button">
          <Icon name="filter" />
          Filters{" "}
          {(category ? 1 : 0) +
            (condition ? 1 : 0) +
            (maxPrice < 1000 ? 1 : 0) +
            (shippingOnly ? 1 : 0) +
            (protectionOnly ? 1 : 0)}
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Meest relevant</option>
          <option>Dichtstbij</option>
          <option>Prijs laag-hoog</option>
          <option>Prijs hoog-laag</option>
        </select>
      </div>

      {filtersOpen && (
        <div className="sheet-backdrop" onClick={() => setFiltersOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <FilterPanel
              location={location}
              onLocationChange={onLocationChange}
              resultCount={filteredProducts.length}
              selectedCategory={category}
              onCategoryChange={setCategory}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              selectedCondition={condition}
              onConditionChange={setCondition}
              shippingOnly={shippingOnly}
              onShippingOnlyChange={setShippingOnly}
              protectionOnly={protectionOnly}
              onProtectionOnlyChange={setProtectionOnly}
              onResetFilters={handleResetFilters}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="search-layout">
        <FilterPanel
          location={location}
          onLocationChange={onLocationChange}
          resultCount={filteredProducts.length}
          selectedCategory={category}
          onCategoryChange={setCategory}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          selectedCondition={condition}
          onConditionChange={setCondition}
          shippingOnly={shippingOnly}
          onShippingOnlyChange={setShippingOnly}
          protectionOnly={protectionOnly}
          onProtectionOnlyChange={setProtectionOnly}
          onResetFilters={handleResetFilters}
          onClose={() => setFiltersOpen(false)}
        />

        <section className="results">
          <div className="results-toolbar">
            <span>{filteredProducts.length} advertenties gevonden</span>
            <div>
              <label>
                Sorteren:{" "}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option>Meest relevant</option>
                  <option>Dichtstbij</option>
                  <option>Prijs laag-hoog</option>
                  <option>Prijs hoog-laag</option>
                </select>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="product-grid">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="product-grid">
                {filteredProducts.slice(0, pageSize).map((p) => (
                  <ProductCard
                    key={p.id}
                    item={p}
                    onOpen={() => handleCardClick(p.id)}
                    favorite={favorites.has(p.id)}
                    toggle={() => toggle(p.id)}
                  />
                ))}
              </div>
              {filteredProducts.length > pageSize && (
                <div style={{ textAlign: "center", marginTop: "32px" }}>
                  <button
                    className="secondary"
                    onClick={() => setPageSize((prev) => prev + 8)}
                    type="button"
                    style={{ padding: "12px 28px", borderRadius: "10px" }}
                  >
                    Toon meer advertenties ({Math.min(pageSize, filteredProducts.length)} van{" "}
                    {filteredProducts.length})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-local-results" style={{ textAlign: "center", padding: "60px 20px" }}>
              <Icon name="search" size={48} />
              <h2>Geen advertenties gevonden</h2>
              <p>
                Geen resultaten binnen {location.radius} km van {location.city}.
              </p>
              <button
                className="secondary"
                onClick={() => onLocationChange({ ...location, radius: 100 })}
                style={{ marginTop: "12px", marginRight: "10px" }}
              >
                Vergroot zoekgebied naar 100 km
              </button>
              <button className="primary" onClick={handleResetFilters} style={{ marginTop: "12px" }}>
                Wis alle filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
