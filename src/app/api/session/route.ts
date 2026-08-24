import { NextResponse, type NextRequest } from "next/server.js";

import {
  createSessionToken,
  credentialsMatch,
  safeRedirectPath,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "../../../lib/auth-session.ts";

function authEnvironment() {
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!username || !password || !secret || secret.length < 32) return null;
  return { username, password, secret };
}

function relativeRedirect(location: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { location },
  });
}

export async function POST(request: NextRequest) {
  const configured = authEnvironment();
  if (!configured) {
    return new Response("Anmeldung ist noch nicht konfiguriert.", { status: 503 });
  }

  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const destination = safeRedirectPath(String(form.get("next") ?? "/"));
  const valid = await credentialsMatch(username, password, configured);

  if (!valid) {
    const params = new URLSearchParams({ error: "1" });
    if (destination !== "/") params.set("next", destination);
    return relativeRedirect(`/login?${params.toString()}`);
  }

  const token = await createSessionToken({
    username: configured.username,
    secret: configured.secret,
    maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
  });
  const response = relativeRedirect(destination);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
