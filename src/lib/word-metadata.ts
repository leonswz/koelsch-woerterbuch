export type GrammaticalGender = "masculine" | "feminine" | "neuter";

const genderLabels: Record<GrammaticalGender, string> = {
  masculine: "Maskulinum",
  feminine: "Femininum",
  neuter: "Neutrum",
};

export function grammarRows(word: {
  grammaticalGender: string | null;
  article: string | null;
  plural: string | null;
}) {
  const gender = word.grammaticalGender as GrammaticalGender | null;
  const genderLabel = gender && gender in genderLabels ? genderLabels[gender] : null;

  return [
    word.article ? { label: "Artikel", value: word.article } : null,
    genderLabel ? { label: "Genus", value: genderLabel } : null,
    word.plural ? { label: "Plural", value: word.plural } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));
}
