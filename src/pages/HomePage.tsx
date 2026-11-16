import { useMemo, useRef, useState } from "react";
import type { Page, Product } from "../types";
import { products as defaultProducts } from "../utils/marketplace";
import {
  CategorySection,
  HeroSection,
  ImpactSection,
  ListingsSection,
  SellBannerSection,
  TrustSection,
} from "./home";

export default function HomePage({
  setPage,
  favorites,
  toggle,
  products = defaultProducts,
  onSelectProduct,
  onSearch,
}: {
  setPage: (page: Page) => void;
  favorites: Set<number>;
  toggle: (id: number) => void;
  products?: Product[];
  onSelectProduct?: (productId: number) => void;
  onSearch?: (term: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");
    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.title} ${product.category} ${product.city}`
          .toLocaleLowerCase("nl")
          .includes(normalizedQuery);
      const matchesCategory = !activeCategory || product.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, query, products]);

  const showResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuickSearch = (value: string) => {
    setQuery(value);
    setActiveCategory(null);
    showResults();
  };

  return (
    <div className="marketplace">
      <main>
        <HeroSection
          query={query}
          onQueryChange={setQuery}
          onSearch={() => {
            if (onSearch && query.trim()) {
              onSearch(query);
            } else {
              setActiveCategory(null);
              showResults();
            }
          }}
          onQuickSearch={handleQuickSearch}
        />

        <div className="home-content">
          <CategorySection
            activeCategory={activeCategory}
            onSelectCategory={(category) => {
              setActiveCategory((current) => (current === category ? null : category));
              showResults();
            }}
            onClearCategory={() => setActiveCategory(null)}
          />

          <ListingsSection
            sectionRef={resultsRef}
            activeCategory={activeCategory}
            query={query}
            visibleProducts={visibleProducts}
            favorites={favorites}
            toggle={toggle}
            setPage={setPage}
            onResetSearch={() => {
              setQuery("");
              setActiveCategory(null);
            }}
            onSelectProduct={onSelectProduct}
          />

          <TrustSection />

          <SellBannerSection setPage={setPage} />

          <ImpactSection />
        </div>
      </main>
    </div>
  );
}
