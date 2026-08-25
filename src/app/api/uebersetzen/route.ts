import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { parseTranslationRequest } from "@/lib/translation-request";
import { translateCuratedText } from "@/lib/translator";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = parseTranslationRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const words = await prisma.word.findMany({
    select: {
      id: true,
      slug: true,
      koelsch: true,
      translation: true,
      aliases: true,
      meanings: {
        orderBy: { position: "asc" },
        select: { translation: true },
      },
      variants: {
        orderBy: { position: "asc" },
        select: { spelling: true },
      },
    },
    orderBy: { id: "asc" },
  });
  const result = translateCuratedText(parsed.text, words, parsed.direction);

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
