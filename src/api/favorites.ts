/**
 * Favorites (wishlist) storage - work item 510.
 *
 * For now favorites are saved in the browser (localStorage).
 * When the backend is ready, only THIS file needs to change:
 * load from GET /favorites and save with POST/DELETE /favorites/{id}.
 */

const FAVORITES_KEY = "bidzaar-favorites";

/** Read the saved favorite ad ids. Returns an empty list if nothing is saved. */
export function loadFavorites(): number[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number") : [];
  } catch {
    return [];
  }
}

/** Save the favorite ad ids. */
export function saveFavorites(ids: Iterable<number>): void {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Storage can be blocked (private mode). The app still works, it just won't remember.
  }
}
