import { NextRequest } from "next/server";

import { normalizeSearchQuery } from "@/lib/word-query";
import { suggestWords } from "@/lib/words";

export async function GET(request: NextRequest) {
  const query = normalizeSearchQuery(request.nextUrl.searchParams.get("q") ?? undefined).slice(
    0,
    80,
  );
  const suggestions = await suggestWords(query);

  return Response.json(
    { suggestions },
    {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    },
  );
}
