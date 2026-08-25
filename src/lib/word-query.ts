const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function normalizeLetter(value: string | undefined): string | null {
  const normalized = value?.trim().toLocaleUpperCase("de-DE") ?? "";
  if (normalized.length !== 1) return null;
  const base = normalized.replace("Ä", "A").replace("Ö", "O").replace("Ü", "U");
  return LETTERS.includes(base) ? base : null;
}

export function letterPrefixes(letter: string): string[] {
  const base = normalizeLetter(letter);
  if (!base) return [];
  const prefixes = [base.toLocaleLowerCase("de-DE")];
  if (base === "A") prefixes.push("ä");
  if (base === "O") prefixes.push("ö");
  if (base === "U") prefixes.push("ü");
  return prefixes;
}

export function normalizeSearchQuery(value: string | undefined): string {
  return value?.trim() ?? "";
}

export type WordSuggestion = {
  id: number;
  koelsch: string;
  slug: string;
  translation: string;
  meanings?: Array<{ translation: string }>;
  variants?: Array<{ spelling: string }>;
};

function normalizedValues(values: string[]) {
  return values.map((value) => value.toLocaleLowerCase("de-DE"));
}

function any(values: string[], predicate: (value: string) => boolean) {
  return values.some(predicate);
}

function suggestionScore(word: WordSuggestion, query: string) {
  const koelsch = word.koelsch.toLocaleLowerCase("de-DE");
  const variants = normalizedValues(word.variants?.map((variant) => variant.spelling) ?? []);
  const meanings = normalizedValues([
    word.translation,
    ...(word.meanings?.map((meaning) => meaning.translation) ?? []),
  ]);

  if (koelsch === query) return 0;
  if (any(variants, (value) => value === query)) return 1;
  if (koelsch.startsWith(query)) return 2;
  if (any(variants, (value) => value.startsWith(query))) return 3;
  if (any(meanings, (value) => value === query)) return 4;
  if (any(meanings, (value) => value.startsWith(query))) return 5;
  if (koelsch.includes(query)) return 6;
  if (any(variants, (value) => value.includes(query))) return 7;
  if (any(meanings, (value) => value.includes(query))) return 8;
  return Number.POSITIVE_INFINITY;
}

export function rankWordSuggestions(
  words: WordSuggestion[],
  value: string,
  limit = 6,
) {
  const query = normalizeSearchQuery(value).toLocaleLowerCase("de-DE");
  if (!query || limit < 1) return [];

  const seen = new Set<string>();
  return [...words]
    .filter((word) => Number.isFinite(suggestionScore(word, query)))
    .sort((left, right) => {
      const scoreDifference =
        suggestionScore(left, query) - suggestionScore(right, query);
      if (scoreDifference) return scoreDifference;
      return left.koelsch.localeCompare(right.koelsch, "de-DE");
    })
    .filter((word) => {
      if (seen.has(word.slug)) return false;
      seen.add(word.slug);
      return true;
    })
    .slice(0, limit);
}

export function normalizePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
