import test from "node:test";
import assert from "node:assert/strict";

import { splitWordMeanings } from "../src/lib/word-meanings.ts";

test("splits comma and semicolon separated meanings", () => {
  assert.deepEqual(splitWordMeanings("Kohl, Unsinn; Quatsch"), [
    "Kohl",
    "Unsinn",
    "Quatsch",
  ]);
});

test("does not split commas inside parentheses", () => {
  assert.deepEqual(splitWordMeanings("gehen (langsam, vorsichtig), laufen"), [
    "gehen (langsam, vorsichtig)",
    "laufen",
  ]);
});

test("removes duplicate and empty meanings", () => {
  assert.deepEqual(splitWordMeanings("Hose; hose; ; Beinkleid"), [
    "Hose",
    "Beinkleid",
  ]);
});
