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
  const meanings = word.meanings.length
    ? word.meanings
    : splitWordMeanings(word.translation).map((translation, position) => ({
        id: -position - 1,
        translation,
        definition: null,
        partOfSpeech: position === 0 ? word.partOfSpeech : null,
        register: null,
        example: position === 0 ? word.example : null,
        exampleTranslation: position === 0 ? word.exampleTranslation : null,
      }));
  const variants = word.variants.length
    ? word.variants
    : word.aliases.map((spelling, position) => ({
        id: -position - 1,
        spelling,
        label: null,
        region: null,
      }));

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
              {meanings.length > 1 ? `${meanings.length} Bedeutungen` : "Bedeutung"}
            </h2>
            <ol className="mt-3 grid gap-3">
              {meanings.map((meaning, index) => (
                <li
                  key={meaning.id}
                  className="rounded-[var(--radius-control)] border border-line bg-paper-soft/65 px-4 py-4 sm:px-5"
                >
                  <div className="flex items-start gap-3">
                    {meanings.length > 1 ? (
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-koelsch-soft text-xs font-semibold text-koelsch-deep">
                        {index + 1}
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-koelsch text-2xl font-semibold leading-snug text-ink">
                        {meaning.translation}
                      </p>
                      {meaning.partOfSpeech || meaning.register ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {meaning.partOfSpeech ? (
                            <span className="rounded-full border border-line bg-card px-2.5 py-1 text-xs text-ink-soft">
                              {meaning.partOfSpeech}
                            </span>
                          ) : null}
                          {meaning.register ? (
                            <span className="rounded-full bg-koelsch-soft px-2.5 py-1 text-xs text-koelsch-deep">
                              {meaning.register}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {meaning.definition ? (
                        <p className="mt-3 leading-7 text-ink-soft">{meaning.definition}</p>
                      ) : null}
                      {meaning.example ? (
                        <div className="mt-4 border-l-2 border-koelsch/30 pl-4">
                          <p className="font-koelsch text-lg text-ink">{meaning.example}</p>
                          {meaning.exampleTranslation ? (
                            <p className="mt-1 text-sm text-ink-soft">
                              {meaning.exampleTranslation}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {explanation ? (
            <section className="rounded-[var(--radius-control)] border border-koelsch/15 bg-koelsch-soft/45 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
                Erklärung
              </h2>
              <p className="mt-2 leading-7 text-ink-soft">{explanation}</p>
            </section>
          ) : null}

          {variants.length ? (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Schreibvarianten
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <span
                    key={variant.id}
                    className="rounded-[var(--radius-control)] border border-line bg-card px-3 py-2 text-sm text-ink"
                  >
                    <span className="font-koelsch font-semibold">{variant.spelling}</span>
                    {variant.label || variant.region ? (
                      <span className="ml-2 text-xs text-ink-faint">
                        {[variant.label, variant.region].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
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
