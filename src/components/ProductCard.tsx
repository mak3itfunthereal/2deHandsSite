import type { Product } from "../types";
import { Icon } from "./Icon";

export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23e2e8f0'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3C/svg%3E";

export function ProductCard({
  item,
  onOpen,
  favorite,
  toggle,
}: {
  item: Product;
  onOpen: () => void;
  favorite: boolean;
  toggle: () => void;
}) {
  return (
    <article className="product-card">
      <button className="product-image" onClick={onOpen} type="button">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {item.top && <span className="top-tag">Featured listing</span>}
      </button>
      <button
        className={`heart-btn ${favorite ? "liked" : ""}`}
        onClick={toggle}
        aria-label={favorite ? `Remove ${item.title} from saved` : `Save ${item.title}`}
        aria-pressed={favorite}
        type="button"
      >
        <Icon name="heart" fill={favorite ? "currentColor" : "none"} />
      </button>
      <button className="product-copy" onClick={onOpen} type="button">
        <strong className="price">{item.price}</strong>
        <h3>{item.title}</h3>
        <p>{item.state}</p>
        <div>
          <span>
            {item.city} ·{" "}
            {"calculatedDistance" in item && item.calculatedDistance != null
              ? `${Number(item.calculatedDistance).toLocaleString("en-GB", { maximumFractionDigits: 1 })} km`
              : item.distance}
          </span>
          {item.createdAt && <span>{item.createdAt}</span>}
        </div>
      </button>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <article className="skeleton-card" aria-hidden="true">
      <div className="skeleton-image skeleton-shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: "20px" }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "85%" }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: "60%" }} />
      </div>
    </article>
  );
}
