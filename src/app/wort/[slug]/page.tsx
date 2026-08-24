import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getWordBySlug } from "@/lib/words";

export const metadata: Metadata = { title: "Wort" };

export default async function WortPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const word = await getWordBySlug(slug);
  if (!word) notFound();

  return (
    <div className="grid gap-6">
      <Link href="/az" className="text-sm text-koelsch hover:underline">
        ← Zurück zu A–Z
      </Link>

      <article className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card shadow-sm">
        <header className="border-b border-line bg-paper/45 px-6 py-7 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
            Kölsch
          </p>
          <h1 className="mt-2 font-koelsch text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {word.koelsch}
          </h1>
          {word.phonetic ? (
            <p className="mt-2 text-sm text-ink-faint">[{word.phonetic}]</p>
          ) : null}
        </header>

        <div className="grid gap-7 px-6 py-7 sm:px-8">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Hochdeutsch
            </h2>
            <p className="mt-2 font-koelsch text-2xl font-semibold leading-snug text-ink">
              {word.translation}
            </p>
          </section>

          {word.aliases.length ? (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Weitere Schreibweisen
              </h2>
              <p className="mt-2 text-ink-soft">{word.aliases.join(", ")}</p>
            </section>
          ) : null}

          {word.example ? (
            <section className="rounded-[var(--radius-control)] bg-paper-soft px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Beispiel
              </h2>
              <p className="mt-2 font-koelsch text-lg text-ink">{word.example}</p>
              {word.exampleTranslation ? (
                <p className="mt-1 text-sm text-ink-soft">
                  {word.exampleTranslation}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      </article>
    </div>
  );
}
