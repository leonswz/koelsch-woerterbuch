import type { Metadata } from "next";

import { KoelschSearch } from "@/components/koelsch-search";
import { WordList } from "@/components/word-list";
import { normalizeSearchQuery } from "@/lib/word-query";
import { SEARCH_LIMIT, searchWords } from "@/lib/words";

const numberFormat = new Intl.NumberFormat("de-DE");

export const metadata: Metadata = { title: "Suche" };

export default async function SuchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = normalizeSearchQuery(q);
  const result = await searchWords(query);

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-koelsch text-3xl font-semibold tracking-tight text-ink">
          Suche
        </h1>
        <p className="mt-2 text-ink-soft">
          Kölsch oder Deutsch – finde das passende Wort.
        </p>
      </header>

      <KoelschSearch initial={query} autoFocus />

      {query ? (
        <section className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card shadow-sm">
          <div className="border-b border-line bg-paper/45 px-5 py-4">
            <p className="text-sm text-ink-soft">
              {result.total ? (
                <>
                  <strong className="font-semibold text-ink">
                    {numberFormat.format(result.total)}
                  </strong>{" "}
                  {result.total === 1 ? "Treffer" : "Treffer"} für „{query}“
                </>
              ) : (
                <>Keine Treffer für „{query}“</>
              )}
            </p>
            {result.limited ? (
              <p className="mt-1 text-xs text-ink-faint">
                Angezeigt werden die ersten {SEARCH_LIMIT} Einträge. Mit einem
                genaueren Begriff wird die Liste kürzer.
              </p>
            ) : null}
          </div>

          {result.words.length ? (
            <WordList words={result.words} />
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="font-koelsch text-xl font-semibold text-ink">
                Nix dobei.
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Probier eine andere Schreibweise oder einen kürzeren Begriff.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-[var(--radius-card)] border border-line bg-card p-6 text-ink-soft">
          Tippe oben ein Wort ein, um den Bestand zu durchsuchen.
        </section>
      )}
    </div>
  );
}
