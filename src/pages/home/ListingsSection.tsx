import type { RefObject } from "react";
import type { Page } from "../../types";
import { GRAY_IMAGE, type products } from "../../utils/marketplace";
import { Icon } from "../../components/Icon";

export function ListingsSection({
  sectionRef,
  activeCategory,
  query,
  visibleProducts,
  favorites,
  toggle,
  setPage,
  onResetSearch,
  onSelectProduct,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  activeCategory: string | null;
  query: string;
  visibleProducts: typeof products;
  favorites: Set<number>;
  toggle: (id: number) => void;
  setPage: (page: Page) => void;
  onResetSearch: () => void;
  onSelectProduct?: (productId: number) => void;
}) {
  return (
    <section className="listings-section" id="aanbod" ref={sectionRef}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Carefully selected</span>
          <h2>{activeCategory || "Recommended for you"}</h2>
          <p>
            {query
              ? `Results for “${query.trim()}”`
              : "Special finds, ready for a second life."}
          </p>
        </div>
        <span className="listing-count">{visibleProducts.length} listings</span>
      </div>
      {visibleProducts.length ? (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <img
                  alt={product.title}
                  loading="lazy"
                  src={product.image}
                  onError={(e) => {
                    e.currentTarget.src = GRAY_IMAGE;
                  }}
                />
                {product.top && <span className="top-tag">Featured</span>}
                <button
                  aria-label={
                    favorites.has(product.id)
                      ? `Remove ${product.title} from favorites`
                      : `Add ${product.title} to favorites`
                  }
                  aria-pressed={favorites.has(product.id)}
                  className={`heart-button${favorites.has(product.id) ? " liked" : ""}`}
                  onClick={() => toggle(product.id)}
                  type="button"
                >
                  <Icon name="heart" size={19} />
                </button>
              </div>
              <div className="product-copy">
                <span className="product-price">{product.price}</span>
                <button
                  className="product-title"
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(product.id);
                    setPage("detail");
                  }}
                  type="button"
                >
                  {product.title}
                </button>
                <p>{product.state}</p>
                <div className="product-meta">
                  <span>
                    <Icon name="pin" size={14} /> {product.city}
                  </span>
                  <span>{product.distance}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <span className="empty-icon">
            <Icon name="search" size={25} />
          </span>
          <h3>No listings found</h3>
          <p>Try a different search term or browse all listings.</p>
          <button className="secondary-button" onClick={onResetSearch} type="button">
            View all listings
          </button>
        </div>
      )}
    </section>
  );
}
