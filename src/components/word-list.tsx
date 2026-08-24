import Link from "next/link";

type WordListItem = {
  id: number;
  koelsch: string;
  slug: string;
  translation: string;
};

export function WordList({ words }: { words: WordListItem[] }) {
  return (
    <div className="divide-y divide-line">
      {words.map((word) => (
        <Link
          key={word.id}
          href={`/wort/${word.slug}`}
          className="group grid gap-1 px-5 py-4 transition-colors hover:bg-paper/65 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-8"
        >
          <span className="font-koelsch text-xl font-semibold text-ink transition-colors group-hover:text-koelsch">
            {word.koelsch}
          </span>
          <span className="text-sm leading-6 text-ink-soft sm:text-base">
            {word.translation}
          </span>
        </Link>
      ))}
    </div>
  );
}
