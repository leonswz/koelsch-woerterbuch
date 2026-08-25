import test from "node:test";
import assert from "node:assert/strict";

import { koelschCopy, koelschCopySources } from "../src/lib/koelsch-copy.ts";

test("uses Academy-backed Kölsch forms in interface copy", () => {
  assert.deepEqual(koelschCopy, {
    heroQuestion: "Wat heiß dat op Kölsch?",
    wordOfTheDay: "Hügg för dich",
    menuPrompt: "Wat wells de nohschlage?",
    footerHeart: "Et Hätz schleiht en Kölle.",
  });

  for (const key of Object.keys(koelschCopy)) {
    assert.ok(koelschCopySources[key].startsWith("Akademie:"));
  }
});
