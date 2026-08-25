import Link from "next/link";

export type EditableWord = {
  id: number;
  koelsch: string;
  translation: string;
  notes: string | null;
  aliases: string[];
  phonetic: string | null;
  category: string;
  partOfSpeech: string | null;
  example: string | null;
  exampleTranslation: string | null;
  reviewStatus: string;
  slug: string;
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
  return (
    <form
      action="/api/redaktion/woerter"
      method="post"
      className="grid gap-6 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm sm:p-7"
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
            placeholder="z. B. Kölle"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Hochdeutsche Bedeutung(en) <span className="text-koelsch">*</span>
          <input
            name="translation"
            required
            maxLength={500}
            defaultValue={word?.translation}
            placeholder="z. B. Kohl; Unsinn"
            className={fieldClass}
          />
          <span className="mt-2 block text-xs font-normal leading-relaxed text-ink-faint">
            Mehrere Bedeutungen mit Semikolon trennen. Sie erscheinen einzeln auf der Wortseite.
          </span>
        </label>
      </div>

      <label className="text-sm font-medium text-ink">
        Erklärung <span className="font-normal text-ink-faint">optional</span>
        <textarea
          name="notes"
          maxLength={2000}
          rows={5}
          defaultValue={word?.notes ?? ""}
          placeholder="Nur ergänzen, wenn Übersetzung allein nicht ausreicht: Bedeutung, Verwendung oder kultureller Kontext."
          className={fieldClass}
        />
        <span className="mt-2 block text-xs leading-relaxed text-ink-faint">
          Bleibt das Feld leer, erscheint auf der Wortseite kein Erklärungskasten.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Aussprache
          <input
            name="phonetic"
            maxLength={120}
            defaultValue={word?.phonetic ?? ""}
            placeholder="z. B. ˈkœlə"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Weitere Schreibweisen
          <input
            name="aliases"
            defaultValue={word?.aliases.join(", ") ?? ""}
            placeholder="Mit Komma trennen"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
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
          Wortart
          <input
            name="partOfSpeech"
            defaultValue={word?.partOfSpeech ?? ""}
            placeholder="z. B. Substantiv"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Beispielsatz auf Kölsch
          <textarea
            name="example"
            rows={3}
            defaultValue={word?.example ?? ""}
            placeholder="Dat es Kölle."
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Beispiel auf Hochdeutsch
          <textarea
            name="exampleTranslation"
            rows={3}
            defaultValue={word?.exampleTranslation ?? ""}
            placeholder="Das ist Köln."
            className={fieldClass}
          />
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
