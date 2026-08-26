import test from "node:test";
import assert from "node:assert/strict";

import {
  translationCompletionMessage,
  translationStatusCopy,
} from "../src/lib/translation-status.ts";

test("describes a complete rule-based translation directly", () => {
  assert.deepEqual(translationStatusCopy("rule-based"), {
    label: "Regelbasiert zusammengesetzt",
    description: "Wörterbuch und feste Grammatikregeln decken den ganzen Text ab.",
    tone: "rule",
  });
});

test("describes partial output without overstating its quality", () => {
  assert.deepEqual(translationStatusCopy("partial"), {
    label: "Teilweise übersetzt",
    description: "Unbekannte Bestandteile bleiben unverändert im Text.",
    tone: "partial",
  });
});

test("describes dictionary-only output separately", () => {
  assert.equal(translationStatusCopy("dictionary").label, "Aus dem Wörterbuch");
});

test("uses honest completion messages for dictionary and rule-based output", () => {
  assert.equal(
    translationCompletionMessage("dictionary"),
    "Alle Wörter wurden im Wörterbuch gefunden.",
  );
  assert.equal(
    translationCompletionMessage("rule-based"),
    "Der Text wurde vollständig aus Wörterbuch und festen Regeln zusammengesetzt.",
  );
});
