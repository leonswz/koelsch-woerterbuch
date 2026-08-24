const API_URL = "https://de.wiktionary.org/w/api.php";
const CATEGORY = "Kategorie:Übersetzungen (Kölsch)";
const USER_AGENT =
  "KoelschWoerterbuchImporter/0.1 (https://koelsch.leonschiffer.de; contact via site imprint)";

export async function fetchWiktionaryPages({
  fetchImpl = fetch,
  limit = 100,
} = {}) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("limit must be a positive integer");
  }

  const request = async (params) => {
    const url = new URL(API_URL);
    for (const [key, value] of Object.entries({
      format: "json",
      formatversion: "2",
      origin: "*",
      ...params,
    })) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!response.ok) {
      throw new Error(`Wiktionary API returned HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(`Wiktionary API error: ${data.error.info ?? data.error.code}`);
    }
    return data;
  };

  const titles = [];
  let continuation;

  do {
    const data = await request({
      action: "query",
      list: "categorymembers",
      cmtitle: CATEGORY,
      cmnamespace: 0,
      cmlimit: Math.min(500, limit - titles.length),
      ...(continuation ? { cmcontinue: continuation } : {}),
    });
    titles.push(
      ...(data.query?.categorymembers ?? []).map((member) => member.title),
    );
    continuation = data.continue?.cmcontinue;
  } while (continuation && titles.length < limit);

  const selectedTitles = titles.slice(0, limit);
  const pages = [];
  for (let offset = 0; offset < selectedTitles.length; offset += 50) {
    const batch = selectedTitles.slice(offset, offset + 50);
    const data = await request({
      action: "query",
      prop: "revisions",
      rvprop: "ids|timestamp|content",
      rvslots: "main",
      titles: batch.join("|"),
    });
    pages.push(...(data.query?.pages ?? []));
  }

  return pages;
}
