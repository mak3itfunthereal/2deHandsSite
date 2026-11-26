import type { SellFormData } from "../utils/sellForm";

/**
 * Draft listings (seller dashboard: "Drafts" tab).
 * A draft is an unfinished sell form the seller can continue later.
 *
 * For now drafts live in localStorage. When the backend supports drafts,
 * only this file has to change (e.g. GET/POST/DELETE /drafts).
 */

export type Draft = {
  id: string;
  updatedAt: string; // ISO date
  data: SellFormData;
};

const DRAFTS_KEY = "bidzaar-drafts";

function read(): Draft[] {
  try {
    const raw = window.localStorage.getItem(DRAFTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Draft[]) : [];
  } catch {
    return [];
  }
}

function write(drafts: Draft[]): boolean {
  try {
    window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return true;
  } catch {
    // Usually "storage full" because of photos.
    return false;
  }
}

/** All drafts, newest first. */
export function getDrafts(): Draft[] {
  return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getDraft(id: string): Draft | undefined {
  return read().find((d) => d.id === id);
}

/**
 * Save a new draft, or update it when `id` is given.
 * Returns the saved draft, or null when the browser storage is full.
 */
export function saveDraft(data: SellFormData, id?: string): Draft | null {
  const draft: Draft = {
    id: id ?? `draft-${Date.now()}`,
    updatedAt: new Date().toISOString(),
    data,
  };
  const others = read().filter((d) => d.id !== draft.id);
  return write([draft, ...others]) ? draft : null;
}

export function deleteDraft(id: string): void {
  write(read().filter((d) => d.id !== id));
}
