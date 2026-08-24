import { NextResponse, type NextRequest } from "next/server.js";

import {
  SESSION_COOKIE,
  verifySessionToken,
} from "./lib/auth-session.ts";

const PUBLIC_PATHS = new Set(["/login", "/api/session"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/images/")) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET ?? "";
  const username = process.env.APP_USERNAME ?? "";
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token, secret);

  if (session?.username === username && username) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts/).*)",
  ],
};
