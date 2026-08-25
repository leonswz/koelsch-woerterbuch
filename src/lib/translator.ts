import { splitWordMeanings } from "./word-meanings.ts";

export type TranslationDirection = "de-koelsch" | "koelsch-de";

export type TranslationWord = {
  id: number;
  slug: string;
  koelsch: string;
  translation: string;
  aliases: string[];
};

export type TranslationMatch = {
  source: string;
  target: string;
  slug: string;
};

export type TranslationResult = {
  text: string;
  matches: TranslationMatch[];
  unmatchedWords: number;
};

type Candidate = { target: string; slug: string };
type Token = { raw: string; word: boolean };

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function sourceForms(word: TranslationWord, direction: TranslationDirection) {
  if (direction === "koelsch-de") return [word.koelsch, ...word.aliases];
  return [word.translation, ...splitWordMeanings(word.translation)];
}

function dictionaryMap(words: TranslationWord[], direction: TranslationDirection) {
  const map = new Map<string, Candidate>();
  let maxWords = 1;
  for (const word of words) {
    const target = direction === "de-koelsch" ? word.koelsch : word.translation;
    for (const form of sourceForms(word, direction)) {
      const key = normalize(form);
      if (!key || map.has(key)) continue;
      map.set(key, { target, slug: word.slug });
      maxWords = Math.max(maxWords, key.split(" ").length);
    }
  }
  return { map, maxWords: Math.min(maxWords, 8) };
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
) {
  const tokens = tokensFor(text);
  const { map, maxWords } = dictionaryMap(words, direction);
  const output: string[] = [];
  const matches: TranslationMatch[] = [];
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
      const candidate = map.get(match.key)!;
      output.push(candidate.target);
      matches.push({
        source: match.source.trim(),
        target: candidate.target,
        slug: candidate.slug,
      });
      index = match.end + 1;
    } else {
      output.push(tokens[index].raw);
      unmatchedWords += 1;
      index += 1;
    }
  }

  return { text: output.join(""), matches, unmatchedWords };
}
