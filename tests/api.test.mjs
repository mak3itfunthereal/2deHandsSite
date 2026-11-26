import test from "node:test";
import assert from "node:assert/strict";
import { createApiClient } from "../src/api/client.ts";

test("createApiClient formats product queries correctly", async () => {
  let requestedUrl = "";

  const mockFetch = async (url) => {
    requestedUrl = String(url);
    return {
      ok: true,
      text: async () => JSON.stringify([{ id: 1, title: "Test Product" }]),
    };
  };

  const client = createApiClient("http://localhost:3000/api", mockFetch);
  const products = await client.getProducts({ query: "fiets", category: "Fietsen" });

  assert.equal(products.length, 1);
  assert.equal(products[0].title, "Test Product");
  assert.ok(requestedUrl.includes("q=fiets"));
  assert.ok(requestedUrl.includes("category=Fietsen"));
});

test("createApiClient handles createProduct POST request", async () => {
  let method = "";
  let body = "";

  const mockFetch = async (url, options) => {
    method = options.method;
    body = options.body;
    return {
      ok: true,
      text: async () => JSON.stringify({ id: 99, title: "Nieuwe Fiets" }),
    };
  };

  const client = createApiClient("http://localhost:3000/api", mockFetch);
  const created = await client.createProduct({ title: "Nieuwe Fiets", price: "€ 100" });

  assert.equal(method, "POST");
  assert.equal(created.id, 99);
  assert.ok(body.includes("Nieuwe Fiets"));
});

test("deleteCurrentAccount sends an authenticated DELETE request with the leaving reason", async () => {
  let requestedUrl = "";
  let requestOptions;

  const client = createApiClient("http://localhost:3000/api", async (url, options) => {
    requestedUrl = String(url);
    requestOptions = options;
    return { ok: true, text: async () => "" };
  }, {
    getToken: () => "session-token",
    onUnauthorized: () => {},
  });

  await client.deleteCurrentAccount("Privacy reasons");

  assert.equal(requestedUrl, "http://localhost:3000/api/accounts/me");
  assert.equal(requestOptions.method, "DELETE");
  assert.equal(requestOptions.headers.get("Authorization"), "Bearer session-token");
  assert.deepEqual(JSON.parse(requestOptions.body), { reason: "Privacy reasons" });
});
