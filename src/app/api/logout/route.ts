import { NextResponse } from "next/server.js";

import { SESSION_COOKIE } from "../../../lib/auth-session.ts";

export async function POST() {
  const response = new NextResponse(null, {
    status: 303,
    headers: { location: "/login" },
  });
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
