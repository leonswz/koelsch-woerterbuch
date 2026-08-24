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
        </nav>
      </div>
    </header>
  );
}
