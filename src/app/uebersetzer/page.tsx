import { ArrowRightLeft } from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { translateCuratedText, type TranslationDirection } from "@/lib/translator";

export const metadata = { title: "Kölsch Übersetzer" };

export default async function UebersetzerPage({ searchParams }: { searchParams: Promise<{ text?: string; direction?: string }> }) {
  const params = await searchParams;
  const text = (params.text ?? "").slice(0, 500);
  const direction: TranslationDirection = params.direction === "koelsch-de" ? "koelsch-de" : "de-koelsch";
  const words = text.trim() ? await prisma.word.findMany({ select: { id: true, slug: true, koelsch: true, translation: true, aliases: true } }) : [];
  const result = text.trim() ? translateCuratedText(text, words, direction) : null;

  return <div className="grid gap-7">
    <header className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">Übersetzen & verstehen</p><h1 className="mt-2 font-koelsch text-4xl font-semibold text-ink sm:text-5xl">Deutsch ↔ Kölsch</h1><p className="mx-auto mt-3 max-w-2xl text-ink-soft">Kuratiert statt erfunden: Der Übersetzer verwendet unsere gepflegten Begriffe und zeigt offen, welche Wörter er noch nicht kennt.</p></header>

    <form className="grid gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm sm:p-7">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <label className="text-center"><input type="radio" name="direction" value="de-koelsch" defaultChecked={direction === "de-koelsch"} className="peer sr-only" /><span className="block cursor-pointer rounded-xl border border-line px-3 py-3 text-sm font-semibold text-ink-soft peer-checked:border-koelsch/40 peer-checked:bg-koelsch-soft peer-checked:text-koelsch-deep">Deutsch → Kölsch</span></label>
        <ArrowRightLeft className="size-5 text-ink-faint" />
        <label className="text-center"><input type="radio" name="direction" value="koelsch-de" defaultChecked={direction === "koelsch-de"} className="peer sr-only" /><span className="block cursor-pointer rounded-xl border border-line px-3 py-3 text-sm font-semibold text-ink-soft peer-checked:border-koelsch/40 peer-checked:bg-koelsch-soft peer-checked:text-koelsch-deep">Kölsch → Deutsch</span></label>
      </div>
      <label className="text-sm font-medium text-ink">Dein Text<textarea name="text" required maxLength={500} rows={5} defaultValue={text} placeholder={direction === "de-koelsch" ? "Guten Morgen, Köln!" : "Jode Morje, Kölle!"} className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-lg leading-7 outline-none focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10" /></label>
      <button className="rounded-xl bg-koelsch px-6 py-3.5 font-semibold text-white shadow-sm hover:bg-koelsch-deep">Übersetzen</button>
    </form>

    {result ? <section className="grid gap-5 rounded-[var(--radius-card)] border border-koelsch/20 bg-koelsch-soft/35 p-6 sm:p-8" aria-live="polite">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">Übersetzung</p><p className="mt-3 font-koelsch text-3xl font-semibold leading-snug text-ink">{result.text}</p></div>
      {result.matches.length ? <div className="border-t border-koelsch/15 pt-4"><p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Erkannte Begriffe</p><div className="mt-3 flex flex-wrap gap-2">{result.matches.map((match, index) => <Link key={`${match.slug}-${index}`} href={`/wort/${match.slug}`} className="rounded-full border border-koelsch/20 bg-card px-3 py-1.5 text-sm text-ink-soft hover:text-koelsch"><span className="font-medium">{match.source}</span> → {match.target}</Link>)}</div></div> : null}
      {result.unmatchedWords ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">{result.unmatchedWords} {result.unmatchedWords === 1 ? "Wort wurde" : "Wörter wurden"} noch nicht übersetzt und deshalb unverändert gelassen. So erfindet der Übersetzer keine falschen kölschen Formen.</p> : <p className="text-sm font-medium text-green-800">Alle Wörter wurden in der kuratierten Sammlung gefunden.</p>}
    </section> : null}

    <p className="text-center text-xs leading-5 text-ink-faint">Aktuell ist dies die verlässliche, datenbasierte Version. Satzbau und Grammatik werden mit der wachsenden Redaktion schrittweise verbessert.</p>
  </div>;
}
