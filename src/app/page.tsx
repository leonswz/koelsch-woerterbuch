import Link from "next/link";
import { KoelschSearch } from "@/components/koelsch-search";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const categories = [
  {
    href: "/az",
    title: "Wörter von A–Z",
    text: "Alle Kölsch-Wörter mit Übersetzung, Lautschrift und Beispielen.",
  },
  {
    href: "/lieder",
    title: "Karnevalslieder",
    text: "Liedtexte mit deutscher Übersetzung – von Brings bis Bläck Fööss.",
  },
  {
    href: "/sprichwoerter",
    title: "Sprichwörter",
    text: "Rheinische Redensarten und was sie wirklich bedeuten.",
  },
];

export default function Home() {
  return (
    <div className="grid gap-10">
      <section className="pt-6 text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-koelsch">
          Et Kölsch Wörterbuch
        </p>
        <h1 className="font-koelsch text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          Wat heißt dat op Kölsch?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Wörter, Lieder und Sprichwörter aus Köln – ruhig nachschlagen,
          verstehen und weitersagen.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <KoelschSearch autoFocus />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm transition hover:border-koelsch/40 hover:shadow-md"
          >
            <h2 className="font-koelsch text-xl font-semibold text-ink group-hover:text-koelsch">
              {category.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {category.text}
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-card p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-koelsch text-2xl font-semibold text-ink">
            Wörter von A–Z
          </h2>
          <Link href="/az" className="text-sm text-koelsch hover:underline">
            Alle ansehen
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <Link
              key={letter}
              href={`/az?buchstabe=${letter.toLowerCase()}`}
              className="grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-paper text-sm font-semibold text-ink-soft transition hover:border-koelsch/40 hover:text-koelsch"
            >
              {letter}
            </Link>
          ))}
        </div>
        <p className="mt-5 rounded-[var(--radius-control)] bg-paper-soft px-4 py-3 text-sm text-ink-soft">
          Die Wörter werden gerade aufbereitet – sobald die Daten eingespielt
          sind, findest du hier jeden Buchstaben mit allen Einträgen.
        </p>
      </section>
    </div>
  );
}
