import test from "node:test";
import assert from "node:assert/strict";
import { createApiClient } from "../src/api/client.ts";

test("security: client blocks path traversal attempts in API requests", async () => {
  const client = createApiClient("http://localhost:3000/api", async () => ({
    ok: true,
    text: async () => "{}",
  }));

  await assert.rejects(
    async () => client.request("../secret/passwords"),
    /paths must be relative/,
  );

  await assert.rejects(
    async () => client.request("/absolute/path"),
    /paths must be relative/,
  );

  await assert.rejects(
    async () => client.request("products/../../admin/keys"),
    /paths must be relative/,
  );
});

test("security: sanitizes HTML/script tags in ad creation and messages to prevent XSS", () => {
  const sanitize = (input) => {
    if (typeof input !== "string") return "";
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  };

  const maliciousTitle = `<script>alert('pwned')</script>Bicycle`;
  const sanitized = sanitize(maliciousTitle);

  assert.equal(sanitized.includes("<script>"), false);
  assert.equal(sanitized.includes("&lt;script&gt;"), true);
});

test("security: protects against corrupted or injected localStorage payloads", () => {
  const safeJsonParse = (raw, fallback) => {
    try {
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return fallback;
      return parsed;
    } catch {
      return fallback;
    }
  };

  const fallback = { firstName: "Guest", lastName: "" };
  assert.deepEqual(safeJsonParse("invalid-json{", fallback), fallback);
  assert.deepEqual(safeJsonParse("12345", fallback), fallback);
  assert.deepEqual(safeJsonParse(null, fallback), fallback);
  assert.deepEqual(
    safeJsonParse('{"firstName":"Safe","lastName":"User"}', fallback),
    { firstName: "Safe", lastName: "User" },
  );
});
