import type { Product } from "../types";
import { products as defaultProducts } from "../utils/marketplace";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

/**
 * Reusable grid of product cards.
 * - Home page: <ProductGrid count={4} ... /> shows a short row.
 * - Search page: <ProductGrid variant="results" count={Infinity} ... /> shows a full grid.
 */
export function ProductGrid({
  count = 4,
  onOpen,
  onOpenProduct,
  favorites,
  toggle,
  items = defaultProducts,
  variant = "row",
  loading = false,
}: {
  count?: number;
  onOpen?: () => void;
  onOpenProduct?: (productId: number) => void;
  favorites: Set<number>;
  toggle: (id: number) => void;
  items?: Product[];
  /** "row" = home page style, "results" = search results grid (2 columns on mobile) */
  variant?: "row" | "results";
  /** Show grey placeholder cards while results are loading */
  loading?: boolean;
}) {
  const className = variant === "results" ? "product-grid results-grid" : "product-grid";

  if (loading) {
    return (
      <div className={className} aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {items.slice(0, count).map((p) => (
        <ProductCard
          key={p.id}
          item={p}
          onOpen={() => {
            if (onOpenProduct) onOpenProduct(p.id);
            else onOpen?.();
          }}
          favorite={favorites.has(p.id)}
          toggle={() => toggle(p.id)}
        />
      ))}
    </div>
  );
}
