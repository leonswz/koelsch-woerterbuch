"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import type { WordSuggestion } from "@/lib/word-query";

const examples = ["Kölle", "Liebe", "Karneval"];

export function KoelschSearch({
  initial = "",
  autoFocus = false,
}: {
  initial?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listboxId = useId();
  const interacted = useRef(false);
  const [query, setQuery] = useState(initial);
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/suggestions?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Vorschläge konnten nicht geladen werden.");
        const data = (await response.json()) as { suggestions?: WordSuggestion[] };
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmedQuery]);

  function openWord(word: WordSuggestion) {
    setOpen(false);
    router.push(`/wort/${word.slug}`);
  }

  function showAllResults(value = trimmedQuery) {
    const normalized = value.trim();
    if (!normalized) return;
    setOpen(false);
    router.push(`/suche?q=${encodeURIComponent(normalized)}`);
  }

  const optionCount = suggestions.length + 1;

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          openWord(suggestions[activeIndex]);
          return;
        }
        showAllResults();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      className="relative z-30"
    >
      <span className="pointer-events-none absolute left-4 top-7 -translate-y-1/2 text-ink-faint">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        role="combobox"
        value={query}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        onPointerDown={() => {
          interacted.current = true;
          setOpen(true);
        }}
        onFocus={() => {
          if (interacted.current || trimmedQuery) setOpen(true);
        }}
        onChange={(event) => {
          const nextQuery = event.target.value;
          interacted.current = true;
          setQuery(nextQuery);
          setActiveIndex(-1);
          setLoading(nextQuery.trim().length >= 2);
          if (nextQuery.trim().length < 2) setSuggestions([]);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          interacted.current = true;
          if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            if (trimmedQuery.length >= 2) {
              setActiveIndex((current) => (current + 1) % optionCount);
            }
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            if (trimmedQuery.length >= 2) {
              setActiveIndex((current) =>
                current <= 0 ? optionCount - 1 : current - 1,
              );
            }
          }
        }}
        placeholder="Wort auf Kölsch oder Deutsch suchen …"
        aria-label="Wort suchen"
        className="w-full rounded-[var(--radius-card)] border border-line bg-card py-4 pl-12 pr-4 text-base text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10"
      />

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Suchvorschläge"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[60dvh] overflow-y-auto overscroll-contain rounded-[var(--radius-card)] border border-line bg-card text-left shadow-[0_20px_50px_rgba(63,45,32,0.16)] sm:max-h-[32rem]"
        >
          {trimmedQuery.length < 2 ? (
            <div className="p-3">
              <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
                Probier ens
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => showAllResults(example)}
                    className="rounded-full border border-line bg-paper-soft px-3 py-2 text-sm text-ink-soft transition hover:border-koelsch/30 hover:text-koelsch"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <p className="px-5 py-4 text-sm text-ink-faint">Wird gesucht …</p>
          ) : suggestions.length ? (
            <>
              <div className="py-1.5">
                {suggestions.map((word, index) => (
                  <button
                    key={word.slug}
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openWord(word)}
                    className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 transition ${
                      activeIndex === index
                        ? "bg-koelsch-soft text-koelsch-deep"
                        : "text-ink hover:bg-paper-soft"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-koelsch text-lg font-semibold">
                        {word.koelsch}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-faint">
                        {word.translation}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-faint">↗</span>
                  </button>
                ))}
              </div>
              <button
                id={`${listboxId}-option-${suggestions.length}`}
                type="submit"
                role="option"
                aria-selected={activeIndex === suggestions.length}
                onMouseEnter={() => setActiveIndex(suggestions.length)}
                className={`flex min-h-11 w-full items-center justify-between border-t border-line px-4 py-2.5 text-sm font-medium transition ${
                  activeIndex === suggestions.length
                    ? "bg-koelsch-soft text-koelsch-deep"
                    : "text-koelsch hover:bg-paper-soft"
                }`}
              >
                <span>Alle Treffer für „{trimmedQuery}“</span>
                <span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <button
              id={`${listboxId}-option-0`}
              type="submit"
              role="option"
              aria-selected={activeIndex === 0}
              className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-sm text-ink-soft hover:bg-paper-soft"
            >
              <span>Keine direkte Empfehlung · trotzdem suchen</span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      ) : null}
    </form>
  );
}
