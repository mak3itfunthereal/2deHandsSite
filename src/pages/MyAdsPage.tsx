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
        <button onClick={() => setPage("account")}>← Terug naar mijn profiel</button>
      </div>
      <div className="standalone-heading">
        <div>
          <span className="eyebrow">Beheer je aanbod</span>
          <h1>Mijn advertenties</h1>
          <p>Bekijk prestaties en beheer je actieve, verkochte en opgeslagen advertenties.</p>
        </div>
        <button className="primary" onClick={() => setPage("sell")}>
          <Icon name="plus" /> Nieuwe advertentie
        </button>
      </div>

      <div className="status-cards">
        <button className={status === "active" ? "active" : ""} onClick={() => setStatus("active")}>
          <span>Actief</span>
          <b>{activeProducts.length}</b>
          <small>Zichtbaar voor kopers</small>
        </button>
        <button className={status === "sold" ? "active" : ""} onClick={() => setStatus("sold")}>
          <span>Verkocht</span>
          <b>{soldProducts.length}</b>
          <small>Succesvol afgerond</small>
        </button>
        <button className={status === "drafts" ? "active" : ""} onClick={() => setStatus("drafts")}>
          <span>Concepten</span>
          <b>0</b>
          <small>Nog niets opgeslagen</small>
        </button>
      </div>

      <section className="standalone-card">
        <div className="table-heading">
          <h2>
            {status === "active"
              ? "Actieve advertenties"
              : status === "sold"
                ? "Verkocht"
                : "Concepten"}
          </h2>
          <span>{visibleProducts.length} advertenties</span>
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
                <span className="condition">{status === "sold" ? "Verkocht" : "Actief"}</span>
                <h3>{product.title}</h3>
                <strong>{product.price}</strong>
                <div className="listing-stats">
                  <span>Locatie: {product.city}</span>
                  <span>{product.state}</span>
                  <span>Geplaatst: {product.createdAt || "Vandaag"}</span>
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
                  Bekijken
                </button>
                <button
                  className="secondary"
                  onClick={() => handleStartEdit(product)}
                  type="button"
                >
                  Bewerken
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
                  <option value="active">Actief</option>
                  <option value="reserved">Gereserveerd</option>
                  <option value="sold">Verkocht</option>
                </select>
                {onDeleteProduct && (
                  <button
                    className="secondary"
                    style={{ color: "#d94343" }}
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    Verwijderen
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
            <h3>Geen advertenties in deze categorie</h3>
            <p>Plaats een advertentie om spullen een tweede leven te geven.</p>
            <button className="primary" onClick={() => setPage("sell")}>
              Plaats advertentie
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
            <span className="eyebrow">Advertentie bewerken</span>
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
                Titel
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
                Prijs (€)
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
                Staat
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
                  <option value="Zo goed als nieuw">Zo goed als nieuw</option>
                  <option value="Nieuw">Nieuw</option>
                  <option value="Goed">Goed</option>
                  <option value="Gebruikt">Gebruikt</option>
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
                Beschrijving
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
                  Annuleren
                </button>
                <button className="primary" type="submit">
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
