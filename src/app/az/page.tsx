import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { KoelschSearch } from "@/components/koelsch-search";
import { WordList } from "@/components/word-list";
import { normalizeLetter, normalizePage } from "@/lib/word-query";
import { listWordsByLetter } from "@/lib/words";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const numberFormat = new Intl.NumberFormat("de-DE");

export const metadata: Metadata = { title: "Wörter von A–Z" };

function pageHref(letter: string, page: number) {
  const parameters = new URLSearchParams({ buchstabe: letter.toLowerCase() });
  if (page > 1) parameters.set("seite", String(page));
  return `/az?${parameters}`;
}

export default async function AzPage({
  searchParams,
}: {
  searchParams: Promise<{ buchstabe?: string; seite?: string }>;
}) {
  const parameters = await searchParams;
  const selected = normalizeLetter(parameters.buchstabe) ?? "A";
  const requestedPage = normalizePage(parameters.seite);
  const result = await listWordsByLetter(selected, requestedPage);

  if (requestedPage > result.pageCount) {
    redirect(pageHref(selected, result.pageCount));
  }

  return (
    <div className="grid gap-8">
      <header>
        <p className="text-sm font-medium text-koelsch">
          {numberFormat.format(result.total)} Einträge
        </p>
        <h1 className="mt-1 font-koelsch text-3xl font-semibold tracking-tight text-ink">
          Wörter von A–Z
        </h1>
        <p className="mt-2 text-ink-soft">
          Kölsche Begriffe und ihre hochdeutsche Bedeutung.
        </p>
      </header>

      <KoelschSearch />

      <nav aria-label="Buchstaben" className="flex flex-wrap gap-1.5">
        {letters.map((letter) => {
          const active = selected === letter;
          return (
            <Link
              key={letter}
              href={pageHref(letter, 1)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "grid h-10 w-10 place-items-center rounded-[10px] bg-koelsch text-sm font-semibold text-white"
                  : "grid h-10 w-10 place-items-center rounded-[10px] border border-line bg-card text-sm font-semibold text-ink-soft transition hover:border-koelsch/40 hover:text-koelsch"
              }
            >
              {letter}
            </Link>
          );
        })}
      </nav>

      <section className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card shadow-sm">
        <div className="flex items-end justify-between border-b border-line bg-paper/45 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Buchstabe
            </p>
            <h2 className="font-koelsch text-3xl font-semibold text-ink">
              {selected}
            </h2>
          </div>
          {result.pageCount > 1 ? (
            <p className="text-sm text-ink-faint">
              Seite {result.page} von {result.pageCount}
            </p>
          ) : null}
        </div>

        {result.words.length ? (
          <WordList words={result.words} />
        ) : (
          <p className="px-5 py-10 text-center text-ink-soft">
            Für {selected} gibt es noch keine Einträge.
          </p>
        )}
      </section>

      {result.pageCount > 1 ? (
        <nav aria-label="Seitennavigation" className="flex items-center justify-between gap-4">
          {result.page > 1 ? (
            <Link
              href={pageHref(selected, result.page - 1)}
              className="rounded-[var(--radius-control)] border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink transition hover:border-koelsch/35 hover:text-koelsch"
            >
              ← Vorherige
            </Link>
          ) : (
            <span />
          )}
          {result.page < result.pageCount ? (
            <Link
              href={pageHref(selected, result.page + 1)}
              className="rounded-[var(--radius-control)] border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink transition hover:border-koelsch/35 hover:text-koelsch"
            >
              Nächste →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
