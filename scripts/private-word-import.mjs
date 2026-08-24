import { slugifyKoelsch } from "./wiktionary-parser.mjs";

const SOURCE_NAME = "koelsch-woerterbuch.de";

export function preparePrivateWords(words, importedAt = new Date()) {
  const usedSlugs = new Set();
  const prepared = [];

  for (const word of words) {
    if (word.reviewFlags?.length) continue;
    const sources = Array.isArray(word.sources) ? word.sources : [];
    const sourceId = sources[0]?.sourceId;
    const baseSlug = slugifyKoelsch(word.koelsch) || `wort-${sourceId ?? prepared.length + 1}`;
    let slug = baseSlug;
    if (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${sourceId ?? prepared.length + 1}`;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${sourceId ?? prepared.length + 1}-${suffix}`;
        suffix += 1;
      }
    }
    usedSlugs.add(slug);

    prepared.push({
      koelsch: word.koelsch,
      slug,
      translation: word.translation,
      category: "allgemein",
      aliases: [],
      partOfSpeech: null,
      notes: null,
      reviewStatus: "pending",
      source: SOURCE_NAME,
      sourceUrl: sources[0]?.sourceUrl ?? null,
      sourceLicense: null,
      uncertain: false,
      sources,
      importedAt,
    });
  }

  return prepared;
}
