import test from "node:test";
import assert from "node:assert/strict";

import { fetchWiktionaryPages } from "./wiktionary-client.mjs";

test("loads all category pages through MediaWiki continuation and fetches revisions", async () => {
  const requested = [];
  const fetchImpl = async (url, options) => {
    requested.push({ url: String(url), options });
    const parsed = new URL(url);

    if (parsed.searchParams.get("list") === "categorymembers") {
      const continued = parsed.searchParams.get("cmcontinue");
      return Response.json(
        continued
          ? {
              batchcomplete: true,
              query: { categorymembers: [{ pageid: 2, ns: 0, title: "Hose" }] },
            }
          : {
              continue: { cmcontinue: "next-page", continue: "-||" },
              query: { categorymembers: [{ pageid: 1, ns: 0, title: "auch" }] },
            },
      );
    }

    assert.equal(parsed.searchParams.get("prop"), "revisions");
    assert.equal(parsed.searchParams.get("titles"), "auch|Hose");
    return Response.json({
      batchcomplete: true,
      query: {
        pages: [
          { pageid: 1, title: "auch", revisions: [] },
          { pageid: 2, title: "Hose", revisions: [] },
        ],
      },
    });
  };

  const pages = await fetchWiktionaryPages({ fetchImpl });

  assert.equal(pages.length, 2);
  assert.equal(requested.length, 3);
  assert.match(requested[0].options.headers["User-Agent"], /KoelschWoerterbuchImporter/);
});

test("respects a pilot page limit before requesting revisions", async () => {
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    if (parsed.searchParams.get("list") === "categorymembers") {
      return Response.json({
        batchcomplete: true,
        query: {
          categorymembers: [
            { pageid: 1, ns: 0, title: "auch" },
            { pageid: 2, ns: 0, title: "Hose" },
          ],
        },
      });
    }

    assert.equal(parsed.searchParams.get("titles"), "auch");
    return Response.json({
      query: { pages: [{ pageid: 1, title: "auch", revisions: [] }] },
    });
  };

  const pages = await fetchWiktionaryPages({ fetchImpl, limit: 1 });
  assert.deepEqual(pages.map((page) => page.title), ["auch"]);
});
