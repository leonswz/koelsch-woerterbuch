import Link from "next/link";
import { redirect } from "next/navigation";

import { WordEditorForm } from "@/components/word-editor-form";
import { getEditorSession } from "@/lib/editor-session";

export const metadata = { title: "Neuer Begriff" };

export default async function NeuerBegriffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await getEditorSession())) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/redaktion" className="text-sm text-koelsch hover:underline">
          ← Zur Redaktion
        </Link>
        <h1 className="mt-4 font-koelsch text-4xl font-semibold text-ink">
          Neuer Begriff
        </h1>
        <p className="mt-2 text-ink-soft">
          Ein neuer geprüfter Eintrag für Wörterbuch und künftigen Übersetzer.
        </p>
      </div>
      <WordEditorForm error={error} />
    </div>
  );
}
