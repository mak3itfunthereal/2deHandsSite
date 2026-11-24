import { useState } from "react";
import type { Account, LocationPreference, Page, Product, UserProfile } from "../types";
import { products as defaultProducts, userFullName, userInitials } from "../utils/marketplace";
import { Icon, ProductGrid } from "../components/ui";

export default function AccountPage({
  setPage,
  favorites,
  toggle,
  user,
  account,
  location,
  products = defaultProducts,
  onSelectProduct,
}: {
  setPage: (p: Page) => void;
  favorites: Set<number>;
  toggle: (id: number) => void;
  user: UserProfile;
  account: Account | null;
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
              <Icon name="pin" size={15} /> {location?.city || "City 1"}
              {account && ` · Member since ${new Date(account.createdAt).getFullYear()}`}
            </p>
            <span className="verified">
              <Icon name="check" size={13} /> {account?.isVerified ? "Account verified" : "Account not verified"}
            </span>
          </div>
          <button className="secondary" onClick={() => setPage("settings")}>
            Edit profile
          </button>
        </div>
      </section>

      <div className="account-layout">
        <nav className="account-nav">
          <button onClick={() => setPage("my-ads")}>
            <Icon name="package" /> My listings ({myAds.length})
          </button>
          <button
            className={tab === "favorites" ? "active" : ""}
            onClick={() => setTab("favorites")}
          >
            <Icon name="heart" /> My favorites ({favorites.size})
          </button>
          <button onClick={() => setPage("settings")}>
            <Icon name="user" /> Account settings
          </button>
        </nav>

        <section className="account-content">
          {tab === "favorites" && (
            <>
              <div className="account-heading">
                <div>
                  <span className="eyebrow">Saved</span>
                  <h2>My favorites ({favorites.size})</h2>
                </div>
                <label className="alert-toggle">
                  <span>Price alerts</span>
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
                  <h3 style={{ marginTop: "12px" }}>No favorites saved yet</h3>
                  <p style={{ color: "var(--muted)" }}>
                    Click the heart on a listing to save it for later.
                  </p>
                  <button
                    className="primary"
                    style={{ marginTop: "12px" }}
                    onClick={() => setPage("search")}
                  >
                    Explore listings
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
