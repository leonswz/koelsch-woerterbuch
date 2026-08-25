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
  assert.equal(isEditorUsername("demo"), false);
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
    grammaticalGender: "neuter",
    article: " et ",
    plural: " de Kölle ",
    partOfSpeech: " Substantiv ",
    example: " Dat es Kölle. ",
    exampleTranslation: " Das ist Köln. ",
    reviewStatus: "published",
    meaningTranslation: ["Köln"],
    meaningDefinition: ["Stadt am Rhein"],
    meaningPartOfSpeech: ["Eigenname"],
    meaningRegister: ["neutral"],
    meaningExample: ["Ich ben en Kölle."],
    meaningExampleTranslation: ["Ich bin in Köln."],
    variantSpelling: ["Cölle", "Coelle", "Kölle"],
    variantLabel: ["historisch", "alternative Schreibweise", "wie Lemma"],
    variantRegion: ["", "", ""],
  });

  assert.deepEqual(result, {
    ok: true,
    data: {
      koelsch: "Kölle",
      translation: "Köln",
      notes: "Die liebevolle kölsche Bezeichnung für Köln.",
      aliases: ["Cölle", "Coelle"],
      phonetic: "ˈkœlə",
      category: "ort",
      grammaticalGender: "neuter",
      article: "et",
      plural: "de Kölle",
      partOfSpeech: "Eigenname",
      example: "Ich ben en Kölle.",
      exampleTranslation: "Ich bin in Köln.",
      reviewStatus: "published",
      meanings: [
        {
          translation: "Köln",
          definition: "Stadt am Rhein",
          partOfSpeech: "Eigenname",
          register: "neutral",
          example: "Ich ben en Kölle.",
          exampleTranslation: "Ich bin in Köln.",
        },
      ],
      variants: [
        { spelling: "Cölle", label: "historisch", region: null },
        { spelling: "Coelle", label: "alternative Schreibweise", region: null },
      ],
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

test("keeps multiple meanings ordered and derives the legacy translation", () => {
  const result = parseWordEditorInput({
    koelsch: "Kappes",
    translation: "wird durch Bedeutungen ersetzt",
    meaningTranslation: ["Kohl", "Unsinn"],
    meaningDefinition: ["Gemüse", "etwas Sinnloses"],
    meaningPartOfSpeech: ["Substantiv", "Substantiv"],
    meaningRegister: ["neutral", "umgangssprachlich"],
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.translation, "Kohl; Unsinn");
  assert.deepEqual(result.data.meanings.map((meaning) => meaning.translation), [
    "Kohl",
    "Unsinn",
  ]);
});

test("rejects an empty structured meaning", () => {
  assert.deepEqual(
    parseWordEditorInput({
      koelsch: "Kappes",
      translation: "Kohl",
      meaningTranslation: ["Kohl", ""],
      meaningDefinition: ["", "darf nicht ohne Bedeutung gespeichert werden"],
    }),
    {
      ok: false,
      error: "Jede ausgefüllte Bedeutung braucht eine hochdeutsche Übersetzung.",
    },
  );
});
