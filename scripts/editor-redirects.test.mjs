import test from "node:test";
import assert from "node:assert/strict";

import { relativeRedirect } from "../src/lib/http-redirect.ts";

test("editor redirects stay relative and never expose the internal container host", () => {
  const response = relativeRedirect("/redaktion/woerter/42", {
    saved: "1",
  });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/redaktion/woerter/42?saved=1");
  assert.doesNotMatch(response.headers.get("location") ?? "", /0\.0\.0\.0/);
});

test("relative redirects encode error messages", () => {
  const response = relativeRedirect("/redaktion/inhalte", {
    error: "Bitte prüfen & erneut speichern.",
  });
  assert.equal(
    response.headers.get("location"),
    "/redaktion/inhalte?error=Bitte+pr%C3%BCfen+%26+erneut+speichern.",
  );
});
