/**
 * Rules for the "post an ad" form (seller story: step-by-step form).
 * Kept outside the page so they are easy to test and to reuse when editing an ad.
 */

export const MAX_PHOTOS = 10;
export const TITLE_MIN = 3;
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 2000;
export const PRICE_MAX = 100000;

export type Delivery = "pickup" | "shipping" | "both";

export type SellFormData = {
  photos: string[];
  title: string;
  category: string;
  description: string;
  condition: string;
  price: string;
  allowOffers: boolean;
  delivery: Delivery;
};

export const emptySellForm: SellFormData = {
  photos: [],
  title: "",
  category: "",
  description: "",
  condition: "",
  price: "",
  allowOffers: true,
  delivery: "pickup",
};

export type SellFormErrors = Partial<Record<keyof SellFormData, string>>;

/**
 * Turn what the user typed into a number.
 * Accepts "25", "25.50" and the Dutch style "25,50". Returns null when it is not a valid price.
 */
export function parsePrice(value: string): number | null {
  const cleaned = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** 25 -> "€ 25", 25.5 -> "€ 25.50" */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `€ ${amount}` : `€ ${amount.toFixed(2)}`;
}

/** Check one step of the form. Returns an empty object when the step is OK. */
export function validateStep(step: number, data: SellFormData): SellFormErrors {
  const errors: SellFormErrors = {};

  if (step === 1) {
    if (data.photos.length === 0) errors.photos = "Add at least one photo.";
  }

  if (step === 2) {
    const title = data.title.trim();
    if (title.length < TITLE_MIN) errors.title = `Title needs at least ${TITLE_MIN} characters.`;
    else if (title.length > TITLE_MAX) errors.title = `Title can have at most ${TITLE_MAX} characters.`;
    if (!data.category) errors.category = "Choose a category.";
    if (!data.condition) errors.condition = "Choose the condition.";
    if (data.description.length > DESCRIPTION_MAX)
      errors.description = `Description can have at most ${DESCRIPTION_MAX} characters.`;
  }

  if (step === 3) {
    const amount = parsePrice(data.price);
    if (data.price.trim() === "") errors.price = "Enter a price.";
    else if (amount === null) errors.price = "Enter a valid price, for example 25 or 25.50.";
    else if (amount <= 0) errors.price = "Price must be more than € 0.";
    else if (amount > PRICE_MAX) errors.price = `Price can be at most ${formatPrice(PRICE_MAX)}.`;
  }

  return errors;
}

/** Check all steps at once (used right before publishing). Returns the first step with an error, or null. */
export function firstInvalidStep(data: SellFormData): number | null {
  for (const step of [1, 2, 3, 4]) {
    if (Object.keys(validateStep(step, data)).length > 0) return step;
  }
  return null;
}
