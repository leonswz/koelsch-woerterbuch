import Image from "next/image";
import Link from "next/link";
import { KoelschGlassStatus } from "@/components/koelsch-character";
import { KoelschSearch } from "@/components/koelsch-search";
import { countWords, getWordOfTheDay } from "@/lib/words";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const [wordCount, wordOfTheDay] = await Promise.all([
    countWords(),
    getWordOfTheDay(),
  ]);

  return (
    <div className="grid gap-10">
      <section className="grid items-center gap-8 pt-6 sm:grid-cols-[1fr_auto]">
        <div className="text-center sm:text-left">
          <p className="mb-3 text-sm font-medium tracking-wide text-koelsch">
            Et Kölsch Wörterbuch
          </p>
          <h1 className="font-koelsch text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Wat heißt dat op Kölsch?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft sm:mx-0">
            Wörter, Lieder und Sprichwörter aus Köln – ruhig nachschlagen,
            verstehen und weitersagen.
          </p>
          <div className="mx-auto mt-8 max-w-xl sm:mx-0">
            <KoelschSearch autoFocus />
          </div>
        </div>
        <Image
          src="/images/koelsch-glass-photo.png"
          alt="Eine fotografierte Kölsch-Stange mit goldgelbem Bier und Schaumkrone"
          width={434}
          height={1365}
          priority
          sizes="(min-width: 640px) 104px, 0px"
          className="mx-auto hidden h-64 w-auto select-none drop-shadow-[0_18px_18px_rgba(74,48,26,0.18)] sm:block sm:h-80 sm:-translate-x-3"
          draggable={false}
        />
      </section>

      {wordOfTheDay ? (
        <section className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-[#f8f1e7] shadow-sm">
          <div className="grid min-h-[210px] grid-cols-[minmax(0,1fr)_92px] sm:grid-cols-[minmax(0,1fr)_210px]">
            <div className="relative z-10 flex flex-col justify-center px-5 py-6 sm:px-8">
              <div className="mb-3 flex items-center gap-2.5 text-sm font-medium text-koelsch">
                <KoelschGlassStatus level="full" className="h-9 w-auto" />
                <span>
                  Hück för dich
                  <span className="hidden sm:inline"> · Wort des Tages</span>
                </span>
              </div>
              <h2 className="font-koelsch text-4xl font-semibold leading-none tracking-tight text-ink sm:text-5xl">
                {wordOfTheDay.koelsch}
              </h2>
              {wordOfTheDay.phonetic ? (
                <p className="mt-2 text-sm text-ink-faint">
                  [{wordOfTheDay.phonetic}]
                </p>
              ) : null}
              <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-soft">
                {wordOfTheDay.translation}
              </p>
              <Link
                href={`/wort/${wordOfTheDay.slug}`}
                className="mt-3 inline-flex min-h-10 w-fit items-center text-sm font-medium text-koelsch underline-offset-4 hover:underline"
              >
                Dat Wood ansehen →
              </Link>
            </div>

            <div className="relative flex items-end justify-center overflow-hidden">
              <div className="absolute inset-x-1 bottom-3 top-8 rounded-full bg-koelsch-soft/70 blur-xl sm:inset-x-3 sm:top-3 sm:blur-2xl" />
              <Image
                src="/images/koebes-peters-bronze.png"
                alt="Bronzene Köbes-Skulptur vom Peters Brauhaus mit Kölschkranz"
                width={500}
                height={760}
                sizes="(min-width: 640px) 210px, 92px"
                className="relative -mb-1 h-[150px] w-auto max-w-none select-none object-contain sm:-mb-3 sm:h-[220px]"
                draggable={false}
              />
            </div>
          </div>
        </section>
      ) : null}

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
          <strong className="font-semibold text-ink">
            {new Intl.NumberFormat("de-DE").format(wordCount)} Wörter
          </strong>{" "}
          sind aktuell durchsuchbar.
        </p>
      </section>
    </div>
  );
}
