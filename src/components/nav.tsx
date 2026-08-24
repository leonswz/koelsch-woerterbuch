"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Start" },
  { href: "/az", label: "A–Z" },
  { href: "/lieder", label: "Lieder" },
  { href: "/sprichwoerter", label: "Sprichwörter" },
];

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="font-koelsch text-xl font-semibold tracking-tight text-ink">
          Kölsch Wörterbuch
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-[var(--radius-control)] bg-paper-soft px-3 py-1.5 text-sm font-medium text-koelsch"
                    : "rounded-[var(--radius-control)] px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-paper-soft hover:text-ink"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <form action="/api/logout" method="post">
            <button
              type="submit"
              title="Abmelden"
              className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] text-ink-faint transition-colors hover:bg-paper-soft hover:text-ink"
            >
              <svg
                aria-hidden="true"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4" />
              </svg>
              <span className="sr-only">Abmelden</span>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
