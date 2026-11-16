import type { Product } from "../types";
import { products as defaultProducts } from "../utils/marketplace";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  count = 4,
  onOpen,
  onOpenProduct,
  favorites,
  toggle,
  items = defaultProducts,
}: {
  count?: number;
  onOpen?: () => void;
  onOpenProduct?: (productId: number) => void;
  favorites: Set<number>;
  toggle: (id: number) => void;
  items?: Product[];
}) {
  return (
    <div className="product-grid">
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
