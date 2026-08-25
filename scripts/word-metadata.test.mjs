import test from "node:test";
import assert from "node:assert/strict";

import {
  grammarRows,
  provenanceSummary,
} from "../src/lib/word-metadata.ts";

test("builds concise grammar rows without empty values", () => {
  assert.deepEqual(
    grammarRows({
      grammaticalGender: "neuter",
      article: "et",
      plural: "de Kappese",
    }),
    [
      { label: "Artikel", value: "et" },
      { label: "Genus", value: "Neutrum" },
      { label: "Plural", value: "de Kappese" },
    ],
  );
  assert.deepEqual(
    grammarRows({ grammaticalGender: null, article: null, plural: null }),
    [],
  );
});

test("marks editorially changed meanings as redaktionally maintained", () => {
  assert.deepEqual(
    provenanceSummary({
      reviewStatus: "published",
      uncertain: false,
      source: "Kölsch Wörterbuch",
      sourceUrl: "https://example.com/kappes",
      meanings: [{ source: "Redaktion (leon)" }],
    }),
    {
      label: "Redaktionell bearbeitet",
      description: "Mindestens eine Bedeutung wurde in der Redaktion geprüft oder ergänzt.",
      source: "Kölsch Wörterbuch",
      sourceUrl: "https://example.com/kappes",
    },
  );
});

test("does not present an external import as editorially verified", () => {
  assert.equal(
    provenanceSummary({
      reviewStatus: "published",
      uncertain: false,
      source: "Externe Sammlung",
      sourceUrl: null,
      meanings: [{ source: "Externe Sammlung" }],
    }).label,
    "Aus externer Quelle übernommen",
  );
});

test("gives uncertainty priority over the source label", () => {
  assert.equal(
    provenanceSummary({
      reviewStatus: "pending",
      uncertain: true,
      source: "Import",
      sourceUrl: null,
      meanings: [],
    }).label,
    "Noch ungeprüft",
  );
});

test("does not expose non-http source links", () => {
  assert.equal(
    provenanceSummary({
      reviewStatus: "published",
      uncertain: false,
      source: "Import",
      sourceUrl: "javascript:alert(1)",
      meanings: [],
    }).sourceUrl,
    null,
  );
});
