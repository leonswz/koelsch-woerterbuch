import test from "node:test";
import assert from "node:assert/strict";

import { grammarRows } from "../src/lib/word-metadata.ts";

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
