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
      { source: "Guten Morgen", target: "Jode Morje", slug: "jode-morje", kind: "dictionary" },
      { source: "Köln", target: "Kölle", slug: "koelle", kind: "dictionary" },
    ],
    unmatchedWords: 0,
    status: "dictionary",
    rulesApplied: [],
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
        kind: "dictionary",
        alternatives: ["Unsinn"],
      },
    ],
    unmatchedWords: 0,
    status: "dictionary",
    rulesApplied: [],
  });
  assert.equal(translateCuratedText("Unsinn", words, "de-koelsch").text, "Kappes");
});

test("builds a simple sentence from dictionary entries and explicit grammar rules", () => {
  const sentenceWords = [
    ...words.filter((word) => word.id !== 4),
    { id: 6, slug: "drinke", koelsch: "drinke", translation: "trinken", aliases: [] },
  ];

  assert.deepEqual(
    translateCuratedText("Wir trinken heute nicht.", sentenceWords, "de-koelsch"),
    {
      text: "Mer drinke hügg nit.",
      matches: [
        { source: "Wir", target: "Mer", slug: null, kind: "grammar" },
        { source: "trinken", target: "drinke", slug: "drinke", kind: "dictionary" },
        { source: "heute", target: "hügg", slug: null, kind: "grammar" },
        { source: "nicht", target: "nit", slug: null, kind: "grammar" },
      ],
      unmatchedWords: 0,
      status: "rule-based",
      rulesApplied: ["Personalpronomen", "Zeitangabe", "Negation"],
    },
  );
});

test("keeps dictionary entries ahead of fallback grammar rules", () => {
  assert.deepEqual(translateCuratedText("Heute", words, "de-koelsch"), {
    text: "Hück",
    matches: [
      {
        source: "Heute",
        target: "Hück",
        slug: "hueck",
        kind: "dictionary",
      },
    ],
    unmatchedWords: 0,
    status: "dictionary",
    rulesApplied: [],
  });
});

test("marks rule-based output as partial when a word stays unknown", () => {
  const result = translateCuratedText("Wir trinken Limonade.", [
    { id: 6, slug: "drinke", koelsch: "drinke", translation: "trinken", aliases: [] },
  ], "de-koelsch");

  assert.equal(result.text, "Mer drinke Limonade.");
  assert.equal(result.status, "partial");
  assert.equal(result.unmatchedWords, 1);
  assert.deepEqual(result.rulesApplied, ["Personalpronomen"]);
});
