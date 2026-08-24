import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Wort" };

export default async function WortPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="grid gap-6">
      <Link
        href="/az"
        className="text-sm text-koelsch hover:underline"
      >
        ← Zurück zu A–Z
      </Link>
      <article className="rounded-[var(--radius-card)] border border-line bg-card p-6">
        <p className="font-koelsch text-4xl font-semibold tracking-tight text-ink">
          {slug}
        </p>
        <p className="mt-4 text-ink-soft">
          Dieser Eintrag wird angelegt, sobald die Wörter eingespielt sind.
        </p>
      </article>
    </div>
  );
}
