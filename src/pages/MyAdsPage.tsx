import { useState } from "react";
import type { Page, Product } from "../types";
import { GRAY_IMAGE, products as defaultProducts } from "../utils/marketplace";
import { Icon } from "../components/ui";

export default function MyAdsPage({
  setPage,
  products = defaultProducts,
  onSelectProduct,
  onDeleteProduct,
  onUpdateProduct,
  onStatusChange,
}: {
  setPage: (p: Page) => void;
  products?: Product[];
  onSelectProduct?: (productId: number) => void;
  onDeleteProduct?: (productId: number) => void;
  onUpdateProduct?: (product: Product) => void;
  onStatusChange?: (productId: number, status: "active" | "reserved" | "sold") => void;
}) {
  const [status, setStatus] = useState<"active" | "sold" | "drafts">("active");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCondition, setEditCondition] = useState("");

  const userItems = products.filter((p) => p.isUserAd || p.id === 1 || p.id === 3);
  const activeProducts = userItems.filter((p) => p.adStatus !== "sold");
  const soldProducts = userItems.filter((p) => p.adStatus === "sold");

  const visibleProducts =
    status === "active" ? activeProducts : status === "sold" ? soldProducts : [];

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setEditTitle(prod.title);
    setEditPrice(String(prod.priceAmount || Number(prod.price.replace(/[^\d]/g, "")) || 0));
    setEditDesc(prod.description || "");
    setEditCondition(prod.state);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const numPrice = Number(editPrice.replace(/[^\d]/g, "")) || 0;
    const updated: Product = {
      ...editingProduct,
      title: editTitle.trim() || editingProduct.title,
      price: `€ ${numPrice}`,
      priceAmount: numPrice,
      description: editDesc.trim(),
      state: editCondition || editingProduct.state,
    };
    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }
    setEditingProduct(null);
  };

  return (
    <main className="shell standalone-page">
      <div className="page-back">
        <button onClick={() => setPage("account")}>← Back to my profile</button>
      </div>
      <div className="standalone-heading">
        <div>
          <span className="eyebrow">Manage your listings</span>
          <h1>My listings</h1>
          <p>View performance and manage your active, sold, and saved listings.</p>
        </div>
        <button className="primary" onClick={() => setPage("sell")}>
          <Icon name="plus" /> New listing
        </button>
      </div>

      <div className="status-cards">
        <button className={status === "active" ? "active" : ""} onClick={() => setStatus("active")}>
          <span>Active</span>
          <b>{activeProducts.length}</b>
          <small>Visible to buyers</small>
        </button>
        <button className={status === "sold" ? "active" : ""} onClick={() => setStatus("sold")}>
          <span>Sold</span>
          <b>{soldProducts.length}</b>
          <small>Successfully completed</small>
        </button>
        <button className={status === "drafts" ? "active" : ""} onClick={() => setStatus("drafts")}>
          <span>Drafts</span>
          <b>0</b>
          <small>Nothing saved yet</small>
        </button>
      </div>

      <section className="standalone-card">
        <div className="table-heading">
          <h2>
            {status === "active"
              ? "Active listings"
              : status === "sold"
                ? "Sold"
                : "Drafts"}
          </h2>
          <span>{visibleProducts.length} listings</span>
        </div>

        {visibleProducts.length ? (
          visibleProducts.map((product) => (
            <article className="manage-listing" key={product.id}>
              <img
                src={product.image}
                alt={product.title}
                onError={(e) => {
                  e.currentTarget.src = GRAY_IMAGE;
                }}
              />
              <div className="manage-copy">
                <span className="condition">{status === "sold" ? "Sold" : "Active"}</span>
                <h3>{product.title}</h3>
                <strong>{product.price}</strong>
                <div className="listing-stats">
                  <span>Location: {product.city}</span>
                  <span>{product.state}</span>
                  <span>Posted: {product.createdAt || "Today"}</span>
                </div>
              </div>
              <div className="manage-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(product.id);
                    setPage("detail");
                  }}
                >
                  View
                </button>
                <button
                  className="secondary"
                  onClick={() => handleStartEdit(product)}
                  type="button"
                >
                  Edit
                </button>
                <select
                  value={product.adStatus || "active"}
                  onChange={(e) =>
                    onStatusChange?.(
                      product.id,
                      e.target.value as "active" | "reserved" | "sold",
                    )
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                    color: "var(--ink)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <option value="active">Active</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
                {onDeleteProduct && (
                  <button
                    className="secondary"
                    style={{ color: "#d94343" }}
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-account">
            <span>
              <Icon name="package" size={34} />
            </span>
            <h3>No listings in this category</h3>
            <p>Post a listing to give items a second life.</p>
            <button className="primary" onClick={() => setPage("sell")}>
              Post a listing
            </button>
          </div>
        )}
      </section>

      {/* BEWERK MODAL */}
      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEditingProduct(null)}
              type="button"
            >
              <Icon name="close" />
            </button>
            <span className="eyebrow">Edit listing</span>
            <h2>{editingProduct.title}</h2>
            <form
              onSubmit={handleSaveEdit}
              style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Title
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                  }}
                  required
                />
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Price (€)
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                  }}
                  required
                />
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Condition
                <select
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                  }}
                >
                  <option value="Like new">Like new</option>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                </select>
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Description
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--canvas)",
                  }}
                />
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "12px",
                }}
              >
                <button
                  className="secondary"
                  type="button"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button className="primary" type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
