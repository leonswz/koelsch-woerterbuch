#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { preparePrivateWords } from "./private-word-import.mjs";

const args = new Set(process.argv.slice(2));
const writeToDatabase = args.has("--write");
const inputArgument = [...args].find((argument) => argument.startsWith("--input="));
const inputPath = resolve(
  process.cwd(),
  inputArgument?.slice("--input=".length) ??
    ".private/koelsch-woerterbuch-de/word-pairs.json",
);

const artifact = JSON.parse(await readFile(inputPath, "utf8"));
if (!Array.isArray(artifact.words)) {
  throw new Error("Ungültiges Importformat: words muss ein Array sein");
}

const importedAt = new Date();
const words = preparePrivateWords(artifact.words, importedAt);
const excludedFlagged = artifact.words.length - words.length;
let inserted = 0;

if (writeToDatabase) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const result = await prisma.word.createMany({
      data: words,
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
      sourceRows: artifact.words.length,
      eligibleWords: words.length,
      excludedFlagged,
      inserted,
      inputPath,
    },
    null,
    2,
  ),
);
