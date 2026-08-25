import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getEditorSession } from "@/lib/editor-session";
import { splitWordMeanings } from "@/lib/word-meanings";
import { buildWordExplanation } from "@/lib/word-relations";
import { getRelatedWords, getWordBySlug } from "@/lib/words";

export const metadata: Metadata = { title: "Wort" };

export default async function WortPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const word = await getWordBySlug(slug);
  if (!word) notFound();
  const [relatedWords, editor] = await Promise.all([
    getRelatedWords(word),
    getEditorSession(),
  ]);
  const explanation = buildWordExplanation(word);
  const meanings = splitWordMeanings(word.translation);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/az" className="text-sm text-koelsch hover:underline">
          ← Zurück zu A–Z
        </Link>
        {editor ? (
          <Link
            href={`/redaktion/woerter/${word.id}`}
            className="rounded-[var(--radius-control)] border border-line bg-card px-4 py-2 text-sm font-medium text-ink-soft shadow-sm hover:border-koelsch/30 hover:text-koelsch"
          >
            Bearbeiten
          </Link>
        ) : null}
      </div>

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
              {meanings.length > 1 ? "Bedeutungen & Formen" : "Hochdeutsch"}
            </h2>
            {meanings.length > 1 ? (
              <ol className="mt-3 grid gap-2">
                {meanings.map((meaning, index) => (
                  <li
                    key={`${meaning}-${index}`}
                    className="flex items-start gap-3 rounded-[var(--radius-control)] bg-paper-soft px-4 py-3"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-koelsch-soft text-xs font-semibold text-koelsch-deep">
                      {index + 1}
                    </span>
                    <span className="font-koelsch text-xl font-semibold leading-snug text-ink">
                      {meaning}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 font-koelsch text-2xl font-semibold leading-snug text-ink">
                {word.translation}
              </p>
            )}
          </section>

          {explanation ? (
            <section className="rounded-[var(--radius-control)] border border-koelsch/15 bg-koelsch-soft/45 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
                Erklärung
              </h2>
              <p className="mt-2 leading-7 text-ink-soft">{explanation}</p>
            </section>
          ) : null}

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

      {relatedWords.length ? (
        <section aria-labelledby="related-words-heading" className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
              Weiterstöbern
            </p>
            <h2
              id="related-words-heading"
              className="mt-1 font-koelsch text-2xl font-semibold text-ink"
            >
              Ähnliche Begriffe
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedWords.map((related) => (
              <Link
                key={related.slug}
                href={`/wort/${related.slug}`}
                className="group flex min-w-0 items-center justify-between gap-4 rounded-[var(--radius-control)] border border-line bg-card px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-koelsch/30 hover:shadow-md"
              >
                <span className="min-w-0">
                  <span className="block truncate font-koelsch text-xl font-semibold text-ink group-hover:text-koelsch-deep">
                    {related.koelsch}
                  </span>
                  <span className="mt-1 block truncate text-sm text-ink-soft">
                    {related.translation}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-lg text-koelsch transition group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
