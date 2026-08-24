#!/usr/bin/env node

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  curateWordPairs,
} from "./koelsch-woerterbuch-parser.mjs";
import {
  crawlWordEntries,
  fetchIndexEntries,
} from "./koelsch-woerterbuch-client.mjs";

const args = process.argv.slice(2);
const valueOf = (name, fallback) => {
  const argument = args.find((item) => item.startsWith(`--${name}=`));
  return argument ? argument.slice(name.length + 3) : fallback;
};

const limit = Number(valueOf("limit", "0"));
const concurrency = Number(valueOf("concurrency", "6"));
const requestsPerSecond = Number(valueOf("rps", "8"));
const privateDirectory = resolve(
  process.cwd(),
  valueOf("directory", ".private/koelsch-woerterbuch-de"),
);
const cachePath = resolve(privateDirectory, "crawl-cache.jsonl");
const outputPath = resolve(privateDirectory, "word-pairs.json");

if (!Number.isInteger(limit) || limit < 0) {
  throw new Error("--limit muss 0 oder eine positive ganze Zahl sein");
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 20) {
  throw new Error("--concurrency muss zwischen 1 und 20 liegen");
}
if (!Number.isFinite(requestsPerSecond) || requestsPerSecond < 1 || requestsPerSecond > 30) {
  throw new Error("--rps muss zwischen 1 und 30 liegen");
}

await mkdir(privateDirectory, { recursive: true });

const cachedWords = new Map();
const completedUrls = new Set();
try {
  const cache = await readFile(cachePath, "utf8");
  for (const line of cache.split("\n")) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      completedUrls.add(record.sourceUrl);
      if (record.status === "ok" && record.word) {
        cachedWords.set(record.sourceUrl, record.word);
      }
    } catch {
      // Ignore a possibly truncated final line after an interrupted crawl.
    }
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

console.log("Lese A–Z-Verzeichnis …");
const discovered = await fetchIndexEntries();
const selected = limit > 0 ? discovered.slice(0, limit) : discovered;
const pending = selected.filter((entry) => !completedUrls.has(entry.sourceUrl));
console.log(
  JSON.stringify({
    discovered: discovered.length,
    selected: selected.length,
    cached: selected.length - pending.length,
    pending: pending.length,
    requestsPerSecond,
    concurrency,
  }),
);

let processed = 0;
let cacheWrite = Promise.resolve();
const crawl = await crawlWordEntries({
  entries: pending,
  concurrency,
  requestsPerSecond,
  onResult: async ({ entry, word, error }) => {
    processed += 1;
    const record = word
      ? { status: "ok", sourceUrl: entry.sourceUrl, word }
      : {
          status: error ? "error" : "missing",
          sourceUrl: entry.sourceUrl,
          entry,
          error: error ? String(error.message ?? error) : null,
        };
    cacheWrite = cacheWrite.then(() =>
      appendFile(cachePath, `${JSON.stringify(record)}\n`, "utf8"),
    );
    await cacheWrite;

    if (processed % 100 === 0 || processed === pending.length) {
      console.log(`Fortschritt: ${processed}/${pending.length}`);
    }
  },
});
await cacheWrite;

for (const word of crawl.words) cachedWords.set(word.sourceUrl, word);
const words = selected
  .map((entry) => cachedWords.get(entry.sourceUrl))
  .filter(Boolean);
const { words: curated, rejected } = curateWordPairs(words);
const flaggedHeadwords = curated.filter((word) => word.reviewFlags.length > 0);

const artifact = {
  metadata: {
    purpose: "private personal-use review corpus",
    source: "koelsch-woerterbuch.de",
    fetchedAt: new Date().toISOString(),
    discoveredEntries: discovered.length,
    selectedEntries: selected.length,
    parsedPairs: words.length,
    uniqueHeadwords: curated.length,
    rejectedEntries: rejected.length,
    flaggedHeadwords: flaggedHeadwords.length,
    missingThisRun: crawl.missing.length,
    failedThisRun: crawl.failed.length,
    excludedContent: [
      "Karnevalslieder",
      "Sprichwörter",
      "Kölsches Grundgesetz",
      "Kommentare",
      "Beispiele und redaktionelle Texte",
    ],
  },
  words: curated,
  rejected,
};

await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      parsedPairs: words.length,
      uniqueHeadwords: curated.length,
      rejectedEntries: rejected.length,
      flaggedHeadwords: flaggedHeadwords.length,
      missingThisRun: crawl.missing.length,
      failedThisRun: crawl.failed.length,
      outputPath,
      cachePath,
    },
    null,
    2,
  ),
);
