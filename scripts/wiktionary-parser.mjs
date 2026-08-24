const SOURCE_NAME = "Deutschsprachiges Wiktionary";
const SOURCE_LICENSE = "CC BY-SA 4.0";

function cleanTemplateValue(value) {
  return value
    .replace(/<!--.*?-->/gs, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .trim();
}

function sourceFor(page, revision) {
  return {
    name: SOURCE_NAME,
    url: `https://de.wiktionary.org/wiki/${encodeURIComponent(page.title).replaceAll("%20", "_")}`,
    pageId: page.pageid,
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
    license: SOURCE_LICENSE,
  };
}

export function extractKoelschTranslations(page) {
  const revision = page.revisions?.[0];
  const content = revision?.slots?.main?.content;
  if (!revision || typeof content !== "string") return [];

  const source = sourceFor(page, revision);
  const seen = new Set();
  const entries = [];
  const templatePattern = /\{\{Ü(\?)?\|ksh\|([^|}]+)(?:\|([^|}]+))?\}\}/g;

  for (const line of content.split("\n")) {
    if (!line.includes("{{ksh}}")) continue;

    for (const match of line.matchAll(templatePattern)) {
      const displayed = match[3] && !match[3].includes("=") ? match[3] : match[2];
      const koelsch = cleanTemplateValue(displayed);
      if (!koelsch) continue;

      const uncertain = match[1] === "?";
      const key = `${koelsch.normalize("NFKC").toLocaleLowerCase("de-DE")}|${uncertain}`;
      if (seen.has(key)) continue;
      seen.add(key);

      entries.push({
        koelsch,
        translation: page.title,
        uncertain,
        source,
      });
    }
  }

  return entries;
}

export function slugifyKoelsch(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function aggregateTranslations(entries) {
  const groups = new Map();

  for (const entry of entries) {
    const key = entry.koelsch.normalize("NFKC").toLocaleLowerCase("de-DE");
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => {
      const translations = [...new Set(group.map((entry) => entry.translation))].sort((a, b) =>
        a.localeCompare(b, "de-DE"),
      );
      const sources = [
        ...new Map(
          group.map((entry) => [
            `${entry.source.url}|${entry.source.revisionId}`,
            entry.source,
          ]),
        ).values(),
      ];
      const primary = group.find((entry) => !entry.uncertain) ?? group[0];

      return {
        koelsch: primary.koelsch,
        slug: slugifyKoelsch(primary.koelsch),
        translation: translations.join("; "),
        category: "allgemein",
        reviewStatus: "pending",
        source: SOURCE_NAME,
        sourceUrl: sources[0].url,
        sourceLicense: SOURCE_LICENSE,
        uncertain: group.every((entry) => entry.uncertain),
        sources,
      };
    })
    .sort((a, b) => a.koelsch.localeCompare(b.koelsch, "de-DE"));
}
