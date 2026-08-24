import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: {
    default: "Kölsch Wörterbuch",
    template: "%s · Kölsch Wörterbuch",
  },
  description:
    "Das Kölsch Wörterbuch: Wörter, Lieder und Sprichwörter aus Köln – nachschlagen, verstehen, weitersagen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-20 pt-10">
          {children}
        </main>
        <footer className="border-t border-line py-8 text-center text-sm text-ink-faint">
          <p>Kölsch Wörterbuch · Et Hätz schleiht in Kölle</p>
        </footer>
      </body>
    </html>
  );
}
