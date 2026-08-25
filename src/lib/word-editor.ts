export type WordEditorData = {
  koelsch: string;
  translation: string;
  notes: string | null;
  aliases: string[];
  phonetic: string | null;
  category: string;
  partOfSpeech: string | null;
  example: string | null;
  exampleTranslation: string | null;
  reviewStatus: "draft" | "published";
};

export type WordEditorInput = Record<string, string | undefined>;

function optional(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized || null;
}

export function isEditorUsername(
  username: string | null | undefined,
  editorUsername = "leon",
) {
  return username?.trim().toLocaleLowerCase("de-DE") ===
    editorUsername.trim().toLocaleLowerCase("de-DE");
}

export function slugifyWord(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseWordEditorInput(
  input: WordEditorInput,
): { ok: true; data: WordEditorData } | { ok: false; error: string } {
  const koelsch = input.koelsch?.trim() ?? "";
  const translation = input.translation?.trim() ?? "";
  if (!koelsch || !translation) {
    return {
      ok: false,
      error: "Kölscher Begriff und hochdeutsche Übersetzung sind Pflichtfelder.",
    };
  }
  if (koelsch.length > 120 || translation.length > 500) {
    return {
      ok: false,
      error: "Begriff oder Übersetzung ist zu lang.",
    };
  }

  const notes = optional(input.notes);
  if (notes && notes.length > 2_000) {
    return {
      ok: false,
      error: "Die Erklärung darf höchstens 2.000 Zeichen lang sein.",
    };
  }

  const aliases = [
    ...new Set(
      (input.aliases ?? "")
        .split(/[,\n]/)
        .map((alias) => alias.trim())
        .filter(Boolean),
    ),
  ];

  return {
    ok: true,
    data: {
      koelsch,
      translation,
      notes,
      aliases,
      phonetic: optional(input.phonetic),
      category:
        input.category?.trim().toLocaleLowerCase("de-DE") || "allgemein",
      partOfSpeech: optional(input.partOfSpeech),
      example: optional(input.example),
      exampleTranslation: optional(input.exampleTranslation),
      reviewStatus: input.reviewStatus === "published" ? "published" : "draft",
    },
  };
}
