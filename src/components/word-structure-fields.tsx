"use client";

import { useRef, useState } from "react";

export type EditableMeaning = {
  translation: string;
  definition: string | null;
  partOfSpeech: string | null;
  register: string | null;
  example: string | null;
  exampleTranslation: string | null;
};

export type EditableVariant = {
  spelling: string;
  label: string | null;
  region: string | null;
};

type MeaningRow = EditableMeaning & { key: number };
type VariantRow = EditableVariant & { key: number };

const fieldClass =
  "mt-2 w-full rounded-[var(--radius-control)] border border-line bg-card px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink-faint focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10";

function blankMeaning(key: number): MeaningRow {
  return {
    key,
    translation: "",
    definition: null,
    partOfSpeech: null,
    register: null,
    example: null,
    exampleTranslation: null,
  };
}

function blankVariant(key: number): VariantRow {
  return { key, spelling: "", label: null, region: null };
}

function move<T>(items: T[], from: number, to: number) {
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function WordStructureFields({
  meanings: initialMeanings,
  variants: initialVariants,
}: {
  meanings: EditableMeaning[];
  variants: EditableVariant[];
}) {
  const nextKey = useRef(initialMeanings.length + initialVariants.length + 1);
  const [meanings, setMeanings] = useState<MeaningRow[]>(
    (initialMeanings.length ? initialMeanings : [blankMeaning(0)]).map((meaning, index) => ({
      ...meaning,
      key: index,
    })),
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initialVariants.map((variant, index) => ({
      ...variant,
      key: initialMeanings.length + index,
    })),
  );

  return (
    <>
      <input type="hidden" name="translation" value={meanings.map((item) => item.translation).join("; ")} />
      <input type="hidden" name="aliases" value={variants.map((item) => item.spelling).join(", ")} />

      <section className="grid gap-4" aria-labelledby="meanings-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
              Wörterbuchstruktur
            </p>
            <h2 id="meanings-heading" className="mt-1 font-koelsch text-2xl font-semibold text-ink">
              Bedeutungen
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
              Jede Bedeutung bekommt ihren eigenen Gebrauch, ihre eigene Erklärung und eigene Beispiele.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMeanings((current) => [...current, blankMeaning(nextKey.current++)]);
            }}
            className="rounded-[var(--radius-control)] border border-koelsch/30 bg-koelsch-soft px-4 py-2 text-sm font-semibold text-koelsch-deep hover:bg-koelsch/15"
          >
            + Bedeutung hinzufügen
          </button>
        </div>

        <div className="grid gap-4">
          {meanings.map((meaning, index) => (
            <fieldset
              key={meaning.key}
              className="grid gap-4 rounded-[var(--radius-card)] border border-line bg-paper-soft/55 p-4 sm:p-5"
            >
              <legend className="px-2 font-koelsch text-lg font-semibold text-ink">
                Bedeutung {index + 1}
              </legend>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <label className="text-sm font-medium text-ink">
                  Hochdeutsch <span className="text-koelsch">*</span>
                  <input
                    name="meaningTranslation"
                    required
                    maxLength={500}
                    value={meaning.translation}
                    onChange={(event) => {
                      const value = event.target.value;
                      setMeanings((current) =>
                        current.map((item) =>
                          item.key === meaning.key ? { ...item, translation: value } : item,
                        ),
                      );
                    }}
                    placeholder="z. B. Unsinn"
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Wortart
                  <input
                    name="meaningPartOfSpeech"
                    defaultValue={meaning.partOfSpeech ?? ""}
                    placeholder="z. B. Substantiv"
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Gebrauch
                  <input
                    name="meaningRegister"
                    defaultValue={meaning.register ?? ""}
                    placeholder="z. B. umgangssprachlich"
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className="text-sm font-medium text-ink">
                Erklärung dieser Bedeutung
                <textarea
                  name="meaningDefinition"
                  rows={2}
                  maxLength={1000}
                  defaultValue={meaning.definition ?? ""}
                  placeholder="Wann wird genau diese Bedeutung verwendet?"
                  className={fieldClass}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-ink">
                  Beispiel auf Kölsch
                  <textarea
                    name="meaningExample"
                    rows={2}
                    defaultValue={meaning.example ?? ""}
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Beispiel auf Hochdeutsch
                  <textarea
                    name="meaningExampleTranslation"
                    rows={2}
                    defaultValue={meaning.exampleTranslation ?? ""}
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setMeanings((current) => move(current, index, index - 1))}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-ink-soft hover:bg-card disabled:opacity-30"
                >
                  ↑ Nach oben
                </button>
                <button
                  type="button"
                  disabled={index === meanings.length - 1}
                  onClick={() => setMeanings((current) => move(current, index, index + 1))}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-ink-soft hover:bg-card disabled:opacity-30"
                >
                  ↓ Nach unten
                </button>
                {meanings.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setMeanings((current) => current.filter((item) => item.key !== meaning.key))
                    }
                    className="rounded-lg px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Entfernen
                  </button>
                ) : null}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="grid gap-4 border-t border-line pt-6" aria-labelledby="variants-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="variants-heading" className="font-koelsch text-2xl font-semibold text-ink">
              Schreibvarianten
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              Belegte Alternativen mit Einordnung statt einer unkommentierten Kommaliste.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVariants((current) => [...current, blankVariant(nextKey.current++)])}
            className="rounded-[var(--radius-control)] border border-line bg-card px-4 py-2 text-sm font-semibold text-ink-soft hover:border-koelsch/30 hover:text-koelsch"
          >
            + Variante hinzufügen
          </button>
        </div>

        {variants.length ? (
          <div className="grid gap-3">
            {variants.map((variant) => (
              <div
                key={variant.key}
                className="grid gap-3 rounded-[var(--radius-control)] border border-line bg-paper-soft/55 p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end"
              >
                <label className="text-sm font-medium text-ink">
                  Schreibweise
                  <input name="variantSpelling" required defaultValue={variant.spelling} className={fieldClass} />
                </label>
                <label className="text-sm font-medium text-ink">
                  Einordnung
                  <input
                    name="variantLabel"
                    defaultValue={variant.label ?? ""}
                    placeholder="z. B. historisch"
                    className={fieldClass}
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Region
                  <input
                    name="variantRegion"
                    defaultValue={variant.region ?? ""}
                    placeholder="optional"
                    className={fieldClass}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setVariants((current) => current.filter((item) => item.key !== variant.key))
                  }
                  className="mb-0.5 rounded-lg px-3 py-3 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-[var(--radius-control)] border border-dashed border-line px-4 py-5 text-sm text-ink-faint">
            Noch keine weitere Schreibweise hinterlegt.
          </p>
        )}
      </section>
    </>
  );
}
