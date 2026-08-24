"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  House,
  ListTree,
  LogOut,
  Menu,
  Music2,
  Quote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/",
    label: "Start",
    description: "Suchen und schnell fündig werden",
    icon: House,
  },
  {
    href: "/az",
    label: "Wörter von A–Z",
    description: "Durch alle kölschen Begriffe stöbern",
    icon: ListTree,
  },
  {
    href: "/lieder",
    label: "Lieder",
    description: "Kölsche Töne und ihre Bedeutung",
    icon: Music2,
  },
  {
    href: "/sprichwoerter",
    label: "Sprichwörter",
    description: "Redensarten aus Köln",
    icon: Quote,
  },
];

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-3 text-ink"
          aria-label="Kölsch Wörterbuch – Startseite"
        >
          <span className="grid size-9 place-items-center rounded-full bg-koelsch font-koelsch text-lg font-semibold text-white shadow-sm transition-transform group-hover:-rotate-3">
            K
          </span>
          <span className="font-koelsch text-xl font-semibold tracking-tight">
            Kölsch Wörterbuch
          </span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-[var(--radius-control)] text-ink hover:bg-paper-soft"
              aria-label="Menü öffnen"
            >
              <Menu className="size-5" strokeWidth={1.8} />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[min(88vw,380px)] gap-0 border-line bg-paper p-0 text-ink sm:max-w-[380px]"
          >
            <SheetHeader className="border-b border-line px-6 pb-5 pt-7 text-left">
              <div className="mb-3 grid size-11 place-items-center rounded-full bg-koelsch font-koelsch text-xl font-semibold text-white shadow-sm">
                K
              </div>
              <SheetTitle className="font-koelsch text-2xl font-semibold text-ink">
                Et Menü
              </SheetTitle>
              <SheetDescription className="text-ink-soft">
                Wat wells de nachschlage?
              </SheetDescription>
            </SheetHeader>

            <nav className="flex-1 space-y-1 p-3" aria-label="Hauptnavigation">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors",
                        active
                          ? "bg-koelsch-soft text-koelsch-deep"
                          : "text-ink hover:bg-paper-soft",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl border transition-colors",
                          active
                            ? "border-koelsch/20 bg-white/70 text-koelsch"
                            : "border-line bg-card text-ink-faint group-hover:text-ink",
                        )}
                      >
                        <Icon className="size-[18px]" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{link.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-ink-faint">
                          {link.description}
                        </span>
                      </span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>

            <SheetFooter className="border-t border-line bg-paper-soft/70 p-4">
              <div className="mb-2 flex items-center gap-2 px-2 text-xs text-ink-faint">
                <BookOpenText className="size-4" strokeWidth={1.7} />
                <span>Et Hätz schleiht in Kölle.</span>
              </div>
              <form action="/api/logout" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  className="h-11 w-full justify-start gap-3 border-line bg-card px-4 text-ink-soft hover:bg-white hover:text-ink"
                >
                  <LogOut className="size-4" strokeWidth={1.8} />
                  Abmelden
                </Button>
              </form>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
