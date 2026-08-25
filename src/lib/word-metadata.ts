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
  const gender = word.grammaticalGender && word.grammaticalGender in genderLabels
    ? genderLabels[word.grammaticalGender as GrammaticalGender]
    : null;
  return [
    word.article ? { label: "Artikel", value: word.article } : null,
    gender ? { label: "Genus", value: gender } : null,
    word.plural ? { label: "Plural", value: word.plural } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));
}

type ProvenanceWord = {
  reviewStatus: string;
  uncertain: boolean;
  source: string | null;
  sourceUrl: string | null;
  meanings: Array<{ source: string | null }>;
};

export function provenanceSummary(word: ProvenanceWord) {
  let label: string;
  let description: string;

  if (word.uncertain || word.reviewStatus === "pending") {
    label = "Noch ungeprüft";
    description = "Dieser Eintrag wurde übernommen, aber noch nicht redaktionell bestätigt.";
  } else if (
    word.source?.startsWith("Redaktion (") ||
    word.meanings.some((meaning) => meaning.source?.startsWith("Redaktion ("))
  ) {
    label = "Redaktionell bearbeitet";
    description = "Mindestens eine Bedeutung wurde in der Redaktion geprüft oder ergänzt.";
  } else if (word.source) {
    label = "Aus externer Quelle übernommen";
    description = "Der Eintrag stammt aus einer genannten Quelle und wurde noch nicht als vollständig redaktionell geprüft markiert.";
  } else {
    label = "Quelle noch offen";
    description = "Für diesen Eintrag ist noch keine belastbare Quelle hinterlegt.";
  }

  let sourceUrl: string | null = null;
  if (word.sourceUrl) {
    try {
      const parsed = new URL(word.sourceUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        sourceUrl = parsed.toString();
      }
    } catch {
      sourceUrl = null;
    }
  }

  return {
    label,
    description,
    source: word.source,
    sourceUrl,
  };
}
