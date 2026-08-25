import { TranslatorForm } from "@/components/translator-form";
import { prisma } from "@/lib/prisma";
import {
  translateCuratedText,
  type TranslationDirection,
} from "@/lib/translator";

export const metadata = { title: "Kölsch Übersetzer" };

type TranslatorPageProps = {
  searchParams: Promise<{ text?: string; direction?: string }>;
};

export default async function UebersetzerPage({ searchParams }: TranslatorPageProps) {
  const params = await searchParams;
  const initialText = (params.text ?? "").slice(0, 500);
  const initialDirection: TranslationDirection =
    params.direction === "koelsch-de" ? "koelsch-de" : "de-koelsch";
  const words = initialText.trim()
    ? await prisma.word.findMany({
        select: {
          id: true,
          slug: true,
          koelsch: true,
          translation: true,
          aliases: true,
        },
      })
    : [];
  const initialResult = initialText.trim()
    ? translateCuratedText(initialText, words, initialDirection)
    : null;

  return (
    <div className="grid gap-7">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-koelsch">
          Übersetzen & verstehen
        </p>
        <h1 className="mt-2 font-koelsch text-4xl font-semibold text-ink sm:text-5xl">
          Deutsch ↔ Kölsch
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
          Kuratiert statt erfunden: Der Übersetzer verwendet unsere gepflegten Begriffe und zeigt offen, welche Wörter er noch nicht kennt.
        </p>
      </header>

      <TranslatorForm
        initialText={initialText}
        initialDirection={initialDirection}
        initialResult={initialResult}
      />

      <p className="text-center text-xs leading-5 text-ink-faint">
        Aktuell ist dies die verlässliche, datenbasierte Version. Satzbau und Grammatik werden mit der wachsenden Redaktion schrittweise verbessert.
      </p>
    </div>
  );
}
