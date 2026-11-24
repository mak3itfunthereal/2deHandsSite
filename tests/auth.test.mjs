import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, createApiClient } from "../src/api/client.ts";
import { clearSession, getStoredSession, saveSession } from "../src/api/session.ts";

test("account requests use the documented paths, bodies and bearer token", async () => {
  const calls = [];
  const client = createApiClient("/api", async (url, options) => {
    calls.push({ url, options });
    const body = url.endsWith("/accounts/me")
      ? { id: 1, username: "buyer", email: "buyer@example.test", isVerified: true, createdAt: "2024-01-01T00:00:00Z", role: "user" }
      : {};
    return { ok: true, text: async () => JSON.stringify(body) };
  }, { getToken: () => "stored-token", onUnauthorized: () => {} });

  await client.register("buyer", "buyer@example.test", "password123");
  await client.login("buyer@example.test", "password123");
  await client.getCurrentAccount("new-token");
  await client.forgotPassword("buyer@example.test");
  await client.resetPassword("reset-token", "newpassword");
  await client.deleteProduct(42);

  assert.deepEqual(calls.map(({ url }) => url), [
    "/api/accounts/register", "/api/accounts/login", "/api/accounts/me",
    "/api/accounts/forgot-password", "/api/accounts/reset-password", "/api/products/42",
  ]);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    username: "buyer", email: "buyer@example.test", password: "password123",
  });
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    email: "buyer@example.test", password: "password123",
  });
  assert.equal(calls[1].options.headers.get("Authorization"), null);
  assert.equal(calls[2].options.headers.get("Authorization"), "Bearer new-token");
  assert.deepEqual(JSON.parse(calls[3].options.body), { email: "buyer@example.test" });
  assert.equal(calls[3].options.headers.get("Authorization"), null);
  assert.deepEqual(JSON.parse(calls[4].options.body), {
    token: "reset-token", newPassword: "newpassword",
  });
  assert.equal(calls[5].options.headers.get("Authorization"), "Bearer stored-token");
});

test("an invalid account response cannot establish a session", async () => {
  const client = createApiClient("/api", async () => ({ ok: true, text: async () => "{}" }));
  await assert.rejects(client.getCurrentAccount("token"), /invalid account/);
});

test("a 401 reports the token actually sent; other errors do not invalidate sessions", async () => {
  const invalidated = [];
  let status = 401;
  const client = createApiClient("/api", async () => ({
    ok: false, status, text: async () => "error",
  }), { getToken: () => "old-token", onUnauthorized: (token) => invalidated.push(token) });

  await assert.rejects(client.getCurrentAccount("new-token"), (err) => err instanceof ApiError && err.status === 401);
  assert.deepEqual(invalidated, ["new-token"]);
  status = 403;
  await assert.rejects(client.deleteProduct(1), (err) => err instanceof ApiError && err.status === 403);
  assert.deepEqual(invalidated, ["new-token"]);
});

test("sessions persist until cleared or expired and malformed values are rejected", () => {
  const values = new Map();
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } };
  try {
    const session = { token: "abc", expiresAt: new Date(Date.now() + 60_000).toISOString() };
    saveSession(session);
    assert.deepEqual(getStoredSession(), session);
    clearSession();
    assert.equal(getStoredSession(), null);
    values.set("bidzaar-session", JSON.stringify({ token: "abc", expiresAt: "2000-01-01T00:00:00Z" }));
    assert.equal(getStoredSession(), null);
    assert.equal(values.has("bidzaar-session"), false);
    values.set("bidzaar-session", "not-json");
    assert.equal(getStoredSession(), null);
    assert.throws(() => saveSession({ token: "", expiresAt: session.expiresAt }));
  } finally {
    globalThis.window = previousWindow;
  }
});
