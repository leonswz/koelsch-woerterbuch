import test from "node:test";
import assert from "node:assert/strict";

import {
  letterPrefixes,
  normalizeLetter,
  normalizePage,
  normalizeSearchQuery,
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
