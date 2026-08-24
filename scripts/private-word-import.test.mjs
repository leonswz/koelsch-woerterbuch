import test from "node:test";
import assert from "node:assert/strict";

import { preparePrivateWords } from "./private-word-import.mjs";

const importedAt = new Date("2026-08-24T14:00:00.000Z");

test("maps reviewed private word pairs to database rows", () => {
  const result = preparePrivateWords(
    [
      {
        koelsch: "Botz",
        translation: "Hose",
        reviewStatus: "pending",
        reviewFlags: [],
        sources: [
          {
            sourceId: 2,
            sourceUrl:
              "https://www.koelsch-woerterbuch.de/botz-auf-deutsch-2.html",
          },
        ],
      },
    ],
    importedAt,
  );

  assert.deepEqual(result, [
    {
      koelsch: "Botz",
      slug: "botz",
      translation: "Hose",
      category: "allgemein",
      aliases: [],
      partOfSpeech: null,
      notes: null,
      reviewStatus: "pending",
      source: "koelsch-woerterbuch.de",
      sourceUrl:
        "https://www.koelsch-woerterbuch.de/botz-auf-deutsch-2.html",
      sourceLicense: null,
      uncertain: false,
      sources: [
        {
          sourceId: 2,
          sourceUrl:
            "https://www.koelsch-woerterbuch.de/botz-auf-deutsch-2.html",
        },
      ],
      importedAt,
    },
  ]);
});

test("excludes flagged rows and resolves normalized slug collisions", () => {
  const result = preparePrivateWords(
    [
      {
        koelsch: "Straße",
        translation: "Stroß",
        reviewFlags: [],
        sources: [{ sourceId: 10, sourceUrl: "https://example.test/10" }],
      },
      {
        koelsch: "Strasse",
        translation: "Straße",
        reviewFlags: [],
        sources: [{ sourceId: 11, sourceUrl: "https://example.test/11" }],
      },
      {
        koelsch: "kaputter Erklärungstext",
        translation: "Wort",
        reviewFlags: ["suspicious-headword-length"],
        sources: [{ sourceId: 12, sourceUrl: "https://example.test/12" }],
      },
    ],
    importedAt,
  );

  assert.deepEqual(
    result.map((word) => [word.koelsch, word.slug]),
    [
      ["Straße", "strasse"],
      ["Strasse", "strasse-11"],
    ],
  );
});
