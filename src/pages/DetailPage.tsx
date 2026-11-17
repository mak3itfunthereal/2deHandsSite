import { useEffect, useMemo, useState } from "react";
import type { Page, Product } from "../types";
import { products as defaultProducts } from "../utils/marketplace";
import { Icon, ProductGrid, RowTitle } from "../components/ui";
import { FALLBACK_IMAGE } from "../components/ProductCard";

export default function DetailPage({
  setPage,
  productId,
  products = defaultProducts,
  favorite,
  toggle,
  onStartChat,
  onSelectProduct,
  onBuyProduct,
  onAddBid,
}: {
  setPage: (p: Page) => void;
  productId?: number | null;
  products?: Product[];
  favorite: boolean;
  toggle: () => void;
  onStartChat?: (product: Product, initialMessage?: string) => void;
  onSelectProduct?: (productId: number) => void;
  onBuyProduct?: (productId: number) => void;
  onAddBid?: (
    productId: number,
    bid: { id: string; bidderName: string; amount: number; time: string },
  ) => void;
}) {
  const product = useMemo(() => {
    if (productId != null) {
      const found = products.find((p) => p.id === productId);
      if (found) return found;
    }
    return products[0];
  }, [productId, products]);

  const [offer, setOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState(() =>
    product?.priceAmount ? String(Math.round(product.priceAmount * 0.9)) : "100",
  );
  const [offerMessage, setOfferMessage] = useState("");
  const [toast, setToast] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Checkout states
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping">("shipping");
  const [paymentMethod, setPaymentMethod] = useState("iDEAL");
  const [paymentBank, setPaymentBank] = useState("ING");
  const [orderReference, setOrderReference] = useState("");

  const highestBid = useMemo(() => {
    if (!product?.bids || product.bids.length === 0) return 0;
    return Math.max(...product.bids.map((b) => b.amount));
  }, [product?.bids]);

  const itemPrice = product?.priceAmount || 100;
  const shippingCost = deliveryMethod === "shipping" ? 4.95 : 0;
  const buyerProtectionCost = 0.99;
  const totalAmount = (itemPrice + shippingCost + buyerProtectionCost).toFixed(2);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffer(false);
    };
    if (offer) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [offer]);

  useEffect(() => {
    if (product?.priceAmount) {
      setOfferAmount(String(Math.round(product.priceAmount * 0.9)));
    }
  }, [product]);

  const galleryImages = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    return product ? [product.image] : [];
  }, [product]);

  const currentImage = galleryImages[selectedImageIndex] || product?.image || "";

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.id !== product.id && p.category === product.category);
  }, [products, product]);

  const handleStartChat = () => {
    if (!product) return;
    if (onStartChat) {
      onStartChat(product);
    }
    setPage("chat");
  };

  const handleSendOffer = () => {
    if (!product) return;
    const bidVal = Number(offerAmount) || 0;
    const msg = `I offer €${offerAmount}.${offerMessage ? ` ${offerMessage}` : ""}`;
    if (onAddBid && bidVal > 0) {
      onAddBid(product.id, {
        id: `bid-${Date.now()}`,
        bidderName: "You",
        amount: bidVal,
        time: "Just now",
      });
    }
    if (onStartChat) {
      onStartChat(product, msg);
    }
    setOffer(false);
    setPage("chat");
  };

  const handleCheckoutConfirm = () => {
    if (!product) return;
    const ref = `BID-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderReference(ref);
    if (onBuyProduct) {
      onBuyProduct(product.id);
    }
    setCheckoutSuccess(true);
  };

  if (!product) {
    return (
      <main className="shell detail-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>Listing not found</h2>
        <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>
          This listing may have been removed or is no longer available.
        </p>
        <button className="primary" onClick={() => setPage("search")}>
          View other listings
        </button>
      </main>
    );
  }

  return (
    <main className="shell detail-page">
      <div className="breadcrumbs">
        <button onClick={() => setPage("home")}>Home</button>
        <Icon name="chevron" size={14} />
        <button onClick={() => setPage("search")}>{product.category}</button>
        <Icon name="chevron" size={14} />
        <span>{product.title}</span>
      </div>

      <div className="detail-layout">
        <div className="gallery">
          <div className="gallery-main">
            <img
              src={currentImage}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <span>
              {selectedImageIndex + 1} / {galleryImages.length}
            </span>
          </div>
          {galleryImages.length > 1 && (
            <div className="thumbs">
              {galleryImages.map((imgSrc, i) => (
                <button
                  className={i === selectedImageIndex ? "selected" : ""}
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  type="button"
                >
                  <img
                    src={imgSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="buy-card">
          <div className="detail-labels">
            {product.top && <span className="top-tag">Featured listing</span>}
            <span className="condition">{product.state}</span>
          </div>
          <h1>{product.title}</h1>
          <p className="detail-location">
            <Icon name="pin" size={17} />
            {product.city} · {product.distance || "nearby"}
          </p>
          <strong className="detail-price">{product.price}</strong>
          <span className="nego">Negotiable</span>
          {product.adStatus === "sold" ? (
            <div style={{ margin: "16px 0", textAlign: "center" }}>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(220, 38, 38, 0.12)",
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  width: "100%",
                }}
              >
                This item has been sold
              </span>
            </div>
          ) : (
            <button
              className="primary buy-now"
              onClick={() => {
                setCheckoutSuccess(false);
                setCheckoutOpen(true);
              }}
            >
              Buy now with Buyer Protection
            </button>
          )}

          <div className="two-buttons">
            <button className="secondary" onClick={handleStartChat}>
              <Icon name="message" />
              Send a message
            </button>
            <button
              className="secondary"
              onClick={() => setOffer(true)}
              disabled={product.adStatus === "sold"}
            >
              Make an offer
            </button>
          </div>

          {/* Bid overview */}
          <div className="bids-card">
            <div className="bids-header">
              <b>Offers ({product.bids?.length || 0})</b>
              {highestBid > 0 && (
                <span className="highest-bid-badge">Highest offer: €{highestBid}</span>
              )}
            </div>
            {product.bids && product.bids.length > 0 ? (
              <ul className="bids-list">
                {product.bids.slice(0, 3).map((b) => (
                  <li key={b.id}>
                    <div>
                      <b style={{ display: "block" }}>{b.bidderName}</b>
                      <small>{b.time}</small>
                    </div>
                    <strong>€ {b.amount}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                No offers yet. Be the first to make one!
              </p>
            )}
          </div>
          <div className="minor-actions">
            <button onClick={toggle}>
              <Icon name="heart" fill={favorite ? "currentColor" : "none"} />
              {favorite ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  void navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Icon name="share" />
              Share
            </button>
          </div>
          <div className="protection">
            <Icon name="shield" size={27} />
            <div>
              <b>Buyer Protection</b>
              <p>Your payment is protected until you are satisfied.</p>
            </div>
            <Icon name="chevron" size={18} />
          </div>
        </aside>
      </div>

      <div className="detail-below">
        <div className="description-card">
          <h2>About this item</h2>
          <div className="specs">
            <p>
              <span>Category</span>
              <b>{product.category}</b>
            </p>
            <p>
              <span>Condition</span>
              <b>{product.state}</b>
            </p>
            <p>
              <span>Location</span>
              <b>{product.city}</b>
            </p>
            <p>
              <span>Posted</span>
              <b>{product.createdAt || "Recent"}</b>
            </p>
          </div>
          <h3>Description</h3>
          <p>
            {product.description ||
              `For sale: ${product.title} in "${product.state}" condition. Pick up in ${product.city} or arrange shipping.`}
          </p>
          <hr />
          <div className="meta">
            <span>Posted {product.createdAt || "recent"}</span>
            <span>184 views</span>
            <span>23 favorites</span>
          </div>
        </div>

        <div className="seller-card">
          <div className="seller-top">
            <span className="seller-avatar">{product.sellerInitials || "V1"}</span>
            <div>
              <h3>{product.sellerName || "Seller 1"}</h3>
              <p>
                <span className="stars">★★★★★</span> 4,9 · 15 reviews
              </p>
            </div>
            {product.sellerVerified !== false && (
              <span className="verified">
                <Icon name="check" size={13} />
                Verified
              </span>
            )}
          </div>
          <ul>
            <li>
              <span>Response time</span>
              <b>Within 1 hour</b>
            </li>
            <li>
              <span>Member since</span>
              <b>2024</b>
            </li>
            <li>
              <span>Location</span>
              <b>{product.city}</b>
            </li>
          </ul>
          <button className="secondary" onClick={handleStartChat}>
            Send a message
          </button>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="detail-more">
          <RowTitle title={`Meer in ${product.category}`} />
          <ProductGrid
            count={4}
            items={similarProducts}
            onOpenProduct={(id) => {
              if (onSelectProduct) onSelectProduct(id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            favorites={new Set()}
            toggle={() => {}}
          />
        </section>
      )}

      {offer && (
        <div className="modal-backdrop" onClick={() => setOffer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOffer(false)}>
              <Icon name="close" />
            </button>
            <span className="eyebrow">Make an offer</span>
              <h2>What would you like to offer for {product.title}?</h2>
              <p>Asking price: {product.price}</p>
            <label>
              Your offer
              <div className="offer-input">
                <span>€</span>
                <input
                  autoFocus
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  type="number"
                />
              </div>
            </label>
            <div className="offer-chips">
              {(() => {
                const base = product.priceAmount || 100;
                const chips = [
                  Math.max(10, Math.round(base * 0.7)),
                  Math.max(15, Math.round(base * 0.8)),
                  Math.max(20, Math.round(base * 0.9)),
                  base,
                ];
                return chips.map((x) => (
                  <button key={x} onClick={() => setOfferAmount(String(x))} type="button">
                    € {x}
                  </button>
                ));
              })()}
            </div>
            <label>
              Message (optional)
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="e.g. when you can pick it up..."
              />
            </label>
            <button className="primary" onClick={handleSendOffer}>
              Send offer via chat
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WITH BUYER PROTECTION */}
      {checkoutOpen && (
        <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)}>
          <div className="modal checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCheckoutOpen(false)} type="button">
              <Icon name="close" />
            </button>

            {!checkoutSuccess ? (
              <>
                <span className="eyebrow">
                  <Icon name="shield" size={14} /> Secure checkout with Buyer Protection
                </span>
                <h2>Complete your order</h2>

                {/* Product preview */}
                <div className="checkout-product-preview">
                  <img
                    src={product.image}
                    alt={product.title}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div>
                    <b style={{ fontSize: "14px", display: "block" }}>{product.title}</b>
                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>{product.price}</span>
                    <small style={{ display: "block", color: "var(--muted)", marginTop: "2px" }}>
                      Seller: {product.sellerName || "Seller 1"} ({product.city})
                    </small>
                  </div>
                </div>

                {/* Delivery method */}
                <b style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                  Choose delivery or pickup
                </b>
                <div className="delivery-options">
                  <label
                    className={`delivery-card ${deliveryMethod === "shipping" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "shipping"}
                      onChange={() => setDeliveryMethod("shipping")}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div style={{ flex: 1 }}>
                      <b>Home delivery via PostNL</b>
                      <small style={{ display: "block", color: "var(--muted)" }}>
                        Insured package with Track & Trace
                      </small>
                    </div>
                    <b>€4.95</b>
                  </label>

                  <label className={`delivery-card ${deliveryMethod === "pickup" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "pickup"}
                      onChange={() => setDeliveryMethod("pickup")}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div style={{ flex: 1 }}>
                      <b>Pick up in {product.city}</b>
                      <small style={{ display: "block", color: "var(--muted)" }}>
                        Arrange a pickup time with the seller
                      </small>
                    </div>
                    <b style={{ color: "#16a34a" }}>Free</b>
                  </label>
                </div>

                {/* Payment method */}
                <b style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                  Choose payment method
                </b>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                      background: "var(--canvas)",
                      color: "var(--ink)",
                    }}
                  >
                    <option value="iDEAL">iDEAL</option>
                    <option value="Creditcard">Credit card (Visa / Mastercard)</option>
                    <option value="Bancontact">Bancontact</option>
                    <option value="ApplePay">Apple Pay</option>
                  </select>

                  {paymentMethod === "iDEAL" && (
                    <select
                      value={paymentBank}
                      onChange={(e) => setPaymentBank(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        background: "var(--canvas)",
                        color: "var(--ink)",
                      }}
                    >
                      <option value="ING">ING Bank</option>
                      <option value="Rabobank">Rabobank</option>
                      <option value="ABN">ABN AMRO</option>
                      <option value="SNS">SNS Bank</option>
                      <option value="ASN">ASN Bank</option>
                      <option value="bunq">bunq</option>
                    </select>
                  )}
                </div>

                {/* Cost breakdown */}
                <div className="checkout-breakdown">
                  <div className="checkout-row">
                    <span>Item price</span>
                    <span>€ {itemPrice}</span>
                  </div>
                  <div className="checkout-row">
                    <span>Buyer Protection service</span>
                    <span>€0.99</span>
                  </div>
                  <div className="checkout-row">
                    <span>Delivery</span>
                    <span>{deliveryMethod === "shipping" ? "€4.95" : "Free"}</span>
                  </div>
                  <div className="checkout-row total">
                    <span>Total due</span>
                    <span>€ {totalAmount}</span>
                  </div>
                </div>

                <button
                  className="primary"
                  type="button"
                  onClick={handleCheckoutConfirm}
                  style={{ width: "100%" }}
                >
                  Pay €{totalAmount} with {paymentMethod}
                </button>
              </>
            ) : (
              <div className="checkout-success-view">
                <span className="checkout-success-icon">
                  <Icon name="check" size={32} />
                </span>
                <span className="eyebrow" style={{ color: "#16a34a" }}>
                  Order successful!
                </span>
                <h2>Thank you for your purchase</h2>
                <p style={{ margin: "10px 0 16px", color: "var(--muted)", fontSize: "14px" }}>
                  Order number: <b>{orderReference}</b>
                </p>
                <div
                  style={{
                    background: "var(--canvas)",
                    border: "1px solid var(--line)",
                    borderRadius: "10px",
                    padding: "14px",
                    margin: "16px 0 24px",
                    textAlign: "left",
                    fontSize: "13px",
                  }}
                >
                  <p style={{ margin: "0 0 6px" }}>
                    <b>What happens next?</b>
                  </p>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {deliveryMethod === "shipping"
                      ? `The seller (${product.sellerName}) will receive a shipping label from PostNL and has 3 days to send your order.`
                      : `Contact the seller (${product.sellerName}) in chat to arrange a pickup time.`}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setPage("home");
                    }}
                  >
                    Go to home
                  </button>
                  <button
                    className="primary"
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(false);
                      handleStartChat();
                    }}
                  >
                    Chat with seller
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span>
            <Icon name="check" />
          </span>
          <div>
            <b>Order prepared</b>
            <p>You can now check out safely with Buyer Protection.</p>
          </div>
        </div>
      )}
    </main>
  );
}
