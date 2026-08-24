import test from "node:test";
import assert from "node:assert/strict";

import {
  aggregateTranslations,
  extractKoelschTranslations,
  slugifyKoelsch,
} from "./wiktionary-parser.mjs";

const page = (title, content, revisionId = 123) => ({
  pageid: 42,
  title,
  revisions: [
    {
      revid: revisionId,
      timestamp: "2026-08-24T12:00:00Z",
      slots: { main: { content } },
    },
  ],
});

test("extracts Kölsch translations from Wiktionary translation templates", () => {
  const entries = extractKoelschTranslations(
    page(
      "Hose",
      [
        "*{{en}}: {{Ü|en|trousers}}",
        "*{{ksh}}: {{Ü|ksh|Botz}}",
      ].join("\n"),
      10708402,
    ),
  );

  assert.deepEqual(entries, [
    {
      koelsch: "Botz",
      translation: "Hose",
      uncertain: false,
      source: {
        name: "Deutschsprachiges Wiktionary",
        url: "https://de.wiktionary.org/wiki/Hose",
        pageId: 42,
        revisionId: 10708402,
        revisionTimestamp: "2026-08-24T12:00:00Z",
        license: "CC BY-SA 4.0",
      },
    },
  ]);
});

test("uses the displayed translation and marks uncertain templates", () => {
  const entries = extractKoelschTranslations(
    page(
      "Prostituierte",
      [
        "**{{ksh}}: {{Ü|ksh|Trottoirschwalbe|Trittuarschwalf}}",
        "*{{ksh}}: [?] {{Ü?|ksh|Ping}}",
      ].join("\n"),
    ),
  );

  assert.deepEqual(
    entries.map(({ koelsch, uncertain }) => ({ koelsch, uncertain })),
    [
      { koelsch: "Trittuarschwalf", uncertain: false },
      { koelsch: "Ping", uncertain: true },
    ],
  );
});

test("deduplicates repeated translation blocks on the same page", () => {
  const entries = extractKoelschTranslations(
    page(
      "Käse",
      [
        "*{{ksh}}: [1] {{Ü|ksh|Kies}}",
        "*{{ksh}}: [1] {{Ü|ksh|Kies}}",
        "*{{ksh}}: [1] {{Ü|ksh|Kies}}",
      ].join("\n"),
    ),
  );

  assert.equal(entries.length, 1);
  assert.equal(entries[0].koelsch, "Kies");
});

test("aggregates identical Kölsch forms without losing meanings or sources", () => {
  const entries = [
    ...extractKoelschTranslations(page("Fut", "*{{ksh}}: {{Ü|ksh|Funz}}", 1)),
    ...extractKoelschTranslations(page("Vagina", "*{{ksh}}: {{Ü|ksh|Funz}}", 2)),
  ];

  assert.deepEqual(aggregateTranslations(entries), [
    {
      koelsch: "Funz",
      slug: "funz",
      translation: "Fut; Vagina",
      category: "allgemein",
      reviewStatus: "pending",
      source: "Deutschsprachiges Wiktionary",
      sourceUrl: "https://de.wiktionary.org/wiki/Fut",
      sourceLicense: "CC BY-SA 4.0",
      uncertain: false,
      sources: [entries[0].source, entries[1].source],
    },
  ]);
});

test("creates stable German-friendly slugs", () => {
  assert.equal(slugifyKoelsch("Äd"), "aed");
  assert.equal(slugifyKoelsch("Tünnes"), "tuennes");
  assert.equal(slugifyKoelsch("bės"), "bes");
});
