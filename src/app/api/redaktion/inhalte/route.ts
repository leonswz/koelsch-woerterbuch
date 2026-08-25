import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server.js";

import { SESSION_COOKIE } from "@/lib/auth-session";
import { editorFromToken } from "@/lib/editor-session";
import { relativeRedirect } from "@/lib/http-redirect";
import { prisma } from "@/lib/prisma";
import { slugifyWord } from "@/lib/word-editor";

function back(request: NextRequest, key: "saved" | "error", value: string) {
  void request;
  return relativeRedirect("/redaktion/inhalte", { [key]: value });
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function POST(request: NextRequest) {
  const editor = await editorFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!editor) return new Response("Nicht erlaubt", { status: 403 });
  const form = await request.formData();
  const kind = text(form, "kind");
  const id = Number(text(form, "id"));

  try {
    if (kind === "proverb") {
      const koelsch = text(form, "koelsch");
      const translation = text(form, "translation");
      const explanation = text(form, "explanation") || null;
      if (!koelsch || !translation) {
        return back(request, "error", "Sprichwort und Übersetzung sind Pflichtfelder.");
      }
      const data = { koelsch, translation, explanation };
      if (Number.isInteger(id) && id > 0) {
        await prisma.proverb.update({ where: { id }, data });
      } else {
        await prisma.proverb.create({ data });
      }
      return back(request, "saved", "Sprichwort gespeichert.");
    }

    if (kind === "song") {
      const title = text(form, "title");
      const artist = text(form, "artist");
      if (!title || !artist) {
        return back(request, "error", "Liedtitel und Interpret sind Pflichtfelder.");
      }
      const data = {
        title,
        artist,
        lyrics: text(form, "lyrics") || null,
        translation: text(form, "translation") || null,
        notes: text(form, "notes") || null,
        youtubeUrl: text(form, "youtubeUrl") || null,
      };
      if (Number.isInteger(id) && id > 0) {
        await prisma.song.update({ where: { id }, data });
      } else {
        let slug = slugifyWord(`${artist}-${title}`) || "neues-lied";
        const base = slug;
        let suffix = 2;
        while (await prisma.song.findUnique({ where: { slug }, select: { id: true } })) {
          slug = `${base}-${suffix++}`;
        }
        await prisma.song.create({ data: { ...data, slug } });
      }
      return back(request, "saved", "Lied gespeichert.");
    }

    return new Response("Ungültiger Inhaltstyp", { status: 400 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return back(request, "error", "Dieser Inhalt ist bereits vorhanden.");
    }
    throw error;
  }
}
