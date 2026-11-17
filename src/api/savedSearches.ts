import { rawApiClient } from "./index";
import { searchKey, type SearchCriteria } from "../utils/search";

/**
 * Saved searches for email alerts (work item 523).
 *
 * The frontend only SENDS the saved search. The backend stores it and runs
 * the daily job that emails the user about new matching listings.
 *
 * Backend endpoints this file expects (agree on these with the backend team):
 *   GET    saved-searches        -> SavedSearch[]
 *   POST   saved-searches        -> body: SearchCriteria, returns SavedSearch
 *   DELETE saved-searches/{id}
 *
 * Until VITE_API_BASE_URL is set, everything is stored in localStorage (mock).
 */

export type SavedSearch = SearchCriteria & {
  id: string;
  createdAt: string;
};

const USE_BACKEND = Boolean(import.meta.env.VITE_API_BASE_URL);
const STORAGE_KEY = "bidzaar-saved-searches";

function readLocal(): SavedSearch[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedSearch[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: SavedSearch[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage blocked (private mode): nothing we can do in the mock.
  }
}

/** All saved searches of the current user. */
export async function getSavedSearches(): Promise<SavedSearch[]> {
  if (USE_BACKEND) {
    return rawApiClient.request<SavedSearch[]>("saved-searches", { method: "GET" });
  }
  return readLocal();
}

/** Save a search. If the same search is already saved, the existing one is returned. */
export async function saveSearch(criteria: SearchCriteria): Promise<SavedSearch> {
  if (USE_BACKEND) {
    return rawApiClient.request<SavedSearch>("saved-searches", {
      method: "POST",
      body: JSON.stringify(criteria),
    });
  }

  const list = readLocal();
  const existing = list.find((s) => searchKey(s) === searchKey(criteria));
  if (existing) return existing;

  const saved: SavedSearch = {
    ...criteria,
    id: `search-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeLocal([saved, ...list]);
  return saved;
}

/** Stop the email alerts for a saved search. */
export async function deleteSavedSearch(id: string): Promise<void> {
  if (USE_BACKEND) {
    await rawApiClient.request<void>(`saved-searches/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return;
  }
  writeLocal(readLocal().filter((s) => s.id !== id));
}
