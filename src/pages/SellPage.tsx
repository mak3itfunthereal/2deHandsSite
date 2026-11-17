import { useState } from "react";
import type { LocationPreference, Page, Product, UserProfile } from "../types";
import { categories, IMG } from "../utils/marketplace";
import { Icon, Logo } from "../components/ui";

export default function SellPage({
  setPage,
  location,
  user,
  onCreateProduct,
  onSelectProduct,
}: {
  setPage: (p: Page) => void;
  location?: LocationPreference;
  user?: UserProfile;
  onCreateProduct?: (product: Omit<Product, "id">) => Promise<Product>;
  onSelectProduct?: (productId: number) => void;
}) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  // Form states
  const [title, setTitle] = useState("Product 1");
  const [category, setCategory] = useState("Category 1");
  const [description, setDescription] = useState(
    "Product description via API.",
  );
  const [condition, setCondition] = useState("Like new");
  const [price, setPrice] = useState("100");
  const [allowBidding, setAllowBidding] = useState(true);
  const [allowShipping, setAllowShipping] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(IMG.bike);

  const city = location?.city || "City 1";

  const titles = [
    "Add photos",
    "Tell us about your item",
    "Set your price",
    "Delivery or pickup",
    "Review your listing",
  ];

  const handleFinish = async () => {
    setSubmitting(true);
    const newProductData: Omit<Product, "id"> = {
      title: title.trim() || "Second-hand item",
      price: `€ ${price.trim()}`,
      priceAmount: Number(price.replace(/[^\d]/g, "")) || 0,
      city: city,
      distance: "0 km",
      state: condition,
      category: category,
      image: photoUrl,
      images: [photoUrl],
      description: description.trim(),
      lat: location?.lat || 52.0907,
      lon: location?.lon || 5.1214,
      sellerName: user ? `${user.firstName} ${user.lastName}` : "You",
      sellerInitials: user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "ME",
      sellerVerified: true,
      createdAt: "Just now",
      isUserAd: true,
    };

    if (onCreateProduct) {
      try {
        const prod = await onCreateProduct(newProductData);
        setCreatedProduct(prod);
      } catch (err) {
        console.error("Error saving listing:", err);
      }
    }
    setSubmitting(false);
    setDone(true);
  };

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPhotoUrl(url);
      }
    };
    input.click();
  };

  if (done) {
    const displayProduct = createdProduct || {
      title,
      price: `€ ${price}`,
      image: photoUrl,
      id: 1,
    };

    return (
      <main className="sell-success shell">
        <span className="success-icon">
          <Icon name="check" size={48} />
        </span>
        <span className="eyebrow">Done</span>
        <h1>Your listing is live!</h1>
        <p>Your {displayProduct.title} is now visible to thousands of buyers.</p>

        <div className="success-card">
          <img src={displayProduct.image} alt={displayProduct.title} />
          <div>
            <b>{displayProduct.title}</b>
            <span>{displayProduct.price}</span>
          </div>
        </div>

        <button
          className="primary"
          onClick={() => {
            if (createdProduct && onSelectProduct) {
              onSelectProduct(createdProduct.id);
            }
            setPage("detail");
          }}
        >
          View your listing
        </button>

        <button className="secondary" onClick={() => setPage("my-ads")}>
          Go to my listings
        </button>

        <button
          className="secondary"
          onClick={() => {
            setDone(false);
            setStep(1);
          }}
        >
          Sell another item
        </button>
      </main>
    );
  }

  return (
    <main className="sell-flow">
      <div className="sell-top shell">
        <button onClick={() => setPage("home")}>‹ Cancel</button>
        <Logo onClick={() => setPage("home")} />
        <button onClick={() => setPage("my-ads")}>Drafts</button>
      </div>

      <div className="progress">
        <i style={{ width: `${step * 20}%` }} />
      </div>

      <div className="sell-shell">
        <div className="step-label">Step {step} of 5</div>
        <h1>{titles[step - 1]}</h1>

        {step === 1 && (
          <>
            <p className="lead">Good photos sell faster. Add up to 20 photos.</p>
            <div className="upload-zone" onClick={handlePhotoUpload} style={{ cursor: "pointer" }}>
              <span>
                <Icon name="camera" size={32} />
              </span>
              <h3>Click or drag photos here</h3>
              <p>JPG, PNG, or HEIC · max. 10 MB</p>
              <button
                className="secondary"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoUpload();
                }}
              >
                Choose photo
              </button>
            </div>
            <div className="photo-preview">
              <div>
                <img src={photoUrl} alt="Main photo" />
                <span>Main photo</span>
              </div>
              <button type="button" onClick={handlePhotoUpload}>
                <Icon name="plus" />
                Another photo
              </button>
            </div>
            <div className="tip">
              <b>Photo tip</b>
              <p>Use daylight and photograph your item from several angles.</p>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="form-stack">
            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Product 1"
              />
              <small>{title.length} / 60 tekens</small>
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Description
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe any damage, specifications, or special features..."
              />
            </label>

            <div className="form-grid">
              <label>
                Condition
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}
                >
                  <option value="Like new">Like new</option>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-stack">
            <label>
              Asking price
              <div className="big-price-input">
                <span>€</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </label>
            <div className="advice">
              <span>Suggested price</span>
              <b>€ {Math.max(10, Number(price) - 30)} – € {Number(price) + 40}</b>
              <p>Based on similar sales in {category}.</p>
            </div>
            <label className="check card-check">
              <input
                type="checkbox"
                checked={allowBidding}
                onChange={(e) => setAllowBidding(e.target.checked)}
              />
              <span>
                <b>Allow offers</b>
                <small>Buyers can send you an offer</small>
              </span>
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="form-stack">
            <label className="check card-check">
              <input type="checkbox" checked disabled />
              <span>
                <b>Pickup in {city}</b>
                <small>Your exact address stays private until the sale</small>
              </span>
            </label>
            <label className="check card-check">
              <input
                type="checkbox"
                checked={allowShipping}
                onChange={(e) => setAllowShipping(e.target.checked)}
              />
              <span>
                <b>Shipping available</b>
                <small>From €6.95 with Buyer Protection via PostNL / DHL</small>
              </span>
            </label>
            <div className="mini-map">
              <Icon name="pin" size={28} />
              <span>Location: {city}</span>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="review-ad">
            <img src={photoUrl} alt="" />
            <div>
              <span className="condition">{condition}</span>
              <h2>{title}</h2>
              <strong>€ {price}</strong>
              <p>
                Pickup in {city} {allowShipping ? "· Shipping available" : ""} ·{" "}
                {allowBidding ? "Offers accepted" : "Fixed price"}
              </p>
            </div>
            <button className="secondary" type="button" onClick={() => setStep(2)}>
              Edit
            </button>
          </div>
        )}

        <div className="sell-controls">
          <button
            className="secondary"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="primary"
            onClick={() => {
              if (step === 5) {
                void handleFinish();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={submitting}
            type="button"
          >
            {submitting ? "Posting..." : step === 5 ? "Post listing" : "Next step"}{" "}
            <Icon name="chevron" />
          </button>
        </div>
      </div>
    </main>
  );
}
