import test from "node:test";
import assert from "node:assert/strict";

import {
  isEditorUsername,
  parseWordEditorInput,
  slugifyWord,
} from "../src/lib/word-editor.ts";

test("accepts only Leon as the default editor", () => {
  assert.equal(isEditorUsername("leon"), true);
  assert.equal(isEditorUsername("Leon"), true);
  assert.equal(isEditorUsername("emma"), false);
  assert.equal(isEditorUsername(null), false);
});

test("creates stable URL slugs for Kölsch terms", () => {
  assert.equal(slugifyWord("Äädäppel un Öl"), "aeaedaeppel-un-oel");
  assert.equal(slugifyWord("  Kölle Alaaf!  "), "koelle-alaaf");
});

test("parses and normalizes a complete editorial word form", () => {
  const result = parseWordEditorInput({
    koelsch: "  Kölle  ",
    translation: "  Köln  ",
    notes: " Die liebevolle kölsche Bezeichnung für Köln. ",
    aliases: "Cölle, Coelle\nKölle",
    phonetic: " ˈkœlə ",
    category: " Ort ",
    partOfSpeech: " Substantiv ",
    example: " Dat es Kölle. ",
    exampleTranslation: " Das ist Köln. ",
    reviewStatus: "published",
  });

  assert.deepEqual(result, {
    ok: true,
    data: {
      koelsch: "Kölle",
      translation: "Köln",
      notes: "Die liebevolle kölsche Bezeichnung für Köln.",
      aliases: ["Cölle", "Coelle", "Kölle"],
      phonetic: "ˈkœlə",
      category: "ort",
      partOfSpeech: "Substantiv",
      example: "Dat es Kölle.",
      exampleTranslation: "Das ist Köln.",
      reviewStatus: "published",
    },
  });
});

test("rejects forms without a Kölsch term or translation", () => {
  assert.deepEqual(parseWordEditorInput({ koelsch: "", translation: "Köln" }), {
    ok: false,
    error: "Kölscher Begriff und hochdeutsche Übersetzung sind Pflichtfelder.",
  });
});

test("rejects overly long editorial explanations", () => {
  const result = parseWordEditorInput({
    koelsch: "Kölle",
    translation: "Köln",
    notes: "x".repeat(2001),
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Die Erklärung darf höchstens 2.000 Zeichen lang sein.",
  });
});
