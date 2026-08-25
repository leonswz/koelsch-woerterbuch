import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { WordEditorForm } from "@/components/word-editor-form";
import { getEditorSession } from "@/lib/editor-session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Begriff bearbeiten" };

export default async function BegriffBearbeitenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await getEditorSession())) redirect("/");
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  const word = await prisma.word.findUnique({
    where: { id: numericId },
    include: {
      meanings: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
  if (!word) notFound();

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/redaktion" className="text-sm text-koelsch hover:underline">
          ← Zur Redaktion
        </Link>
        <h1 className="mt-4 font-koelsch text-4xl font-semibold text-ink">
          {word.koelsch} bearbeiten
        </h1>
        <p className="mt-2 text-ink-soft">
          Übersetzung, Erklärung und Beispiele redaktionell pflegen.
        </p>
      </div>
      <WordEditorForm word={word} error={error} />
    </div>
  );
}
