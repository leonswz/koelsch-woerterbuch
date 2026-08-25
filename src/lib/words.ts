import { prisma } from "@/lib/prisma";
import { letterPrefixes, rankWordSuggestions } from "@/lib/word-query";
import {
  rankRelatedWords,
  relatedSearchTerms,
  type WordRelationSource,
} from "@/lib/word-relations";

export const WORDS_PER_PAGE = 120;
export const SEARCH_LIMIT = 100;
export const SUGGESTION_LIMIT = 6;

export async function listWordsByLetter(letter: string, page: number) {
  const prefixes = letterPrefixes(letter);
  const where = {
    OR: prefixes.map((prefix) => ({
      koelsch: { startsWith: prefix, mode: "insensitive" as const },
    })),
  };
  const skip = (page - 1) * WORDS_PER_PAGE;
  const [total, words] = await prisma.$transaction([
    prisma.word.count({ where }),
    prisma.word.findMany({
      where,
      orderBy: [{ koelsch: "asc" }, { id: "asc" }],
      select: { id: true, koelsch: true, slug: true, translation: true },
      skip,
      take: WORDS_PER_PAGE,
    }),
  ]);

  return {
    words,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / WORDS_PER_PAGE)),
  };
}

export async function searchWords(query: string) {
  if (!query) return { words: [], total: 0, limited: false };
  const where = {
    OR: [
      { koelsch: { contains: query, mode: "insensitive" as const } },
      { translation: { contains: query, mode: "insensitive" as const } },
    ],
  };
  const [total, words] = await prisma.$transaction([
    prisma.word.count({ where }),
    prisma.word.findMany({
      where,
      orderBy: [{ koelsch: "asc" }, { id: "asc" }],
      select: { id: true, koelsch: true, slug: true, translation: true },
      take: SEARCH_LIMIT,
    }),
  ]);
  return { words, total, limited: total > SEARCH_LIMIT };
}

export async function suggestWords(query: string) {
  const value = query.trim();
  if (value.length < 2) return [];

  const select = {
    id: true,
    koelsch: true,
    slug: true,
    translation: true,
  } as const;
  const orderBy = [{ koelsch: "asc" as const }, { id: "asc" as const }];
  const [koelschStarts, translationStarts, partialMatches] =
    await prisma.$transaction([
      prisma.word.findMany({
        where: {
          koelsch: { startsWith: value, mode: "insensitive" },
        },
        orderBy,
        select,
        take: SUGGESTION_LIMIT,
      }),
      prisma.word.findMany({
        where: {
          translation: { startsWith: value, mode: "insensitive" },
        },
        orderBy,
        select,
        take: SUGGESTION_LIMIT,
      }),
      prisma.word.findMany({
        where: {
          OR: [
            { koelsch: { contains: value, mode: "insensitive" } },
            { translation: { contains: value, mode: "insensitive" } },
          ],
        },
        orderBy,
        select,
        take: 30,
      }),
    ]);

  return rankWordSuggestions(
    [...koelschStarts, ...translationStarts, ...partialMatches],
    value,
    SUGGESTION_LIMIT,
  );
}

export function getWordBySlug(slug: string) {
  return prisma.word.findUnique({ where: { slug } });
}

export async function getRelatedWords(word: WordRelationSource, limit = 6) {
  const terms = relatedSearchTerms(word.translation);
  const relationFilters = [
    ...terms.map((term) => ({
      translation: { contains: term, mode: "insensitive" as const },
    })),
    ...(word.category !== "allgemein"
      ? [{ category: { equals: word.category, mode: "insensitive" as const } }]
      : []),
  ];
  if (!relationFilters.length) return [];

  const candidates = await prisma.word.findMany({
    where: {
      id: { not: word.id },
      OR: relationFilters,
    },
    select: {
      id: true,
      koelsch: true,
      slug: true,
      translation: true,
      category: true,
    },
    orderBy: [{ koelsch: "asc" }, { id: "asc" }],
    take: 80,
  });

  return rankRelatedWords(word, candidates, limit);
}

export function countWords() {
  return prisma.word.count();
}

function dailySeed(date: Date) {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return Array.from(key).reduce(
    (seed, character) => (seed * 31 + character.charCodeAt(0)) >>> 0,
    17,
  );
}

export async function getWordOfTheDay(date = new Date()) {
  const total = await prisma.word.count();
  if (!total) return null;

  return prisma.word.findFirst({
    orderBy: [{ id: "asc" }],
    skip: dailySeed(date) % total,
    select: {
      koelsch: true,
      slug: true,
      translation: true,
      phonetic: true,
    },
  });
}
