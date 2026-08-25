import test from "node:test";
import assert from "node:assert/strict";

import { koelschGrundgesetz } from "../src/lib/koelsch-grundgesetz.ts";

test("contains the eleven traditional articles in order", () => {
  assert.equal(koelschGrundgesetz.length, 11);
  assert.deepEqual(koelschGrundgesetz.map((article) => article.number), [1,2,3,4,5,6,7,8,9,10,11]);
  assert.equal(koelschGrundgesetz[0].koelsch, "Et es wie et es.");
  assert.equal(koelschGrundgesetz[10].koelsch, "Do laachs de dich kapott.");
});

test("every article includes a translation and an editorial interpretation", () => {
  for (const article of koelschGrundgesetz) {
    assert.ok(article.translation.length > 3);
    assert.ok(article.meaning.length > 10);
  }
});
