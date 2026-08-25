import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWordExplanation,
  relatedSearchTerms,
  rankRelatedWords,
} from "../src/lib/word-relations.ts";

const word = (overrides = {}) => ({
  id: 1,
  koelsch: "Kölle",
  slug: "koelle",
  translation: "Köln, Stadt am Rhein",
  category: "orte",
  partOfSpeech: "Substantiv",
  notes: null,
  aliases: [],
  ...overrides,
});

test("uses an editorial note as the explanation when one exists", () => {
  assert.equal(
    buildWordExplanation(word({ notes: "Liebevolle Bezeichnung für die Stadt Köln." })),
    "Liebevolle Bezeichnung für die Stadt Köln.",
  );
});

test("creates a concise explanation when no editorial note exists", () => {
  assert.equal(
    buildWordExplanation(word({ aliases: ["Cölle"] })),
    "„Kölle“ bedeutet auf Hochdeutsch „Köln, Stadt am Rhein“. Eine weitere Schreibweise ist „Cölle“.",
  );
});

test("extracts useful translation terms but ignores common filler words", () => {
  assert.deepEqual(
    relatedSearchTerms("kleine Stadt am Rhein und Umgebung"),
    ["kleine", "stadt", "rhein", "umgebung"],
  );
});

test("ranks semantically related words before category-only matches", () => {
  const current = word();
  const candidates = [
    word({ id: 2, koelsch: "Domstadt", slug: "domstadt", translation: "Stadt Köln am Rhein" }),
    word({ id: 3, koelsch: "Veedel", slug: "veedel", translation: "Stadtviertel", category: "orte" }),
    word({ id: 4, koelsch: "Köbes", slug: "koebes", translation: "Kellner", category: "menschen" }),
    word({ id: 1, koelsch: "Kölle", slug: "koelle" }),
  ];

  assert.deepEqual(
    rankRelatedWords(current, candidates, 3).map((item) => item.slug),
    ["domstadt", "veedel"],
  );
});

test("does not invent related words from the generic category", () => {
  const current = word({ category: "allgemein", translation: "plötzlich" });
  const candidates = [
    word({ id: 2, slug: "anders", translation: "anders", category: "allgemein" }),
  ];

  assert.deepEqual(rankRelatedWords(current, candidates), []);
});
