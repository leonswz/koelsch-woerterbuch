import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth-session";
import { editorFromToken } from "@/lib/editor-session";
import { prisma } from "@/lib/prisma";
import { parseWordEditorInput, slugifyWord } from "@/lib/word-editor";

function formValues(form: FormData) {
  const fields = [
    "koelsch",
    "translation",
    "notes",
    "aliases",
    "phonetic",
    "category",
    "partOfSpeech",
    "example",
    "exampleTranslation",
    "reviewStatus",
  ] as const;
  return Object.fromEntries(
    fields.map((field) => [field, String(form.get(field) ?? "")]),
  );
}

function formRedirect(request: NextRequest, path: string, message?: string) {
  const url = new URL(path, request.url);
  if (message) url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

async function availableSlug(koelsch: string) {
  const base = slugifyWord(koelsch) || "neuer-begriff";
  let slug = base;
  let suffix = 2;
  while (await prisma.word.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function POST(request: NextRequest) {
  const editor = await editorFromToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (!editor) return new Response("Nicht erlaubt", { status: 403 });

  const form = await request.formData();
  const idValue = String(form.get("id") ?? "").trim();
  const id = idValue ? Number(idValue) : null;
  const returnPath = id && Number.isInteger(id)
    ? `/redaktion/woerter/${id}`
    : "/redaktion/woerter/neu";
  const parsed = parseWordEditorInput(formValues(form));
  if (!parsed.ok) return formRedirect(request, returnPath, parsed.error);

  try {
    if (id && Number.isInteger(id) && id > 0) {
      const existing = await prisma.word.findUnique({ where: { id } });
      if (!existing) return new Response("Begriff nicht gefunden", { status: 404 });
      const updated = await prisma.word.update({
        where: { id },
        data: parsed.data,
        select: { slug: true },
      });
      return formRedirect(request, `/wort/${updated.slug}?saved=1`);
    }

    const created = await prisma.word.create({
      data: {
        ...parsed.data,
        slug: await availableSlug(parsed.data.koelsch),
        source: `Redaktion (${editor.username})`,
        uncertain: false,
      },
      select: { slug: true },
    });
    return formRedirect(request, `/wort/${created.slug}?created=1`);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return formRedirect(
        request,
        returnPath,
        "Dieser kölsche Begriff ist bereits vorhanden.",
      );
    }
    throw error;
  }
}
