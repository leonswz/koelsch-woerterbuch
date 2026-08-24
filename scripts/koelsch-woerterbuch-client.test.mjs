import test from "node:test";
import assert from "node:assert/strict";

import {
  crawlWordEntries,
  fetchIndexEntries,
} from "./koelsch-woerterbuch-client.mjs";

const wordPage = (koelsch, translation) => `
  <div class="jumbotron-contents uebersetzung">
    <h2>${koelsch}<small>Kölsch</small></h2>
    <h3><a href="#">${translation}</a><small>Hochdeutsch</small></h3>
  </div>
`;

test("loads selected A–Z pages and deduplicates word URLs", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url: String(url), options });
    const letter = new URL(url).pathname.slice(1);
    return new Response(`
      <a href="/gleich-auf-deutsch-1.html" class="list-group-item">gleich</a>
      <a href="/${letter}-auf-deutsch-2.html" class="list-group-item">${letter}</a>
    `);
  };

  const entries = await fetchIndexEntries({ fetchImpl, letters: "ab" });

  assert.deepEqual(entries.map((entry) => entry.koelsch), ["gleich", "a", "b"]);
  assert.equal(requests.length, 2);
  assert.match(requests[0].options.headers["User-Agent"], /PersonalImporter/);
});

test("resumes from cached words and reports pages without translations", async () => {
  const entries = [
    {
      koelsch: "Kappes",
      sourceId: 730,
      sourceUrl: "https://www.koelsch-woerterbuch.de/kappes-auf-deutsch-730.html",
    },
    {
      koelsch: "Botz",
      sourceId: 2,
      sourceUrl: "https://www.koelsch-woerterbuch.de/botz-auf-deutsch-2.html",
    },
    {
      koelsch: "Kapott",
      sourceId: 3,
      sourceUrl: "https://www.koelsch-woerterbuch.de/kapott-auf-deutsch-3.html",
    },
  ];
  const cachedWords = new Map([
    [entries[0].sourceUrl, { ...entries[0], translation: "Kohl, Unsinn" }],
  ]);
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(String(url));
    if (String(url).includes("botz")) return new Response(wordPage("Botz", "Hose"));
    return new Response("<h1>Keine Übersetzung</h1>");
  };

  const result = await crawlWordEntries({
    entries,
    cachedWords,
    fetchImpl,
    concurrency: 2,
    requestsPerSecond: Infinity,
  });

  assert.deepEqual(result.words.map((word) => word.translation), ["Kohl, Unsinn", "Hose"]);
  assert.deepEqual(result.missing, [entries[2]]);
  assert.equal(requested.length, 2);
});
