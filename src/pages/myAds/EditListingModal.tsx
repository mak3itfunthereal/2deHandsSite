import { useEffect, useRef, useState } from "react";
import type { Product } from "../../types";
import { Icon } from "../../components/ui";
import {
  DESCRIPTION_MAX,
  formatPrice,
  parsePrice,
  TITLE_MAX,
  TITLE_MIN,
} from "../../utils/sellForm";

const CONDITIONS = ["New", "Like new", "Good", "Used"];

/**
 * Pop-up to quickly edit title, price, condition and description of a listing.
 * - Closes with Escape, the X button, Cancel, or a click outside
 * - Uses the same rules as the sell form (utils/sellForm.ts)
 */
export function EditListingModal({
  product,
  onSave,
  onClose,
}: {
  product: Product;
  onSave: (updated: Product) => Promise<void> | void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.priceAmount ?? ""));
  const [condition, setCondition] = useState(product.state);
  const [description, setDescription] = useState(product.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Focus the first field when the modal opens, close with Escape
  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parsePrice(price);
    if (title.trim().length < TITLE_MIN) return setError(`Title needs at least ${TITLE_MIN} characters.`);
    if (amount === null || amount <= 0) return setError("Enter a valid price, for example 25 or 25.50.");

    setSaving(true);
    try {
      await onSave({
        ...product,
        title: title.trim(),
        price: formatPrice(amount),
        priceAmount: amount,
        state: condition,
        description: description.trim(),
      });
      onClose();
    } catch {
      setError("Changes could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal edit-listing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-listing-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
          <Icon name="close" />
        </button>
        <span className="eyebrow">Edit listing</span>
        <h2 id="edit-listing-title">{product.title}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Title
            <input
              ref={firstFieldRef}
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Price (€)
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label>
            Condition
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea
              rows={4}
              maxLength={DESCRIPTION_MAX}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
