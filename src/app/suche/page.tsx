import type { Metadata } from "next";
import Image from "next/image";

import { KoelschGlassStatus } from "@/components/koelsch-character";
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
          <div className="flex items-center gap-3 border-b border-line bg-paper/45 px-5 py-3.5">
            <KoelschGlassStatus
              level={
                result.total === 0
                  ? "empty"
                  : result.total < 10
                    ? "half"
                    : "full"
              }
              className="h-11 w-auto shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm text-ink-soft">
                {result.total ? (
                  <>
                    <strong className="font-semibold text-ink">
                      {numberFormat.format(result.total)}
                    </strong>{" "}
                    Treffer für „{query}“
                  </>
                ) : (
                  <>Kein Kölsch för „{query}“</>
                )}
              </p>
              {result.limited ? (
                <p className="mt-1 text-xs text-ink-faint">
                  Angezeigt werden die ersten {SEARCH_LIMIT} Einträge. Mit einem
                  genaueren Begriff wird die Liste kürzer.
                </p>
              ) : null}
            </div>
          </div>

          {result.words.length ? (
            <WordList words={result.words} />
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)_92px] items-end overflow-hidden px-5 pt-6 sm:grid-cols-[1fr_150px] sm:px-8">
              <div className="pb-6 text-left sm:pb-8">
                <p className="font-koelsch text-2xl font-semibold text-ink">
                  Nix dobei.
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Dä Köbes meint: Probier et ens kürzer oder anders jeschrevve.
                </p>
              </div>
              <Image
                src="/images/koebes-peters-bronze.png"
                alt="Bronzene Köbes-Skulptur vom Peters Brauhaus mit Kölschkranz"
                width={500}
                height={760}
                sizes="(min-width: 640px) 150px, 92px"
                className="mx-auto -mb-1 h-28 w-auto max-w-none select-none object-contain sm:-mb-3 sm:h-40"
                draggable={false}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5 text-ink-soft">
          <KoelschGlassStatus level="half" className="h-14 w-auto shrink-0" />
          <div>
            <p className="font-medium text-ink">Jiv jet en.</p>
            <p className="mt-1 text-sm">
              Kölsch oder Deutsch – dä Rest kütt von allein.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
