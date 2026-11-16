import { Icon } from "../../components/Icon";

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
          <span className="eyebrow">Geef het door</span>
          <h1>Goede spullen verdienen een volgend verhaal.</h1>
          <p>
            Koop en verkoop veilig bij jou in de buurt. Beter voor je portemonnee én de wereld.
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
              aria-label="Zoek naar een tweedehands artikel"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Product, categorie, plaats…"
              value={query}
            />
            <button className="primary-button" type="submit">
              Ontdek
            </button>
          </form>
          <div className="quick-links">
            <span>Populair:</span>
            {["Product 1", "Product 2", "Product 3"].map((term) => (
              <button key={term} onClick={() => onQuickSearch(term)} type="button">
                {term}
              </button>
            ))}
          </div>
        </div>
        <div className="hero-art" aria-label="Tweedehands artikelen">
          <div className="hero-stat">
            <b>42 kg</b>
            <span>CO₂ bespaard deze week</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "36px",
              backgroundColor: "var(--line)",
              boxShadow: "var(--shadow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: "14px",
            }}
          >
            Afbeelding via API
          </div>
        </div>
      </div>
    </section>
  );
}
