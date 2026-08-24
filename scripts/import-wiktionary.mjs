#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchWiktionaryPages } from "./wiktionary-client.mjs";
import {
  aggregateTranslations,
  extractKoelschTranslations,
} from "./wiktionary-parser.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const writeToDatabase = args.has("--write");
const limitArgument = [...args].find((arg) => arg.startsWith("--limit="));
const outputArgument = [...args].find((arg) => arg.startsWith("--output="));
const limit = limitArgument ? Number(limitArgument.split("=")[1]) : 100;
const outputPath = resolve(
  projectRoot,
  outputArgument?.slice("--output=".length) ||
    "data/imports/wiktionary-koelsch-pilot.json",
);

if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
  throw new Error("--limit muss eine ganze Zahl zwischen 1 und 500 sein");
}

const pages = await fetchWiktionaryPages({ limit });
const rawEntries = pages.flatMap(extractKoelschTranslations);
const words = aggregateTranslations(rawEntries).filter((word) => word.slug);
const skippedPages = pages
  .filter((page) => extractKoelschTranslations(page).length === 0)
  .map((page) => page.title);

const slugOwners = new Map();
for (const word of words) {
  const previous = slugOwners.get(word.slug);
  if (previous && previous !== word.koelsch) {
    throw new Error(
      `Slug-Kollision: ${previous} und ${word.koelsch} ergeben beide ${word.slug}`,
    );
  }
  slugOwners.set(word.slug, word.koelsch);
}

const importedAt = new Date();
const artifact = {
  metadata: {
    source: "Deutschsprachiges Wiktionary",
    category:
      "https://de.wiktionary.org/wiki/Kategorie:%C3%9Cbersetzungen_(K%C3%B6lsch)",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
    fetchedAt: importedAt.toISOString(),
    requestedPageLimit: limit,
    fetchedPages: pages.length,
    rawTranslations: rawEntries.length,
    uniqueWords: words.length,
    skippedPages,
  },
  words,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

let inserted = 0;
if (writeToDatabase) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const result = await prisma.word.createMany({
      data: words.map((word) => ({
        ...word,
        aliases: [],
        partOfSpeech: null,
        notes: null,
        importedAt,
      })),
      skipDuplicates: true,
    });
    inserted = result.count;
  } finally {
    await prisma.$disconnect();
  }
}

console.log(
  JSON.stringify(
    {
      mode: writeToDatabase ? "database" : "dry-run",
      fetchedPages: pages.length,
      rawTranslations: rawEntries.length,
      uniqueWords: words.length,
      uncertainWords: words.filter((word) => word.uncertain).length,
      skippedPages,
      inserted,
      outputPath,
    },
    null,
    2,
  ),
);
