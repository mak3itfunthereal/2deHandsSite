import test from "node:test";
import assert from "node:assert/strict";
import { createApiClient } from "../src/api/client.ts";

test("health check endpoint reports status Healthy and server details", async () => {
  let requestedUrl = "";

  const mockFetch = async (url) => {
    requestedUrl = String(url);
    return {
      ok: true,
      text: async () =>
        JSON.stringify({
          status: "Healthy",
          server: "Online",
          timestamp: new Date().toISOString(),
          uptime: "0d 01h 23m 45s",
          uptimeSeconds: 5025,
          version: "1.0.0",
          checks: [
            { name: "server", status: "Healthy" },
            { name: "database", status: "Healthy" },
            { name: "storage", status: "Healthy" },
          ],
        }),
    };
  };

  const client = createApiClient("http://localhost:3000/api", mockFetch);
  const health = await client.checkHealth();

  assert.ok(requestedUrl.endsWith("/health"));
  assert.equal(health.status, "Healthy");
  assert.equal(health.server, "Online");
  assert.equal(health.version, "1.0.0");
  assert.ok(health.checks.length >= 2);
  assert.equal(health.checks[0].status, "Healthy");
});

test("health check reports failure cleanly if server is down", async () => {
  const mockFailingFetch = async () => {
    return {
      ok: false,
      status: 503,
      text: async () => JSON.stringify({ status: "Unhealthy", error: "Service unavailable" }),
    };
  };

  const client = createApiClient("http://localhost:3000/api", mockFailingFetch);

  await assert.rejects(async () => {
    await client.checkHealth();
  }, /status 503/);
});
