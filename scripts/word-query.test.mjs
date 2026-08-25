import test from "node:test";
import assert from "node:assert/strict";

import {
  letterPrefixes,
  normalizeLetter,
  normalizePage,
  normalizeSearchQuery,
  rankWordSuggestions,
} from "../src/lib/word-query.ts";

test("normalizes A–Z parameters and keeps umlauts with their base letter", () => {
  assert.equal(normalizeLetter("k"), "K");
  assert.equal(normalizeLetter("Ä"), "A");
  assert.equal(normalizeLetter("1"), null);
  assert.equal(normalizeLetter(undefined), null);
  assert.deepEqual(letterPrefixes("A"), ["a", "ä"]);
  assert.deepEqual(letterPrefixes("O"), ["o", "ö"]);
  assert.deepEqual(letterPrefixes("K"), ["k"]);
});

test("normalizes search text and page boundaries", () => {
  assert.equal(normalizeSearchQuery("  Äädäppel  "), "Äädäppel");
  assert.equal(normalizeSearchQuery("   "), "");
  assert.equal(normalizeSearchQuery(undefined), "");
  assert.equal(normalizePage("2"), 2);
  assert.equal(normalizePage("0"), 1);
  assert.equal(normalizePage("kaputt"), 1);
});

test("ranks Kölsch word starts before translation starts and partial matches", () => {
  const words = [
    { id: 1, koelsch: "Dat muss Kölle sin", slug: "dat-muss", translation: "Das muss Köln sein" },
    { id: 2, koelsch: "Cöllsch", slug: "coellsch", translation: "Kölner Mundart" },
    { id: 3, koelsch: "Kölle", slug: "koelle", translation: "Köln" },
    { id: 4, koelsch: "Kölner", slug: "koelner", translation: "Bewohner Kölns" },
  ];

  assert.deepEqual(
    rankWordSuggestions(words, "köl", 4).map((word) => word.slug),
    ["koelle", "koelner", "coellsch", "dat-muss"],
  );
});

test("ranks exact words first and removes duplicate slugs", () => {
  const words = [
    { id: 1, koelsch: "Kölle Alaaf", slug: "alaaf", translation: "Köln allein" },
    { id: 2, koelsch: "Kölle", slug: "koelle", translation: "Köln" },
    { id: 2, koelsch: "Kölle", slug: "koelle", translation: "Köln" },
  ];

  assert.deepEqual(
    rankWordSuggestions(words, "Kölle", 6).map((word) => word.slug),
    ["koelle", "alaaf"],
  );
});

test("finds and ranks structured meanings and spelling variants", () => {
  const words = [
    {
      id: 1,
      koelsch: "Kappes",
      slug: "kappes",
      translation: "Kohl; Unsinn",
      meanings: [{ translation: "Kohl" }, { translation: "Unsinn" }],
      variants: [{ spelling: "Kapes" }],
    },
    {
      id: 2,
      koelsch: "Unsinnich",
      slug: "unsinnich",
      translation: "albern",
      meanings: [{ translation: "albern" }],
      variants: [],
    },
  ];

  assert.deepEqual(
    rankWordSuggestions(words, "Kapes", 6).map((word) => word.slug),
    ["kappes"],
  );
  assert.deepEqual(
    rankWordSuggestions(words, "Unsinn", 6).map((word) => word.slug),
    ["unsinnich", "kappes"],
  );
});
