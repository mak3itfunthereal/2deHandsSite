import type { Product } from "../types";

/**
 * Search helpers shared by the search page and the mock API.
 * Keeping the matching rules in ONE place means the page and the fake backend
 * always agree, and we can delete the mock version once the real API is ready.
 */

/** Lowercase, trim and remove accents, so "Café" matches "cafe". */
export function normalizeText(value: string | undefined | null): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Split a search query into separate words, ignoring extra spaces. */
export function splitWords(query: string): string[] {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

/**
 * True when EVERY word of the query appears in the product's
 * title or description (category and city are searched too, as a bonus).
 * An empty query matches everything.
 *
 * Example: "red bike" matches "Red city bike" but not "Blue bike".
 */
export function matchesQuery(
  product: Pick<Product, "title" | "description" | "category" | "city">,
  query: string,
): boolean {
  const words = splitWords(query);
  if (words.length === 0) return true;

  const searchable = normalizeText(
    [product.title, product.description, product.category, product.city].join(" "),
  );
  return words.every((word) => searchable.includes(word));
}

/** The filters of a search that a user can save for email alerts (work item 523). */
export type SearchCriteria = {
  query: string;
  category: string;
  condition: string;
  maxPrice: number | null;
  shippingOnly: boolean;
  protectionOnly: boolean;
  city: string;
  radius: number;
};

/**
 * A short text that is the same for two searches with the same filters.
 * Used to check if the current search is already saved.
 * Word order and capitals don't matter: "Red Bike" and "bike red" give the same key.
 */
export function searchKey(criteria: SearchCriteria): string {
  return JSON.stringify([
    splitWords(criteria.query).sort().join(" "),
    normalizeText(criteria.category),
    normalizeText(criteria.condition),
    criteria.maxPrice ?? null,
    criteria.shippingOnly,
    criteria.protectionOnly,
    normalizeText(criteria.city),
    criteria.radius,
  ]);
}

/** True when no category is chosen, or the product is in the chosen category. */
export function matchesCategory(product: Pick<Product, "category">, category: string): boolean {
  if (!category) return true;
  return normalizeText(product.category) === normalizeText(category);
}
