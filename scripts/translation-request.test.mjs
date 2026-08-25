import test from "node:test";
import assert from "node:assert/strict";

import { parseTranslationRequest } from "../src/lib/translation-request.ts";

test("accepts and trims a valid translation request", () => {
  assert.deepEqual(
    parseTranslationRequest({ text: "  Guten Morgen  ", direction: "de-koelsch" }),
    { ok: true, text: "Guten Morgen", direction: "de-koelsch" },
  );
});

test("rejects empty and malformed translation requests", () => {
  assert.deepEqual(parseTranslationRequest({ text: "  ", direction: "de-koelsch" }), {
    ok: false,
    error: "Bitte gib einen Text ein.",
  });
  assert.deepEqual(parseTranslationRequest({ text: "Hallo", direction: "anders" }), {
    ok: false,
    error: "Unbekannte Übersetzungsrichtung.",
  });
});

test("limits translation requests to 500 characters", () => {
  assert.deepEqual(parseTranslationRequest({ text: "x".repeat(501), direction: "koelsch-de" }), {
    ok: false,
    error: "Der Text darf höchstens 500 Zeichen lang sein.",
  });
});
