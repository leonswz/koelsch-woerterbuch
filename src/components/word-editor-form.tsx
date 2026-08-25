import Link from "next/link";

import {
  WordStructureFields,
  type EditableMeaning,
  type EditableVariant,
} from "@/components/word-structure-fields";

export type EditableWord = {
  id: number;
  koelsch: string;
  translation: string;
  notes: string | null;
  aliases: string[];
  phonetic: string | null;
  category: string;
  grammaticalGender: string | null;
  article: string | null;
  plural: string | null;
  partOfSpeech: string | null;
  example: string | null;
  exampleTranslation: string | null;
  reviewStatus: string;
  slug: string;
  meanings: EditableMeaning[];
  variants: EditableVariant[];
};

const fieldClass =
  "mt-2 w-full rounded-[var(--radius-control)] border border-line bg-card px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink-faint focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10";

export function WordEditorForm({
  word,
  error,
}: {
  word?: EditableWord;
  error?: string;
}) {
  const meanings = word?.meanings.length
    ? word.meanings
    : [
        {
          translation: word?.translation ?? "",
          definition: null,
          partOfSpeech: word?.partOfSpeech ?? null,
          register: null,
          example: word?.example ?? null,
          exampleTranslation: word?.exampleTranslation ?? null,
        },
      ];
  const variants = word?.variants.length
    ? word.variants
    : (word?.aliases ?? []).map((spelling) => ({ spelling, label: null, region: null }));

  return (
    <form
      action="/api/redaktion/woerter"
      method="post"
      className="grid gap-7 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm sm:p-7"
    >
      {word ? <input type="hidden" name="id" value={word.id} /> : null}

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-control)] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Kölscher Begriff <span className="text-koelsch">*</span>
          <input
            name="koelsch"
            required
            maxLength={120}
            defaultValue={word?.koelsch}
            placeholder="z. B. Kappes"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Aussprache
          <input
            name="phonetic"
            maxLength={120}
            defaultValue={word?.phonetic ?? ""}
            placeholder="z. B. ˈkapəs"
            className={fieldClass}
          />
        </label>
      </div>

      <WordStructureFields meanings={meanings} variants={variants} />

      <section className="grid gap-4 border-t border-line pt-6" aria-labelledby="grammar-heading">
        <div>
          <h2 id="grammar-heading" className="font-koelsch text-2xl font-semibold text-ink">
            Grammatik
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            Artikel, Genus und Plural gehören zum kölschen Lemma und können vom Hochdeutschen abweichen.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="text-sm font-medium text-ink">
            Artikel
            <input
              name="article"
              maxLength={40}
              defaultValue={word?.article ?? ""}
              placeholder="z. B. der, de oder et"
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Genus
            <select
              name="grammaticalGender"
              defaultValue={word?.grammaticalGender ?? ""}
              className={fieldClass}
            >
              <option value="">Noch offen</option>
              <option value="masculine">Maskulinum</option>
              <option value="feminine">Femininum</option>
              <option value="neuter">Neutrum</option>
            </select>
          </label>
          <label className="text-sm font-medium text-ink">
            Plural
            <input
              name="plural"
              maxLength={120}
              defaultValue={word?.plural ?? ""}
              placeholder="z. B. de Pänz"
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      <label className="border-t border-line pt-6 text-sm font-medium text-ink">
        Allgemeine Einordnung <span className="font-normal text-ink-faint">optional</span>
        <textarea
          name="notes"
          maxLength={2000}
          rows={4}
          defaultValue={word?.notes ?? ""}
          placeholder="Etymologie, kultureller Kontext oder ein Hinweis, der für den ganzen Begriff gilt."
          className={fieldClass}
        />
        <span className="mt-2 block text-xs font-normal leading-relaxed text-ink-faint">
          Eine Erklärung, die nur zu einer einzelnen Bedeutung gehört, kommt direkt in deren Karte.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Kategorie
          <input
            name="category"
            defaultValue={word?.category ?? "allgemein"}
            placeholder="allgemein"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Status
          <select
            name="reviewStatus"
            defaultValue={word?.reviewStatus === "published" ? "published" : "draft"}
            className={fieldClass}
          >
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={word ? `/wort/${word.slug}` : "/redaktion"}
          className="rounded-[var(--radius-control)] px-4 py-3 text-center text-sm font-medium text-ink-soft hover:bg-paper-soft hover:text-ink"
        >
          Abbrechen
        </Link>
        <button
          type="submit"
          className="rounded-[var(--radius-control)] bg-koelsch px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-koelsch-deep"
        >
          {word ? "Änderungen speichern" : "Begriff anlegen"}
        </button>
      </div>
    </form>
  );
}
