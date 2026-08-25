import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getEditorSession } from "@/lib/editor-session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Redaktion" };

export default async function RedaktionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await getEditorSession())) redirect("/");
  const { q = "" } = await searchParams;
  const query = q.trim();
  const words = await prisma.word.findMany({
    where: query
      ? {
          OR: [
            { koelsch: { contains: query, mode: "insensitive" } },
            { translation: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      koelsch: true,
      translation: true,
      slug: true,
      notes: true,
      reviewStatus: true,
      updatedAt: true,
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 60,
  });

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
            Nur für Leon
          </p>
          <h1 className="mt-2 font-koelsch text-4xl font-semibold text-ink">
            Redaktion
          </h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Begriffe anlegen, Übersetzungen verbessern und nur dort Erklärungen
            ergänzen, wo sie wirklich helfen.
          </p>
        </div>
        <Link
          href="/redaktion/woerter/neu"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-koelsch px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-koelsch-deep"
        >
          <Plus className="size-4" />
          Neuer Begriff
        </Link>
      </header>

      <form className="relative" role="search">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Begriff oder Übersetzung suchen …"
          className="w-full rounded-[var(--radius-control)] border border-line bg-card py-3.5 pl-12 pr-4 text-base text-ink shadow-sm outline-none focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10"
        />
      </form>

      <section className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-koelsch text-xl font-semibold text-ink">
            {query ? `Treffer für „${query}“` : "Zuletzt bearbeitet"}
          </h2>
          <span className="text-xs text-ink-faint">{words.length} angezeigt</span>
        </div>
        {words.length ? (
          <div className="divide-y divide-line">
            {words.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <Link href={`/wort/${word.slug}`} className="min-w-0 group">
                  <span className="block truncate font-koelsch text-lg font-semibold text-ink group-hover:text-koelsch">
                    {word.koelsch}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-soft">
                    {word.translation}
                  </span>
                  <span className="mt-1 block text-xs text-ink-faint">
                    {word.notes?.trim() ? "Mit Erklärung" : "Ohne Erklärung"} · {word.reviewStatus}
                  </span>
                </Link>
                <Link
                  href={`/redaktion/woerter/${word.id}`}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-line text-ink-soft transition hover:border-koelsch/30 hover:bg-koelsch-soft hover:text-koelsch"
                  aria-label={`${word.koelsch} bearbeiten`}
                >
                  <Pencil className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-ink-faint">
            Keine passenden Begriffe gefunden.
          </p>
        )}
      </section>
    </div>
  );
}
