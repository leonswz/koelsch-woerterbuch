import { NextResponse, type NextRequest } from "next/server.js";

import { SESSION_COOKIE } from "../../../lib/auth-session.ts";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
