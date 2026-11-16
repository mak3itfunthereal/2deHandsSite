import { useState } from "react";
import type { LocationPreference, Page, Product, UserProfile } from "../types";
import { products as defaultProducts, userFullName, userInitials } from "../utils/marketplace";
import { Icon, ProductGrid } from "../components/ui";

export default function AccountPage({
  setPage,
  favorites,
  toggle,
  user,
  location,
  products = defaultProducts,
  onSelectProduct,
}: {
  setPage: (p: Page) => void;
  favorites: Set<number>;
  toggle: (id: number) => void;
  user: UserProfile;
  location?: LocationPreference;
  products?: Product[];
  onSelectProduct?: (productId: number) => void;
}) {
  const [tab, setTab] = useState<"ads" | "favorites" | "settings">("favorites");
  const [priceAlerts, setPriceAlerts] = useState(true);

  const favoritedProducts = products.filter((p) => favorites.has(p.id));
  const myAds = products.filter((p) => p.isUserAd || p.id === 1);

  return (
    <main className="shell account-page">
      <section className="profile-hero">
        <div className="profile-cover" />
        <div className="profile-summary">
          <span className="profile-avatar-large">{userInitials(user)}</span>
          <div>
            <h1>{userFullName(user)}</h1>
            <p>
              <Icon name="pin" size={15} /> {location?.city || "Plaats 1"} · Lid sinds 2024
            </p>
            <span className="verified">
              <Icon name="check" size={13} /> E-mail en telefoon geverifieerd
            </span>
          </div>
          <button className="secondary" onClick={() => setPage("settings")}>
            Profiel bewerken
          </button>
        </div>
      </section>

      <div className="account-layout">
        <nav className="account-nav">
          <button onClick={() => setPage("my-ads")}>
            <Icon name="package" /> Mijn advertenties ({myAds.length})
          </button>
          <button
            className={tab === "favorites" ? "active" : ""}
            onClick={() => setTab("favorites")}
          >
            <Icon name="heart" /> Mijn favorieten ({favorites.size})
          </button>
          <button onClick={() => setPage("settings")}>
            <Icon name="user" /> Accountinstellingen
          </button>
        </nav>

        <section className="account-content">
          {tab === "favorites" && (
            <>
              <div className="account-heading">
                <div>
                  <span className="eyebrow">Bewaard</span>
                  <h2>Mijn favorieten ({favorites.size})</h2>
                </div>
                <label className="alert-toggle">
                  <span>Prijsalerts</span>
                  <input
                    type="checkbox"
                    checked={priceAlerts}
                    onChange={(event) => setPriceAlerts(event.target.checked)}
                  />
                </label>
              </div>

              {favoritedProducts.length > 0 ? (
                <ProductGrid
                  count={12}
                  items={favoritedProducts}
                  onOpenProduct={(id) => {
                    if (onSelectProduct) onSelectProduct(id);
                    setPage("detail");
                  }}
                  favorites={favorites}
                  toggle={toggle}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <Icon name="heart" size={32} />
                  <h3 style={{ marginTop: "12px" }}>Nog geen favorieten bewaard</h3>
                  <p style={{ color: "var(--muted)" }}>
                    Klik op het hartje bij een advertentie om deze te bewaren voor later.
                  </p>
                  <button
                    className="primary"
                    style={{ marginTop: "12px" }}
                    onClick={() => setPage("search")}
                  >
                    Ontdek advertenties
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
