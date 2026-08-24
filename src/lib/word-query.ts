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

export function normalizePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
