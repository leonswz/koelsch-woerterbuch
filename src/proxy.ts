import { NextResponse, type NextRequest } from "next/server.js";

import { accountIsConfigured, authEnvironment } from "./lib/auth-config.ts";
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

  const configured = authEnvironment();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token, configured?.secret ?? "");

  if (
    configured &&
    session &&
    accountIsConfigured(session.username, configured.accounts)
  ) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts/).*)",
  ],
};
