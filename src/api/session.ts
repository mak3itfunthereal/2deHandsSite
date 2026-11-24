import type { AuthSession } from "../types";

export const SESSION_KEY = "bidzaar-session";

export function getStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session: unknown = JSON.parse(raw);
    if (
      typeof session === "object" &&
      session !== null &&
      "token" in session &&
      typeof session.token === "string" &&
      session.token.length > 0 &&
      "expiresAt" in session &&
      typeof session.expiresAt === "string" &&
      Number.isFinite(Date.parse(session.expiresAt)) &&
      Date.parse(session.expiresAt) > Date.now()
    ) {
      return { token: session.token, expiresAt: session.expiresAt };
    }
  } catch {
    // Invalid cached sessions cannot be used for authentication.
  }
  window.localStorage.removeItem(SESSION_KEY);
  return null;
}

export function saveSession(session: AuthSession) {
  if (!session.token || !Number.isFinite(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= Date.now()) {
    throw new Error("The API returned an invalid or expired session.");
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
