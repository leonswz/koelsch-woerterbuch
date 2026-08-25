import { NextResponse } from "next/server.js";

export function relativeRedirect(
  path: string,
  params: Record<string, string | undefined> = {},
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value);
  }
  const location = search.size ? `${path}?${search.toString()}` : path;
  return new NextResponse(null, {
    status: 303,
    headers: { location },
  });
}
