const STOP_WORDS = new Set([
  "aber",
  "als",
  "also",
  "am",
  "an",
  "auf",
  "aus",
  "bei",
  "das",
  "dem",
  "den",
  "der",
  "des",
  "die",
  "ein",
  "eine",
  "einer",
  "eines",
  "für",
  "im",
  "in",
  "ist",
  "mit",
  "oder",
  "und",
  "von",
  "vor",
  "wie",
  "zu",
  "zum",
  "zur",
]);

export type WordRelationSource = {
  id: number;
  koelsch: string;
  slug: string;
  translation: string;
  category: string;
  partOfSpeech?: string | null;
  notes?: string | null;
  aliases?: string[];
};

export type RelatedWord = Pick<
  WordRelationSource,
  "id" | "koelsch" | "slug" | "translation" | "category"
>;

export function relatedSearchTerms(translation: string): string[] {
  return [
    ...new Set(
      translation
        .toLocaleLowerCase("de-DE")
        .replace(/[^a-zäöüß0-9]+/gi, " ")
        .split(/\s+/)
        .filter((term) => term.length >= 3 && !STOP_WORDS.has(term)),
    ),
  ].slice(0, 6);
}

export function buildWordExplanation(word: WordRelationSource): string {
  const note = word.notes?.trim();
  if (note) return note;

  const base = `„${word.koelsch}“ bedeutet auf Hochdeutsch „${word.translation}“.`;
  const aliases = word.aliases?.filter(Boolean) ?? [];
  if (aliases.length === 1) {
    return `${base} Eine weitere Schreibweise ist „${aliases[0]}“.`;
  }
  if (aliases.length > 1) {
    return `${base} Weitere Schreibweisen sind ${aliases
      .map((alias) => `„${alias}“`)
      .join(", ")}.`;
  }
  return base;
}

function relationScore(current: WordRelationSource, candidate: RelatedWord) {
  const currentTranslation = current.translation
    .trim()
    .toLocaleLowerCase("de-DE");
  const candidateTranslation = candidate.translation
    .trim()
    .toLocaleLowerCase("de-DE");
  const currentTerms = new Set(relatedSearchTerms(current.translation));
  const candidateTerms = relatedSearchTerms(candidate.translation);
  const sharedTerms = candidateTerms.filter((term) => currentTerms.has(term)).length;
  const sameSpecificCategory =
    current.category !== "allgemein" && candidate.category === current.category;

  return (
    (candidateTranslation === currentTranslation ? 100 : 0) +
    sharedTerms * 20 +
    (sameSpecificCategory ? 5 : 0)
  );
}

export function rankRelatedWords(
  current: WordRelationSource,
  candidates: RelatedWord[],
  limit = 6,
): RelatedWord[] {
  const seen = new Set<string>();
  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => ({
      candidate,
      score: relationScore(current, candidate),
    }))
    .filter(({ candidate, score }) => score > 0 && !seen.has(candidate.slug))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.candidate.koelsch.localeCompare(right.candidate.koelsch, "de-DE"),
    )
    .filter(({ candidate }) => {
      if (seen.has(candidate.slug)) return false;
      seen.add(candidate.slug);
      return true;
    })
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => candidate);
}
