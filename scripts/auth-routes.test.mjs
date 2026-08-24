import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server.js";

import { POST as createSession } from "../src/app/api/session/route.ts";
import { POST as deleteSession } from "../src/app/api/logout/route.ts";
import { createSessionToken } from "../src/lib/auth-session.ts";
import { proxy } from "../src/proxy.ts";

const config = {
  APP_USERNAME: "leon",
  APP_PASSWORD: "Richtig!123",
  SESSION_SECRET: "test-secret-with-at-least-thirty-two-characters",
};

function withAuthEnvironment(callback) {
  const previous = Object.fromEntries(
    Object.keys(config).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, config);
  return Promise.resolve(callback()).finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function formRequest(fields) {
  const body = new URLSearchParams(fields);
  return new NextRequest("https://koelsch.example/api/session", {
    method: "POST",
    body,
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
}

test("redirects protected pages to login while leaving the login page public", async () => {
  await withAuthEnvironment(async () => {
    const protectedResponse = await proxy(
      new NextRequest("https://koelsch.example/az?buchstabe=b"),
    );
    assert.equal(protectedResponse.status, 307);
    assert.equal(
      protectedResponse.headers.get("location"),
      "https://koelsch.example/login?next=%2Faz%3Fbuchstabe%3Db",
    );

    const publicResponse = await proxy(
      new NextRequest("https://koelsch.example/login"),
    );
    assert.equal(publicResponse.headers.get("x-middleware-next"), "1");
  });
});

test("accepts a valid signed cookie and rejects a session for another user", async () => {
  await withAuthEnvironment(async () => {
    const validToken = await createSessionToken({
      username: "leon",
      secret: config.SESSION_SECRET,
      maxAgeSeconds: 60,
    });
    const validRequest = new NextRequest("https://koelsch.example/az", {
      headers: { cookie: `koelsch_session=${validToken}` },
    });
    assert.equal(
      (await proxy(validRequest)).headers.get("x-middleware-next"),
      "1",
    );

    const otherToken = await createSessionToken({
      username: "other",
      secret: config.SESSION_SECRET,
      maxAgeSeconds: 60,
    });
    const otherRequest = new NextRequest("https://koelsch.example/az", {
      headers: { cookie: `koelsch_session=${otherToken}` },
    });
    assert.equal((await proxy(otherRequest)).status, 307);
  });
});

test("login POST sets the session cookie and redirects to a safe local path", async () => {
  await withAuthEnvironment(async () => {
    const response = await createSession(
      formRequest({
        username: "leon",
        password: "Richtig!123",
        next: "/az?buchstabe=k",
      }),
    );

    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get("location"),
      "https://koelsch.example/az?buchstabe=k",
    );
    const cookie = response.headers.get("set-cookie") ?? "";
    assert.match(cookie, /koelsch_session=/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=lax/i);
    assert.match(cookie, /Path=\//i);
  });
});

test("login POST rejects wrong credentials without setting a cookie", async () => {
  await withAuthEnvironment(async () => {
    const response = await createSession(
      formRequest({ username: "leon", password: "falsch", next: "/az" }),
    );

    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get("location"),
      "https://koelsch.example/login?error=1&next=%2Faz",
    );
    assert.equal(response.headers.get("set-cookie"), null);
  });
});

test("logout clears the session and returns to login", async () => {
  const response = await deleteSession(
    new NextRequest("https://koelsch.example/api/logout", { method: "POST" }),
  );

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://koelsch.example/login");
  const cookie = response.headers.get("set-cookie") ?? "";
  assert.match(cookie, /koelsch_session=/);
  assert.match(cookie, /Max-Age=0/i);
});
