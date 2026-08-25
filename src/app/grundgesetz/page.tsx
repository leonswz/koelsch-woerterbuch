import { BookOpenText } from "lucide-react";

import { koelschGrundgesetz } from "@/lib/koelsch-grundgesetz";

export const metadata = {
  title: "Das Kölsche Grundgesetz",
  description: "Die elf Artikel des Kölschen Grundgesetzes – mit hochdeutscher Übersetzung und verständlicher Einordnung.",
};

export default function GrundgesetzPage() {
  return (
    <div className="grid gap-8">
      <header className="text-center">
        <BookOpenText className="mx-auto size-10 text-koelsch" strokeWidth={1.5} />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-koelsch">
          Et kölsche Jrundjesetz
        </p>
        <h1 className="mt-2 font-koelsch text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Das Kölsche Grundgesetz
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-ink-soft">
          Elf rheinische Lebensregeln über Gelassenheit, Wandel, Gastfreundschaft
          und die Kunst, sich selbst nicht zu ernst zu nehmen.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {koelschGrundgesetz.map((article) => (
          <article
            key={article.number}
            className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-card p-6 shadow-sm"
          >
            <span className="absolute right-4 top-2 font-koelsch text-6xl font-semibold text-koelsch/8">
              {article.number}
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
              Artikel {article.number}
            </p>
            <h2 className="relative mt-3 pr-8 font-koelsch text-2xl font-semibold leading-snug text-ink">
              {article.koelsch}
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-soft">
              {article.translation}
            </p>
            <p className="mt-4 border-t border-line pt-4 text-sm leading-6 text-ink-faint">
              {article.meaning}
            </p>
          </article>
        ))}
      </div>

      <aside className="rounded-[var(--radius-card)] border border-line bg-paper-soft p-6 text-sm leading-6 text-ink-soft">
        <h2 className="font-koelsch text-xl font-semibold text-ink">Woher kommt es?</h2>
        <p className="mt-3">
          Die elf Redensarten waren schon als rheinische Lebensweisheiten im Umlauf.
          Wer sie ursprünglich formuliert hat und wann sie entstanden sind, ist nicht
          bekannt. Als zusammenhängendes „Rheinisches Grundgesetz“ veröffentlichte
          Konrad Beikircher sie 2001 in seinem Buch <cite>Et kütt wie et kütt – Das
          Rheinische Grundgesetz</cite>. Die kölsche Bezeichnung ist heute die
          geläufigste Variante.
        </p>
        <p className="mt-3 text-xs text-ink-faint">
          Schreibweisen unterscheiden sich je nach Quelle und kölscher Sprachvariante.
          Übersetzungen und Einordnungen auf dieser Seite sind redaktionell formuliert.
          Quelle zur Überlieferung:{" "}
          <a
            href="https://de.wikipedia.org/wiki/Das_Rheinische_Grundgesetz"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-koelsch"
          >
            Das Rheinische Grundgesetz
          </a>.
        </p>
      </aside>
    </div>
  );
}
