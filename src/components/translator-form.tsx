"use client";

import { ArrowRightLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import type {
  TranslationDirection,
  TranslationResult,
} from "@/lib/translator";

type TranslatorFormProps = {
  initialText: string;
  initialDirection: TranslationDirection;
  initialResult: TranslationResult | null;
};

export function TranslatorForm({
  initialText,
  initialDirection,
  initialResult,
}: TranslatorFormProps) {
  const [text, setText] = useState(initialText);
  const [direction, setDirection] = useState(initialDirection);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function translate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch("/api/uebersetzen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, direction }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as TranslationResult | { error?: string };
      if (!response.ok || !("text" in payload)) {
        throw new Error("error" in payload && payload.error ? payload.error : "Die Übersetzung hat nicht geklappt.");
      }

      setResult(payload);
      const query = new URLSearchParams({ text: trimmed, direction });
      window.history.replaceState(null, "", `/uebersetzer?${query.toString()}`);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError(cause instanceof Error ? cause.message : "Die Übersetzung hat nicht geklappt.");
      setResult(null);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsPending(false);
      }
    }
  }

  function chooseDirection(nextDirection: TranslationDirection) {
    if (nextDirection === direction) return;
    setDirection(nextDirection);
    setResult(null);
    setError(null);
  }

  return (
    <div className="grid gap-5">
      <form
        onSubmit={translate}
        className="grid gap-5 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm sm:p-7"
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            onClick={() => chooseDirection("de-koelsch")}
            aria-pressed={direction === "de-koelsch"}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
              direction === "de-koelsch"
                ? "border-koelsch/40 bg-koelsch-soft text-koelsch-deep"
                : "border-line text-ink-soft hover:border-koelsch/25 hover:text-ink"
            }`}
          >
            Deutsch → Kölsch
          </button>
          <ArrowRightLeft className="size-5 text-ink-faint" aria-hidden="true" />
          <button
            type="button"
            onClick={() => chooseDirection("koelsch-de")}
            aria-pressed={direction === "koelsch-de"}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
              direction === "koelsch-de"
                ? "border-koelsch/40 bg-koelsch-soft text-koelsch-deep"
                : "border-line text-ink-soft hover:border-koelsch/25 hover:text-ink"
            }`}
          >
            Kölsch → Deutsch
          </button>
        </div>

        <label className="text-sm font-medium text-ink">
          Dein Text
          <textarea
            required
            maxLength={500}
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={direction === "de-koelsch" ? "Guten Morgen, Köln!" : "Jode Morje, Kölle!"}
            className="mt-2 w-full resize-y rounded-xl border border-line bg-paper px-4 py-3 text-lg leading-7 outline-none transition focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10"
          />
          <span className="mt-1 block text-right text-xs font-normal text-ink-faint">
            {text.length}/500
          </span>
        </label>

        <button
          type="submit"
          disabled={!text.trim() || isPending}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-koelsch px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-koelsch-deep disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isPending ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              Wird übersetzt …
            </>
          ) : (
            "Übersetzen"
          )}
        </button>
      </form>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {result ? (
        <section
          className="grid gap-5 rounded-[var(--radius-card)] border border-koelsch/20 bg-koelsch-soft/35 p-6 sm:p-8"
          aria-live="polite"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
              Übersetzung
            </p>
            <p className="mt-3 font-koelsch text-3xl font-semibold leading-snug text-ink">
              {result.text}
            </p>
          </div>

          {result.matches.length ? (
            <div className="border-t border-koelsch/15 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Erkannte Begriffe
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.matches.map((match, index) => (
                  <Link
                    key={`${match.slug}-${index}`}
                    href={`/wort/${match.slug}`}
                    className="rounded-full border border-koelsch/20 bg-card px-3 py-1.5 text-sm text-ink-soft hover:text-koelsch"
                  >
                    <span className="font-medium">{match.source}</span> → {match.target}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {result.unmatchedWords ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              {result.unmatchedWords} {result.unmatchedWords === 1 ? "Wort wurde" : "Wörter wurden"} noch nicht übersetzt und deshalb unverändert gelassen. So erfindet der Übersetzer keine falschen kölschen Formen.
            </p>
          ) : (
            <p className="text-sm font-medium text-green-800">
              Alle Wörter wurden in der kuratierten Sammlung gefunden.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
