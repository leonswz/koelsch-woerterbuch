"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function KoelschSearch({
  initial = "",
  autoFocus = false,
}: {
  initial?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initial);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        if (q) router.push(`/suche?q=${encodeURIComponent(q)}`);
      }}
      className="relative"
    >
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Wort auf Kölsch oder Deutsch suchen …"
        aria-label="Wort suchen"
        className="w-full rounded-[var(--radius-card)] border border-line bg-card py-4 pl-12 pr-4 text-base text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:border-koelsch/50 focus:ring-4 focus:ring-koelsch/10"
      />
    </form>
  );
}
