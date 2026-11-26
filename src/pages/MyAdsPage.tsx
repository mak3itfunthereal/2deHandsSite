import { useState } from "react";
import type { Page, Product } from "../types";
import { GRAY_IMAGE, products as defaultProducts } from "../utils/marketplace";
import { Icon } from "../components/ui";
import { deleteDraft, getDrafts, type Draft } from "../api/drafts";
import { formatPrice, parsePrice } from "../utils/sellForm";
import { EditListingModal } from "./myAds/EditListingModal";

type Tab = "active" | "sold" | "drafts";
type AdStatus = "active" | "reserved" | "sold";

/** "2026-11-20T10:00:00Z" -> "20 Nov 2026" */
function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Seller dashboard: see and manage all your listings.
 * Tabs for Active, Sold and Drafts, views and favorites per listing,
 * and quick buttons to edit, mark as sold or delete.
 */
export default function MyAdsPage({
  setPage,
  products = defaultProducts,
  onSelectProduct,
  onDeleteProduct,
  onUpdateProduct,
  onStatusChange,
  onResumeDraft,
}: {
  setPage: (p: Page) => void;
  products?: Product[];
  onSelectProduct?: (productId: number) => void;
  onDeleteProduct?: (productId: number) => void;
  onUpdateProduct?: (product: Product) => Promise<void> | void;
  onStatusChange?: (productId: number, status: AdStatus) => Promise<void> | void;
  onResumeDraft?: (draftId: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("active");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>(getDrafts);

  // Demo: products 1 and 3 count as "mine" until we have real accounts
  const myProducts = products.filter((p) => p.isUserAd || p.id === 1 || p.id === 3);
  const activeProducts = myProducts.filter((p) => p.adStatus !== "sold");
  const soldProducts = myProducts.filter((p) => p.adStatus === "sold");
  const visibleProducts = tab === "active" ? activeProducts : tab === "sold" ? soldProducts : [];

  const tabs: { id: Tab; label: string; count: number; help: string }[] = [
    { id: "active", label: "Active", count: activeProducts.length, help: "Visible to buyers" },
    { id: "sold", label: "Sold", count: soldProducts.length, help: "Successfully completed" },
    { id: "drafts", label: "Drafts", count: drafts.length, help: "Not published yet" },
  ];

  const openListing = (id: number) => {
    onSelectProduct?.(id);
    setPage("detail");
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Delete "${product.title}"? This cannot be undone.`)) {
      onDeleteProduct?.(product.id);
    }
  };

  const handleDeleteDraft = (draft: Draft) => {
    const name = draft.data.title.trim() || "this draft";
    if (window.confirm(`Delete ${name}?`)) {
      deleteDraft(draft.id);
      setDrafts(getDrafts());
    }
  };

  return (
    <main className="shell standalone-page">
      <div className="page-back">
        <button type="button" onClick={() => setPage("account")}>
          ← Back to my profile
        </button>
      </div>

      <div className="standalone-heading">
        <div>
          <span className="eyebrow">Manage your listings</span>
          <h1>My listings</h1>
          <p>See how your listings perform and manage active, sold and draft listings.</p>
        </div>
        <button className="primary" type="button" onClick={() => setPage("sell")}>
          <Icon name="plus" /> New listing
        </button>
      </div>

      {/* Tabs */}
      <div className="status-cards" role="tablist" aria-label="Listing status">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="listings-panel"
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            <span>{t.label}</span>
            <b>{t.count}</b>
            <small>{t.help}</small>
          </button>
        ))}
      </div>

      <section
        className="standalone-card"
        id="listings-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        <div className="table-heading">
          <h2>{tab === "active" ? "Active listings" : tab === "sold" ? "Sold" : "Drafts"}</h2>
          <span>
            {tab === "drafts" ? drafts.length : visibleProducts.length}{" "}
            {tab === "drafts" ? "drafts" : "listings"}
          </span>
        </div>

        {/* Active and sold listings */}
        {tab !== "drafts" &&
          visibleProducts.map((product) => {
            const sold = product.adStatus === "sold";
            const reserved = product.adStatus === "reserved";
            return (
              <article className="manage-listing" key={product.id}>
                <img
                  src={product.image}
                  alt={product.title}
                  onError={(e) => {
                    e.currentTarget.src = GRAY_IMAGE;
                  }}
                />
                <div className="manage-copy">
                  <span className={`condition status-${product.adStatus ?? "active"}`}>
                    {sold ? "Sold" : reserved ? "Reserved" : "Active"}
                  </span>
                  <h3>{product.title}</h3>
                  <strong>{product.price}</strong>
                  <div className="listing-stats">
                    <span>{product.views ?? 0} views</span>
                    <span title="Saved by buyers">
                      <Icon name="heart" size={14} /> {product.favoritesCount ?? 0} favorites
                    </span>
                    <span>{product.city}</span>
                    {product.createdAt && <span>Posted: {product.createdAt}</span>}
                  </div>
                </div>
                <div className="manage-actions">
                  <button className="secondary" type="button" onClick={() => openListing(product.id)}>
                    View
                  </button>
                  {!sold && (
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setEditingProduct(product)}
                    >
                      Edit
                    </button>
                  )}
                  {sold ? (
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => void onStatusChange?.(product.id, "active")}
                    >
                      Put back online
                    </button>
                  ) : (
                    <button
                      className="primary"
                      type="button"
                      onClick={() => void onStatusChange?.(product.id, "sold")}
                    >
                      <Icon name="check" size={16} /> Mark as sold
                    </button>
                  )}
                  {onDeleteProduct && (
                    <button
                      className="secondary danger-btn"
                      type="button"
                      onClick={() => handleDelete(product)}
                      aria-label={`Delete ${product.title}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}

        {/* Drafts */}
        {tab === "drafts" &&
          drafts.map((draft) => {
            const amount = parsePrice(draft.data.price);
            const title = draft.data.title.trim() || "Untitled draft";
            return (
              <article className="manage-listing" key={draft.id}>
                <img src={draft.data.photos[0] || GRAY_IMAGE} alt={title} />
                <div className="manage-copy">
                  <span className="condition status-draft">Draft</span>
                  <h3>{title}</h3>
                  <strong>{amount !== null ? formatPrice(amount) : "No price yet"}</strong>
                  <div className="listing-stats">
                    <span>{draft.data.photos.length} photos</span>
                    {draft.data.category && <span>{draft.data.category}</span>}
                    <span>Last saved: {formatDate(draft.updatedAt)}</span>
                  </div>
                </div>
                <div className="manage-actions">
                  <button className="primary" type="button" onClick={() => onResumeDraft?.(draft.id)}>
                    Continue
                  </button>
                  <button
                    className="secondary danger-btn"
                    type="button"
                    onClick={() => handleDeleteDraft(draft)}
                    aria-label={`Delete draft ${title}`}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}

        {/* Empty state */}
        {(tab === "drafts" ? drafts.length === 0 : visibleProducts.length === 0) && (
          <div className="empty-account">
            <span>
              <Icon name="package" size={34} />
            </span>
            <h3>
              {tab === "drafts"
                ? "No drafts"
                : tab === "sold"
                  ? "Nothing sold yet"
                  : "No active listings"}
            </h3>
            <p>
              {tab === "drafts"
                ? 'Click "Save draft" while posting a listing to finish it later.'
                : "Post a listing to give items a second life."}
            </p>
            <button className="primary" type="button" onClick={() => setPage("sell")}>
              Post a listing
            </button>
          </div>
        )}
      </section>

      {editingProduct && (
        <EditListingModal
          product={editingProduct}
          onSave={async (updated) => {
            await onUpdateProduct?.(updated);
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </main>
  );
}
