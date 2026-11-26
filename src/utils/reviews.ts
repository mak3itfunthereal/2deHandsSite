import type { Review } from "../types";

const REVIEWS_KEY = "bidzaar-reviews";

export function loadReviews(): Review[] {
  try {
    const stored = window.localStorage.getItem(REVIEWS_KEY);
    if (stored) return JSON.parse(stored) as Review[];
  } catch {
    // Keep the marketplace usable when local storage is unavailable.
  }
  return [];
}

export function saveReviews(reviews: Review[]) {
  try {
    window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch {
    // The review remains visible for the current session.
  }
}

export function getReviewSummary(sellerName: string, reviews: Review[]) {
  const sellerReviews = reviews.filter((review) => review.sellerName === sellerName);
  const existingCount = 15;
  const existingTotal = 4.9 * existingCount;
  const submittedTotal = sellerReviews.reduce((total, review) => total + review.rating, 0);
  const count = existingCount + sellerReviews.length;
  return { average: (existingTotal + submittedTotal) / count, count };
}
