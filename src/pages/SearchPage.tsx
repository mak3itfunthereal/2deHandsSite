import { useEffect, useMemo, useState } from "react";
import type { LocationPreference, Page, Product } from "../types";
import { categories, distanceBetween, products as defaultProducts } from "../utils/marketplace";
import { matchesCategory, matchesQuery } from "../utils/search";
import {
  CategoryButtons,
  Icon,
  LocationControls,
  ProductGrid,
} from "../components/ui";

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
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Close filters">
            <Icon name="close" />
          </button>
        )}
      </div>

      <div className="filter-location">
        <b>Location and distance</b>
        <LocationControls location={location} onChange={onLocationChange} />
      </div>

      <div className="filter-group">
        <b>Category</b>
        <select
          className="select-like"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <b>Maximum price (€{maxPrice})</b>
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
            placeholder="Max. €"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value) || 1000)}
          />
        </div>
      </div>

      <div className="filter-group">
        <b>Condition</b>
        {["All", "New", "Like new", "Good", "Used"].map((state) => (
          <label className="check" key={state}>
            <input
              type="radio"
              name="condition"
              checked={selectedCondition === (state === "All" ? "" : state)}
              onChange={() => onConditionChange(state === "All" ? "" : state)}
            />
            <span>{state}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <b>Delivery options & services</b>
        <label className="check" style={{ marginBottom: "8px" }}>
          <input
            type="checkbox"
            checked={shippingOnly}
            onChange={(e) => onShippingOnlyChange(e.target.checked)}
            style={{ accentColor: "var(--primary)" }}
          />
          <span>Shipping available</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={protectionOnly}
            onChange={(e) => onProtectionOnlyChange(e.target.checked)}
            style={{ accentColor: "var(--primary)" }}
          />
          <span>With Buyer Protection</span>
        </label>
      </div>

      <button
        className="secondary"
        onClick={onResetFilters}
        type="button"
        style={{ width: "100%", marginBottom: "10px" }}
      >
        Clear filters
      </button>

      <button className="primary apply-filter" onClick={onClose} type="button">
        Show {resultCount} results
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
  const [sort, setSort] = useState("Most relevant");
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

        // Query check: every word must appear in title or description (see utils/search.ts)
        if (!matchesQuery(product, query)) {
          return false;
        }

        // Category check
        if (!matchesCategory(product, category)) {
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
        if (sort === "Nearest") return a.calculatedDistance - b.calculatedDistance;
        const priceA = a.priceAmount ?? (Number(a.price.replace(/[^\d]/g, "")) || 0);
        const priceB = b.priceAmount ?? (Number(b.price.replace(/[^\d]/g, "")) || 0);
        if (sort === "Price: low to high") return priceA - priceB;
        if (sort === "Price: high to low") return priceB - priceA;
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
          <span>{query ? `Searching for “${query}”` : "All listings"}</span>
        )}
      </div>

      <div className="results-heading">
        <div>
          <span className="eyebrow">{filteredProducts.length} results</span>
          <h1>
            {query
              ? `Results for “${query}”`
              : category
                ? category
                : `Listings near ${location.city}`}
          </h1>
        </div>
        <button
          className={saved ? "secondary saved" : "secondary"}
          onClick={() => setSaved(!saved)}
          type="button"
        >
          <Icon name="bell" />
          {saved ? "Search saved" : "Save search"}
        </button>
      </div>

      <form
        className="search-page-form"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="search-page-input" className="sr-only">
          Search ads
        </label>
        <Icon name="search" size={18} />
        <input
          id="search-page-input"
          type="search"
          placeholder="Search in titles and descriptions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
            <Icon name="close" size={16} />
          </button>
        )}
      </form>

      <CategoryButtons
        categories={categories.map((c) => c.name)}
        selected={category}
        onSelect={setCategory}
      />

      <div className="chips">
        <span>
          {location.city} + {location.radius} km
        </span>
        {category && (
          <span>
            {category}{" "}<button type="button" aria-label="Remove category filter" onClick={() => setCategory("")}>×</button>
          </span>
        )}
        {query && (
          <span>
            “{query}”{" "}<button type="button" aria-label="Clear search" onClick={() => setQuery("")}>×</button>
          </span>
        )}
        {condition && (
          <span>
            {condition}{" "}<button type="button" aria-label="Remove condition filter" onClick={() => setCondition("")}>×</button>
          </span>
        )}
        {maxPrice < 1000 && (
          <span>
            Up to €{maxPrice}{" "}<button type="button" aria-label="Remove price filter" onClick={() => setMaxPrice(1000)}>×</button>
          </span>
        )}
        {shippingOnly && (
          <span>
            Shipping available{" "}<button type="button" aria-label="Remove shipping filter" onClick={() => setShippingOnly(false)}>×</button>
          </span>
        )}
        {protectionOnly && (
          <span>
            Buyer Protection{" "}<button type="button" aria-label="Remove buyer protection filter" onClick={() => setProtectionOnly(false)}>×</button>
          </span>
        )}
        {(category || query || condition || maxPrice < 1000 || shippingOnly || protectionOnly) && (
          <button className="clear" onClick={handleResetFilters}>
            Clear all filters
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
          <option>Most relevant</option>
          <option>Nearest</option>
          <option>Price: low to high</option>
          <option>Price: high to low</option>
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
            {/* aria-live: screen readers announce the new count when results change */}
            <span aria-live="polite">{filteredProducts.length} listings found</span>
            <div>
              <label>
                Sort by:{" "}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option>Most relevant</option>
                  <option>Nearest</option>
                  <option>Price: low to high</option>
                  <option>Price: high to low</option>
                </select>
              </label>
            </div>
          </div>

          {isLoading ? (
            <ProductGrid variant="results" loading favorites={favorites} toggle={toggle} />
          ) : filteredProducts.length > 0 ? (
            <>
              <ProductGrid
                variant="results"
                items={filteredProducts}
                count={pageSize}
                onOpenProduct={handleCardClick}
                favorites={favorites}
                toggle={toggle}
              />
              {filteredProducts.length > pageSize && (
                <div style={{ textAlign: "center", marginTop: "32px" }}>
                  <button
                    className="secondary"
                    onClick={() => setPageSize((prev) => prev + 8)}
                    type="button"
                    style={{ padding: "12px 28px", borderRadius: "10px" }}
                  >
                    Show more listings ({Math.min(pageSize, filteredProducts.length)} of{" "}
                    {filteredProducts.length})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-local-results" style={{ textAlign: "center", padding: "60px 20px" }}>
              <Icon name="search" size={48} />
              <h2>No listings found</h2>
              <p>
                No results within {location.radius} km of {location.city}.
              </p>
              <button
                className="secondary"
                onClick={() => onLocationChange({ ...location, radius: 100 })}
                style={{ marginTop: "12px", marginRight: "10px" }}
              >
                Expand search area to 100 km
              </button>
              <button className="primary" onClick={handleResetFilters} style={{ marginTop: "12px" }}>
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
