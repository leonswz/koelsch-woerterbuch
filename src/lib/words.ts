import { prisma } from "@/lib/prisma";
import { letterPrefixes } from "@/lib/word-query";

export const WORDS_PER_PAGE = 120;
export const SEARCH_LIMIT = 100;

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

export function getWordBySlug(slug: string) {
  return prisma.word.findUnique({ where: { slug } });
}

export function countWords() {
  return prisma.word.count();
}
