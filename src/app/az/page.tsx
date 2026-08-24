import type { Metadata } from "next";
import Link from "next/link";
import { KoelschSearch } from "@/components/koelsch-search";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const metadata: Metadata = { title: "Wörter von A–Z" };

export default async function AzPage({
  searchParams,
}: {
  searchParams: Promise<{ buchstabe?: string }>;
}) {
  const { buchstabe } = await searchParams;
  const selected = buchstabe?.toUpperCase() ?? null;

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-koelsch text-3xl font-semibold tracking-tight text-ink">
          Wörter von A–Z
        </h1>
        <p className="mt-2 text-ink-soft">
          Alle Kölsch-Wörter im Überblick. Wähle einen Buchstaben.
        </p>
      </header>

      <KoelschSearch />

      <nav aria-label="Buchstaben" className="flex flex-wrap gap-1.5">
        {letters.map((letter) => {
          const active = selected === letter;
          return (
            <Link
              key={letter}
              href={`/az?buchstabe=${letter.toLowerCase()}`}
              aria-current={active ? "true" : undefined}
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

      <section className="rounded-[var(--radius-card)] border border-line bg-card p-6">
        {selected ? (
          <>
            <h2 className="font-koelsch text-2xl font-semibold text-ink">
              Buchstabe {selected}
            </h2>
            <p className="mt-3 text-ink-soft">
              Für „{selected}“ sind noch keine Wörter eingespielt. Sobald die
              Daten da sind, erscheinen hier alle Einträge.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-koelsch text-2xl font-semibold text-ink">
              Alle Einträge
            </h2>
            <p className="mt-3 text-ink-soft">
              Wähle oben einen Buchstaben, um die Einträge zu sehen.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
