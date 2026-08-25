import test from "node:test";
import assert from "node:assert/strict";

import { translateCuratedText } from "../src/lib/translator.ts";

const words = [
  { id: 1, slug: "jode-morje", koelsch: "Jode Morje", translation: "Guten Morgen", aliases: [] },
  { id: 2, slug: "morje", koelsch: "Morje", translation: "Morgen", aliases: [] },
  { id: 3, slug: "koelle", koelsch: "Kölle", translation: "Köln, Stadt am Rhein", aliases: ["Cölle"] },
  { id: 4, slug: "hueck", koelsch: "hück", translation: "heute", aliases: [] },
  {
    id: 5,
    slug: "kappes",
    koelsch: "Kappes",
    translation: "Kohl; Unsinn",
    aliases: ["Kapes"],
    meanings: [{ translation: "Kohl" }, { translation: "Unsinn" }],
    variants: [{ spelling: "Kapes" }],
  },
];

test("translates the longest curated German phrase and keeps punctuation", () => {
  assert.deepEqual(translateCuratedText("Guten Morgen, Köln!", words, "de-koelsch"), {
    text: "Jode Morje, Kölle!",
    matches: [
      { source: "Guten Morgen", target: "Jode Morje", slug: "jode-morje" },
      { source: "Köln", target: "Kölle", slug: "koelle" },
    ],
    unmatchedWords: 0,
  });
});

test("keeps unknown words visible instead of inventing a translation", () => {
  const result = translateCuratedText("Guten Morgen, Welt!", words, "de-koelsch");
  assert.equal(result.text, "Jode Morje, Welt!");
  assert.equal(result.unmatchedWords, 1);
});

test("translates Kölsch and alternative spellings back to German", () => {
  assert.equal(translateCuratedText("Cölle hück", words, "koelsch-de").text, "Köln, Stadt am Rhein heute");
});

test("keeps structured meanings searchable and exposes ambiguity", () => {
  assert.deepEqual(translateCuratedText("Kapes", words, "koelsch-de"), {
    text: "Kohl",
    matches: [
      {
        source: "Kapes",
        target: "Kohl",
        slug: "kappes",
        alternatives: ["Unsinn"],
      },
    ],
    unmatchedWords: 0,
  });
  assert.equal(translateCuratedText("Unsinn", words, "de-koelsch").text, "Kappes");
});
