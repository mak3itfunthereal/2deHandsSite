import { useEffect, useRef, useState } from "react";
import type { LocationPreference, Page, Product, UserProfile } from "../types";
import { categories, IMG, userInitials } from "../utils/marketplace";
import { Icon, Logo } from "../components/ui";
import { PhotoStep } from "./sell/PhotoStep";
import {
  DESCRIPTION_MAX,
  emptySellForm,
  firstInvalidStep,
  formatPrice,
  parsePrice,
  TITLE_MAX,
  validateStep,
  type Delivery,
  type SellFormData,
  type SellFormErrors,
} from "../utils/sellForm";

const STEP_TITLES = [
  "Add photos",
  "Title and category",
  "Price and offers",
  "Pickup or shipping",
  "Check and publish",
];

const CONDITIONS = ["New", "Like new", "Good", "Used"];

const DELIVERY_OPTIONS: { value: Delivery; label: string; help: string }[] = [
  { value: "pickup", label: "Pickup only", help: "The buyer picks up the item at your place." },
  { value: "shipping", label: "Shipping only", help: "You ship the item, from €6.95 via PostNL / DHL." },
  { value: "both", label: "Pickup or shipping", help: "The buyer chooses." },
];

/** Small helper: shows the error text under a field and links it for screen readers. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span className="field-error" id={id} role="alert">
      {message}
    </span>
  );
}

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
  const [form, setForm] = useState<SellFormData>(emptySellForm);
  const [errors, setErrors] = useState<SellFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const city = location?.city || "your city";
  const amount = parsePrice(form.price);

  // Move keyboard/screen reader focus to the step title when the step changes
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo(0, 0);
  }, [step]);

  /** Update one field and clear its error message. */
  const update = <K extends keyof SellFormData>(field: K, value: SellFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const goToStep = (target: number) => {
    setErrors({});
    setSubmitError("");
    setStep(target);
  };

  const handleNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    goToStep(step + 1);
  };

  const handlePublish = async () => {
    const invalid = firstInvalidStep(form);
    if (invalid !== null || amount === null) {
      goToStep(invalid ?? 3);
      setErrors(validateStep(invalid ?? 3, form));
      return;
    }

    const sellerName = user ? `${user.firstName} ${user.lastName}`.trim() : "You";
    const newProduct: Omit<Product, "id"> = {
      title: form.title.trim(),
      price: formatPrice(amount),
      priceAmount: amount,
      city: location?.city || "",
      distance: "0 km",
      state: form.condition,
      category: form.category,
      image: form.photos[0],
      images: form.photos,
      description: form.description.trim(),
      lat: location?.lat ?? 52.0907,
      lon: location?.lon ?? 5.1214,
      sellerName,
      sellerInitials: user
        ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
        : "ME",
      sellerVerified: true,
      createdAt: "Just now",
      isUserAd: true,
      adStatus: "active",
      allowsOffers: form.allowOffers,
      allowsPickup: form.delivery !== "shipping",
      allowsShipping: form.delivery !== "pickup",
    };

    if (onCreateProduct) {
      try {
        const prod = await onCreateProduct(newProductData);
        setCreatedProduct(prod);
      } catch (err) {
        console.error("Error saving listing:", err);
        setSubmitError("Unable to post your listing. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      setCreatedProduct(await onCreateProduct(newProduct));
    } catch {
      setSubmitError("Your listing could not be posted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Success screen ----------
  if (createdProduct) {
    return (
      <main className="sell-success shell">
        <span className="success-icon">
          <Icon name="check" size={48} />
        </span>
        <span className="eyebrow">Done</span>
        <h1>Your listing is live!</h1>
        <p>Your {createdProduct.title} is now visible to buyers.</p>

        <div className="success-card">
          <img src={createdProduct.image} alt={createdProduct.title} />
          <div>
            <b>{createdProduct.title}</b>
            <span>{createdProduct.price}</span>
          </div>
        </div>

        <button
          className="primary"
          type="button"
          onClick={() => {
            onSelectProduct?.(createdProduct.id);
            setPage("detail");
          }}
        >
          View your listing
        </button>
        <button className="secondary" type="button" onClick={() => setPage("my-ads")}>
          Go to my listings
        </button>
        <button
          className="secondary"
          type="button"
          onClick={() => {
            setCreatedProduct(null);
            setForm(emptySellForm);
            goToStep(1);
          }}
        >
          Sell another item
        </button>
      </main>
    );
  }

  // ---------- Form ----------
  return (
    <main className="sell-flow">
      <div className="sell-top shell">
        <button type="button" onClick={() => setPage("home")}>
          ‹ Cancel
        </button>
        <Logo onClick={() => setPage("home")} />
        <button type="button" onClick={() => setPage("my-ads")}>
          My listings
        </button>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-label="Form progress"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={step}
      >
        <i style={{ width: `${step * 20}%` }} />
      </div>

      <form
        className="sell-shell"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 5) void handlePublish();
          else handleNext();
        }}
      >
        <div className="step-label">Step {step} of 5</div>
        <h1 ref={headingRef} tabIndex={-1}>
          {STEP_TITLES[step - 1]}
        </h1>

        {/* Step 1: photos */}
        {step === 1 && (
          <PhotoStep
            photos={form.photos}
            onChange={(photos) => update("photos", photos)}
            error={errors.photos}
          />
        )}

        {/* Step 2: title and category */}
        {step === 2 && (
          <div className="form-stack">
            <label htmlFor="sell-title">
              Title
              <input
                id="sell-title"
                value={form.title}
                maxLength={TITLE_MAX}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Red city bike, 28 inch"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "sell-title-error" : undefined}
              />
              <small>
                {form.title.length} / {TITLE_MAX} characters
              </small>
              <FieldError id="sell-title-error" message={errors.title} />
            </label>

            <div className="form-grid">
              <label htmlFor="sell-category">
                Category
                <select
                  id="sell-category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={errors.category ? "sell-category-error" : undefined}
                >
                  <option value="">Choose a category</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FieldError id="sell-category-error" message={errors.category} />
              </label>

              <label htmlFor="sell-condition">
                Condition
                <select
                  id="sell-condition"
                  value={form.condition}
                  onChange={(e) => update("condition", e.target.value)}
                  aria-invalid={Boolean(errors.condition)}
                  aria-describedby={errors.condition ? "sell-condition-error" : undefined}
                >
                  <option value="">Choose the condition</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FieldError id="sell-condition-error" message={errors.condition} />
              </label>
            </div>

            <label htmlFor="sell-description">
              Description (optional)
              <textarea
                id="sell-description"
                rows={5}
                maxLength={DESCRIPTION_MAX}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe size, brand, damage or special features…"
              />
              <FieldError id="sell-description-error" message={errors.description} />
            </label>
          </div>
        )}

        {/* Step 3: price and offers */}
        {step === 3 && (
          <div className="form-stack">
            <label htmlFor="sell-price">
              Asking price
              <div className="big-price-input">
                <span aria-hidden="true">€</span>
                <input
                  id="sell-price"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="0"
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby={errors.price ? "sell-price-error" : undefined}
                />
              </div>
              <FieldError id="sell-price-error" message={errors.price} />
            </label>

            <label className="check card-check">
              <input
                type="checkbox"
                checked={form.allowOffers}
                onChange={(e) => update("allowOffers", e.target.checked)}
              />
              <span>
                <b>Allow offers</b>
                <small>Buyers can send you an offer below your asking price</small>
              </span>
            </label>
          </div>
        )}

        {/* Step 4: pickup or shipping */}
        {step === 4 && (
          <fieldset className="form-stack delivery-options">
            <legend className="sr-only">How can the buyer get the item?</legend>
            {DELIVERY_OPTIONS.map((option) => (
              <label className="check card-check" key={option.value}>
                <input
                  type="radio"
                  name="delivery"
                  value={option.value}
                  checked={form.delivery === option.value}
                  onChange={() => update("delivery", option.value)}
                />
                <span>
                  <b>{option.label}</b>
                  <small>{option.help}</small>
                </span>
              </label>
            ))}
            {form.delivery !== "shipping" && (
              <div className="mini-map">
                <Icon name="pin" size={28} />
                <span>Pickup in {city}. Your exact address stays private until the sale.</span>
              </div>
            )}
          </fieldset>
        )}

        {/* Step 5: check and publish */}
        {step === 5 && (
          <div className="review-list">
            <section className="review-section">
              <div className="review-section-head">
                <h2>Photos ({form.photos.length})</h2>
                <button type="button" className="link-btn" onClick={() => goToStep(1)}>
                  Edit
                </button>
              </div>
              <div className="review-photos">
                {form.photos.map((src, i) => (
                  <img key={i} src={src} alt={i === 0 ? "Main photo" : `Photo ${i + 1}`} />
                ))}
              </div>
            </section>

            <section className="review-section">
              <div className="review-section-head">
                <h2>{form.title}</h2>
                <button type="button" className="link-btn" onClick={() => goToStep(2)}>
                  Edit
                </button>
              </div>
              <p>
                {form.category} · {form.condition}
              </p>
              {form.description && <p className="review-description">{form.description}</p>}
            </section>

            <section className="review-section">
              <div className="review-section-head">
                <h2>{amount !== null ? formatPrice(amount) : "-"}</h2>
                <button type="button" className="link-btn" onClick={() => goToStep(3)}>
                  Edit
                </button>
              </div>
              <p>{form.allowOffers ? "Offers accepted" : "Fixed price"}</p>
            </section>

            <section className="review-section">
              <div className="review-section-head">
                <h2>{DELIVERY_OPTIONS.find((o) => o.value === form.delivery)?.label}</h2>
                <button type="button" className="link-btn" onClick={() => goToStep(4)}>
                  Edit
                </button>
              </div>
              {form.delivery !== "shipping" && <p>Pickup in {city}</p>}
            </section>

            {submitError && (
              <p className="field-error" role="alert">
                {submitError}
              </p>
            )}
          </div>
        )}

        {submitError && <p role="alert">{submitError}</p>}
        <div className="sell-controls">
          <button
            className="secondary"
            type="button"
            disabled={step === 1 || submitting}
            onClick={() => goToStep(step - 1)}
          >
            Previous
          </button>
          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Publishing…" : step === 5 ? "Publish listing" : "Next step"}{" "}
            <Icon name="chevron" />
          </button>
        </div>
      </form>
    </main>
  );
}
