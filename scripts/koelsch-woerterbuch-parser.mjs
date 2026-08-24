const BASE_URL = "https://www.koelsch-woerterbuch.de";

function decodeHtml(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function plainText(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function parseIndexPage(html) {
  const entries = [];
  const seen = new Set();
  const anchorPattern = /<a\b[^>]*href=["']([^"']*auf-deutsch-(\d+)\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const [, href, sourceIdText, inner] = match;
    if (/<i\b[^>]*title=["'][^"']+["']/i.test(inner)) continue;

    const withoutBadge = inner.replace(
      /<span\b[^>]*class=["'][^"']*badge[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
      " ",
    );
    const koelsch = plainText(withoutBadge);
    const sourceUrl = new URL(href, BASE_URL).href;
    if (!koelsch || seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);

    entries.push({
      koelsch,
      sourceUrl,
      sourceId: Number(sourceIdText),
    });
  }

  return entries;
}

export function parseWordPage(html, source) {
  const marker = html.search(/class=["'][^"']*jumbotron-contents[^"']*uebersetzung[^"']*["']/i);
  if (marker < 0) return null;

  const translationBox = html.slice(marker, marker + 6000);
  const heading = translationBox.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1];
  if (!heading) return null;

  const linkedTranslation = heading.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[1];
  const cleanedHeading = linkedTranslation ?? heading
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<small\b[^>]*>[\s\S]*?<\/small>/gi, " ");
  const translation = plainText(cleanedHeading);
  if (!translation) return null;

  return {
    koelsch: source.koelsch,
    translation,
    sourceId: source.sourceId,
    sourceUrl: source.sourceUrl,
  };
}
