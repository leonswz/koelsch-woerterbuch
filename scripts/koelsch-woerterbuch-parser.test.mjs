import test from "node:test";
import assert from "node:assert/strict";

import {
  parseIndexPage,
  parseWordPage,
} from "./koelsch-woerterbuch-parser.mjs";

const indexHtml = `
  <div class="list-group">
    <a href="https://www.koelsch-woerterbuch.de/aaschloch-auf-deutsch-16.html" class="list-group-item">
      <span class="badge">5 Kommentare</span> Aaschloch
    </a>
    <a href="/Aevver-bitte-auf-deutsch-1658.html" class="list-group-item">
      Ävver bitte <i class="fa" title="Karnevalslied"></i>
    </a>
    <a href="/anna-ming-droppe-auf-deutsch-12566.html" class="list-group-item">
      Anna, ming Droppe! <i class="fa" title="Sprichwort"></i>
    </a>
    <a href="/Aeaedaeppel-auf-deutsch-5.html" class="list-group-item">
      <span class="badge badge-default">3 Kommentare</span> Äädäppel
    </a>
  </div>
`;

test("index parser keeps only dictionary words and strips comment badges", () => {
  assert.deepEqual(parseIndexPage(indexHtml), [
    {
      koelsch: "Aaschloch",
      sourceUrl:
        "https://www.koelsch-woerterbuch.de/aaschloch-auf-deutsch-16.html",
      sourceId: 16,
    },
    {
      koelsch: "Äädäppel",
      sourceUrl:
        "https://www.koelsch-woerterbuch.de/Aeaedaeppel-auf-deutsch-5.html",
      sourceId: 5,
    },
  ]);
});

test("word parser extracts only the Kölsch headword and short German translation", () => {
  const html = `
    <div class="jumbotron-contents uebersetzung">
      <h2><img alt="Übersetzung: Kappes auf Deutsch"> Kappes
        <small class="pull-right text-muted">Kölsch</small>
      </h2>
      <h3><img alt="Kohl, Unsinn auf Kölsch">
        <a href="/kohl-unsinn-auf-koelsch-730.html">Kohl, Unsinn</a>
        <small class="pull-right text-muted">Hochdeutsch</small>
      </h3>
      <div class="actions">17 Kommentare</div>
    </div>
    <h2>Kommentare (17)</h2>
    <p>Dieser redaktionelle Text darf nicht übernommen werden.</p>
  `;

  assert.deepEqual(
    parseWordPage(html, {
      koelsch: "Kappes",
      sourceUrl:
        "https://www.koelsch-woerterbuch.de/kappes-auf-deutsch-730.html",
      sourceId: 730,
    }),
    {
      koelsch: "Kappes",
      translation: "Kohl, Unsinn",
      sourceId: 730,
      sourceUrl:
        "https://www.koelsch-woerterbuch.de/kappes-auf-deutsch-730.html",
    },
  );
});

test("word parser decodes entities and rejects pages without a translation box", () => {
  const html = `
    <div class="jumbotron-contents uebersetzung">
      <h2>Äädäppel <small>Kölsch</small></h2>
      <h3><a href="/kartoffeln-auf-koelsch-5.html">Kartoffeln &amp; Erdäpfel</a><small>Hochdeutsch</small></h3>
    </div>
  `;
  const source = {
    koelsch: "Äädäppel",
    sourceUrl:
      "https://www.koelsch-woerterbuch.de/Aeaedaeppel-auf-deutsch-5.html",
    sourceId: 5,
  };

  assert.equal(parseWordPage(html, source).translation, "Kartoffeln & Erdäpfel");
  assert.equal(parseWordPage("<h1>Nicht gefunden</h1>", source), null);
});
