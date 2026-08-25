import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Sprichwörter" };

export default async function SprichwoerterPage() {
  const proverbs = await prisma.proverb.findMany({ orderBy: { koelsch: "asc" } });
  return <div className="grid gap-6">
    <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">Kölsche Weisheit</p><h1 className="mt-2 font-koelsch text-4xl font-semibold text-ink">Sprichwörter</h1><p className="mt-2 text-ink-soft">Rheinische Redensarten – übersetzt und dort erklärt, wo der Wortlaut allein nicht reicht.</p></header>
    {proverbs.length ? <div className="grid gap-4">{proverbs.map((proverb) => <article key={proverb.id} className="rounded-[var(--radius-card)] border border-line bg-card p-6 shadow-sm">
      <p className="font-koelsch text-2xl font-semibold leading-snug text-ink">„{proverb.koelsch}“</p>
      <p className="mt-3 text-ink-soft">{proverb.translation}</p>
      {proverb.explanation ? <div className="mt-4 rounded-xl bg-koelsch-soft/45 px-4 py-3 text-sm leading-6 text-ink-soft"><span className="font-semibold text-koelsch-deep">Erklärung: </span>{proverb.explanation}</div> : null}
    </article>)}</div> : <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-card p-10 text-center text-ink-faint">Noch keine Sprichwörter eingetragen.</div>}
  </div>;
}
