import type { Metadata } from "next";
import { KoelschSearch } from "@/components/koelsch-search";

export const metadata: Metadata = { title: "Suche" };

export default async function SuchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

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

      <section className="rounded-[var(--radius-card)] border border-line bg-card p-6">
        {query ? (
          <>
            <h2 className="font-koelsch text-2xl font-semibold text-ink">
              Ergebnisse für „{query}“
            </h2>
            <p className="mt-3 text-ink-soft">
              Noch keine Treffer – die Wörter werden gerade aufbereitet.
              Sobald die Daten eingespielt sind, sucht dich dieses Feld durch
              alle Einträge.
            </p>
          </>
        ) : (
          <p className="text-ink-soft">
            Tippe oben ein Wort ein, um zu suchen.
          </p>
        )}
      </section>
    </div>
  );
}
