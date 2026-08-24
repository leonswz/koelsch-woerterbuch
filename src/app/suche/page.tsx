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
              className="h-10 w-auto shrink-0"
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
            <div className="grid items-end overflow-hidden px-5 pt-8 sm:grid-cols-[1fr_150px] sm:px-8 sm:pt-6">
              <div className="pb-8 text-center sm:text-left">
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
                sizes="150px"
                className="mx-auto -mb-8 hidden h-40 w-auto select-none object-contain sm:block"
                draggable={false}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5 text-ink-soft">
          <KoelschGlassStatus level="half" className="h-12 w-auto shrink-0" />
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
