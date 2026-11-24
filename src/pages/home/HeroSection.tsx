import { Icon } from "../../components/Icon";
import { HERO_IMAGE_API, FALLBACK_IMAGE } from "../../api/images";

export function HeroSection({
  query,
  onQueryChange,
  onSearch,
  onQuickSearch,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onQuickSearch: (term: string) => void;
}) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">Pass it on</span>
          <h1>Good items deserve another story.</h1>
          <p>
            Buy and sell safely near you. Better for your wallet and the planet.
          </p>
          <form
            className="hero-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
          >
            <Icon name="search" size={23} />
            <input
              aria-label="Search for a second-hand item"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Product, category, city…"
              value={query}
            />
            <button className="primary-button" type="submit">
              Discover
            </button>
          </form>
          <div className="quick-links">
            <span>Popular:</span>
            {["Product 1", "Product 2", "Product 3"].map((term) => (
              <button key={term} onClick={() => onQuickSearch(term)} type="button">
                {term}
              </button>
            ))}
          </div>
        </div>
        <div className="hero-art" aria-label="Second-hand items">
          <div className="hero-stat">
            <b>42 kg</b>
            <span>CO₂ saved this week</span>
          </div>
          <img
            src={HERO_IMAGE_API}
            alt="Second-hand items marketplace preview"
            width={480}
            height={360}
            decoding="async"
            fetchPriority="high"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "36px",
              objectFit: "cover",
              boxShadow: "var(--shadow)",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}
