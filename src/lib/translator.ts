import { splitWordMeanings } from "./word-meanings.ts";
import { translationGrammarRules } from "./translation-grammar.ts";

export type TranslationDirection = "de-koelsch" | "koelsch-de";

export type TranslationWord = {
  id: number;
  slug: string;
  koelsch: string;
  translation: string;
  aliases: string[];
  meanings?: Array<{ translation: string }>;
  variants?: Array<{ spelling: string }>;
};

export type TranslationMatch = {
  source: string;
  target: string;
  slug: string | null;
  kind: "dictionary" | "grammar";
  alternatives?: string[];
};

export type TranslationResult = {
  text: string;
  matches: TranslationMatch[];
  unmatchedWords: number;
  status: "dictionary" | "rule-based" | "partial";
  rulesApplied: string[];
};

type Candidate = {
  target: string;
  slug: string | null;
  alternatives: string[];
  kind: "dictionary" | "grammar";
  ruleLabel?: string;
};
type Token = { raw: string; word: boolean };

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function unique(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function structuredMeanings(word: TranslationWord) {
  return unique(word.meanings?.map((meaning) => meaning.translation) ?? []);
}

function sourceForms(word: TranslationWord, direction: TranslationDirection) {
  if (direction === "koelsch-de") {
    return unique([
      word.koelsch,
      ...(word.variants?.map((variant) => variant.spelling) ?? []),
      ...word.aliases,
    ]);
  }
  const meanings = structuredMeanings(word);
  return meanings.length
    ? meanings
    : unique([word.translation, ...splitWordMeanings(word.translation)]);
}

function candidateFor(word: TranslationWord, direction: TranslationDirection): Candidate {
  if (direction === "de-koelsch") {
    return {
      target: word.koelsch,
      slug: word.slug,
      alternatives: [],
      kind: "dictionary",
    };
  }
  const meanings = structuredMeanings(word);
  const targets = meanings.length ? meanings : [word.translation];
  return {
    target: targets[0],
    slug: word.slug,
    alternatives: targets.slice(1),
    kind: "dictionary",
  };
}

function dictionaryMap(words: TranslationWord[], direction: TranslationDirection) {
  const map = new Map<string, Candidate[]>();
  let maxWords = 1;
  for (const word of words) {
    const candidate = candidateFor(word, direction);
    for (const form of sourceForms(word, direction)) {
      const key = normalize(form);
      if (!key) continue;
      const candidates = map.get(key) ?? [];
      if (!candidates.some((entry) => normalize(entry.target) === normalize(candidate.target))) {
        candidates.push(candidate);
      }
      map.set(key, candidates);
      maxWords = Math.max(maxWords, key.split(" ").length);
    }
  }
  for (const rule of translationGrammarRules(direction)) {
    const key = normalize(rule.source);
    if (!key || map.has(key)) continue;
    map.set(key, [
      {
        target: rule.target,
        slug: null,
        alternatives: [],
        kind: "grammar",
        ruleLabel: rule.label,
      },
    ]);
    maxWords = Math.max(maxWords, key.split(" ").length);
  }
  return { map, maxWords: Math.min(maxWords, 8) };
}

function applySourceCasing(source: string, target: string) {
  if (!/^\p{Lu}/u.test(source) || !target) return target;
  return `${target[0].toLocaleUpperCase("de-DE")}${target.slice(1)}`;
}

function tokensFor(text: string): Token[] {
  return (text.match(/[\p{L}\p{N}'’]+|[^\p{L}\p{N}'’]+/gu) ?? []).map(
    (raw) => ({ raw, word: /^[\p{L}\p{N}'’]+$/u.test(raw) }),
  );
}

export function translateCuratedText(
  text: string,
  words: TranslationWord[],
  direction: TranslationDirection,
): TranslationResult {
  const tokens = tokensFor(text);
  const { map, maxWords } = dictionaryMap(words, direction);
  const output: string[] = [];
  const matches: TranslationMatch[] = [];
  const rulesApplied: string[] = [];
  let unmatchedWords = 0;
  let index = 0;

  while (index < tokens.length) {
    if (!tokens[index].word) {
      output.push(tokens[index].raw);
      index += 1;
      continue;
    }

    const spans: Array<{ end: number; source: string; key: string }> = [];
    let cursor = index;
    let count = 0;
    while (cursor < tokens.length && count < maxWords) {
      if (tokens[cursor].word) {
        count += 1;
        spans.push({
          end: cursor,
          source: tokens.slice(index, cursor + 1).map((token) => token.raw).join(""),
          key: normalize(
            tokens
              .slice(index, cursor + 1)
              .filter((token) => token.word)
              .map((token) => token.raw)
              .join(" "),
          ),
        });
      }
      cursor += 1;
    }

    const match = spans.reverse().find((span) => map.has(span.key));
    if (match) {
      const candidates = map.get(match.key)!;
      const candidate = candidates[0];
      const alternatives = unique([
        ...candidate.alternatives,
        ...candidates.slice(1).flatMap((entry) => [entry.target, ...entry.alternatives]),
      ]).filter((value) => normalize(value) !== normalize(candidate.target));
      const target = applySourceCasing(match.source.trim(), candidate.target);
      output.push(target);
      matches.push({
        source: match.source.trim(),
        target,
        slug: candidate.slug,
        kind: candidate.kind,
        ...(alternatives.length ? { alternatives } : {}),
      });
      if (candidate.ruleLabel && !rulesApplied.includes(candidate.ruleLabel)) {
        rulesApplied.push(candidate.ruleLabel);
      }
      index = match.end + 1;
    } else {
      output.push(tokens[index].raw);
      unmatchedWords += 1;
      index += 1;
    }
  }

  const status = unmatchedWords
    ? "partial"
    : rulesApplied.length
      ? "rule-based"
      : "dictionary";

  return { text: output.join(""), matches, unmatchedWords, status, rulesApplied };
}
