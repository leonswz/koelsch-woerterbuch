import test from "node:test";
import assert from "node:assert/strict";

import {
  createSessionToken,
  credentialsMatch,
  safeRedirectPath,
  verifySessionToken,
} from "../src/lib/auth-session.ts";

const secret = "test-secret-with-enough-entropy-123456";
const now = new Date("2026-08-24T13:30:00.000Z");

test("accepts only the configured username and password", async () => {
  assert.equal(
    await credentialsMatch("leon", "richtig", {
      username: "leon",
      password: "richtig",
    }),
    true,
  );
  assert.equal(
    await credentialsMatch("leon", "falsch", {
      username: "leon",
      password: "richtig",
    }),
    false,
  );
  assert.equal(
    await credentialsMatch("jemand", "richtig", {
      username: "leon",
      password: "richtig",
    }),
    false,
  );
});

test("creates a signed session that expires after the configured duration", async () => {
  const token = await createSessionToken({
    username: "leon",
    secret,
    now,
    maxAgeSeconds: 60,
  });

  assert.deepEqual(
    await verifySessionToken(token, secret, new Date(now.getTime() + 30_000)),
    { username: "leon", expiresAt: now.getTime() + 60_000 },
  );
  assert.equal(
    await verifySessionToken(token, secret, new Date(now.getTime() + 61_000)),
    null,
  );
});

test("rejects altered and malformed session tokens", async () => {
  const token = await createSessionToken({
    username: "leon",
    secret,
    now,
    maxAgeSeconds: 60,
  });
  const altered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

  assert.equal(await verifySessionToken(altered, secret, now), null);
  assert.equal(await verifySessionToken("kaputt", secret, now), null);
  assert.equal(await verifySessionToken(".", secret, now), null);
});

test("allows only local post-login redirect paths", () => {
  assert.equal(safeRedirectPath("/az?buchstabe=b"), "/az?buchstabe=b");
  assert.equal(safeRedirectPath("https://example.com"), "/");
  assert.equal(safeRedirectPath("//example.com"), "/");
  assert.equal(safeRedirectPath("login"), "/");
  assert.equal(safeRedirectPath("/login"), "/");
  assert.equal(safeRedirectPath(null), "/");
});
