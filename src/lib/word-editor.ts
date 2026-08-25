import type { GrammaticalGender } from "./word-metadata.ts";

export type WordMeaningEditorData = {
  translation: string;
  definition: string | null;
  partOfSpeech: string | null;
  register: string | null;
  example: string | null;
  exampleTranslation: string | null;
};

export type WordVariantEditorData = {
  spelling: string;
  label: string | null;
  region: string | null;
};

export type WordEditorData = {
  koelsch: string;
  translation: string;
  notes: string | null;
  aliases: string[];
  phonetic: string | null;
  category: string;
  grammaticalGender: GrammaticalGender | null;
  article: string | null;
  plural: string | null;
  partOfSpeech: string | null;
  example: string | null;
  exampleTranslation: string | null;
  reviewStatus: "draft" | "published";
  meanings: WordMeaningEditorData[];
  variants: WordVariantEditorData[];
};

export type WordEditorInput = Record<string, string | string[] | undefined>;

function values(value: string | string[] | undefined) {
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}

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
  const koelsch = String(input.koelsch ?? "").trim();
  const legacyTranslation = String(input.translation ?? "").trim();
  const meaningFields = [
    values(input.meaningTranslation),
    values(input.meaningDefinition),
    values(input.meaningPartOfSpeech),
    values(input.meaningRegister),
    values(input.meaningExample),
    values(input.meaningExampleTranslation),
  ];
  const meaningCount = Math.max(0, ...meaningFields.map((field) => field.length));
  const meanings = Array.from({ length: meaningCount }, (_, index) => ({
    translation: meaningFields[0][index]?.trim() ?? "",
    definition: optional(meaningFields[1][index]),
    partOfSpeech: optional(meaningFields[2][index]),
    register: optional(meaningFields[3][index]),
    example: optional(meaningFields[4][index]),
    exampleTranslation: optional(meaningFields[5][index]),
  }));

  if (
    meanings.some(
      (meaning) =>
        !meaning.translation &&
        Boolean(
          meaning.definition ||
            meaning.partOfSpeech ||
            meaning.register ||
            meaning.example ||
            meaning.exampleTranslation,
        ),
    )
  ) {
    return {
      ok: false,
      error: "Jede ausgefüllte Bedeutung braucht eine hochdeutsche Übersetzung.",
    };
  }

  const populatedMeanings = meanings.filter((meaning) => meaning.translation);
  const translation = populatedMeanings.length
    ? populatedMeanings.map((meaning) => meaning.translation).join("; ")
    : legacyTranslation;
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
  if (populatedMeanings.some((meaning) => meaning.translation.length > 500)) {
    return { ok: false, error: "Eine Bedeutung ist zu lang." };
  }

  const notes = optional(String(input.notes ?? ""));
  if (notes && notes.length > 2_000) {
    return {
      ok: false,
      error: "Die Erklärung darf höchstens 2.000 Zeichen lang sein.",
    };
  }

  const aliases = [
    ...new Set(
      String(input.aliases ?? "")
        .split(/[,\n]/)
        .map((alias) => alias.trim())
        .filter(Boolean),
    ),
  ];

  const variantSpellings = values(input.variantSpelling);
  const variantLabels = values(input.variantLabel);
  const variantRegions = values(input.variantRegion);
  const seenVariants = new Set<string>();
  const variants = variantSpellings.flatMap((spelling, index) => {
    const normalized = spelling.trim();
    const key = normalized.toLocaleLowerCase("de-DE");
    if (!normalized || key === koelsch.toLocaleLowerCase("de-DE") || seenVariants.has(key)) {
      return [];
    }
    seenVariants.add(key);
    return [
      {
        spelling: normalized,
        label: optional(variantLabels[index]),
        region: optional(variantRegions[index]),
      },
    ];
  });
  const structuredVariants = variants.length
    ? variants
    : aliases.flatMap((spelling) =>
        spelling.toLocaleLowerCase("de-DE") === koelsch.toLocaleLowerCase("de-DE")
          ? []
          : [{ spelling, label: null, region: null }],
      );
  const structuredMeanings = populatedMeanings.length
    ? populatedMeanings
    : [
        {
          translation,
          definition: null,
          partOfSpeech: optional(String(input.partOfSpeech ?? "")),
          register: null,
          example: optional(String(input.example ?? "")),
          exampleTranslation: optional(String(input.exampleTranslation ?? "")),
        },
      ];
  const genderValue = String(input.grammaticalGender ?? "");
  const grammaticalGender = ["masculine", "feminine", "neuter"].includes(genderValue)
    ? (genderValue as GrammaticalGender)
    : null;

  return {
    ok: true,
    data: {
      koelsch,
      translation,
      notes,
      aliases: structuredVariants.map((variant) => variant.spelling),
      phonetic: optional(String(input.phonetic ?? "")),
      category:
        String(input.category ?? "").trim().toLocaleLowerCase("de-DE") || "allgemein",
      grammaticalGender,
      article: optional(String(input.article ?? "")),
      plural: optional(String(input.plural ?? "")),
      partOfSpeech:
        structuredMeanings[0]?.partOfSpeech ?? optional(String(input.partOfSpeech ?? "")),
      example: structuredMeanings[0]?.example ?? optional(String(input.example ?? "")),
      exampleTranslation:
        structuredMeanings[0]?.exampleTranslation ??
        optional(String(input.exampleTranslation ?? "")),
      reviewStatus: input.reviewStatus === "published" ? "published" : "draft",
      meanings: structuredMeanings,
      variants: structuredVariants,
    },
  };
}
