import { parseIndexPage, parseWordPage } from "./koelsch-woerterbuch-parser.mjs";

const BASE_URL = "https://www.koelsch-woerterbuch.de";
const USER_AGENT =
  "KoelschWoerterbuchPersonalImporter/0.1 (personal one-time archive; contact via koelsch.leonschiffer.de)";

async function responseText(fetchImpl, url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": USER_AGENT,
        },
      });
      if (response.ok) return await response.text();
      lastError = new Error(`HTTP ${response.status} for ${url}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
  }
  throw lastError;
}

export async function fetchIndexEntries({
  fetchImpl = fetch,
  letters = "abcdefghijklmnopqrstuvwxyz",
} = {}) {
  const byUrl = new Map();

  for (const letter of letters) {
    const html = await responseText(fetchImpl, `${BASE_URL}/${letter}`);
    for (const entry of parseIndexPage(html)) {
      if (!byUrl.has(entry.sourceUrl)) byUrl.set(entry.sourceUrl, entry);
    }
  }

  return [...byUrl.values()];
}

export async function crawlWordEntries({
  entries,
  cachedWords = new Map(),
  fetchImpl = fetch,
  concurrency = 4,
  requestsPerSecond = 8,
  onResult = async () => {},
} = {}) {
  if (!Array.isArray(entries)) throw new Error("entries must be an array");
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 20) {
    throw new Error("concurrency must be an integer between 1 and 20");
  }
  if (
    requestsPerSecond !== Infinity &&
    (!Number.isFinite(requestsPerSecond) || requestsPerSecond <= 0)
  ) {
    throw new Error("requestsPerSecond must be positive");
  }

  const resultByUrl = new Map(cachedWords);
  const missingUrls = new Set();
  const failed = [];
  const pending = entries.filter((entry) => !resultByUrl.has(entry.sourceUrl));
  let cursor = 0;
  let nextRequestAt = 0;
  let schedule = Promise.resolve();

  const acquireRateSlot = () => {
    if (requestsPerSecond === Infinity) return Promise.resolve();
    const interval = 1000 / requestsPerSecond;
    schedule = schedule.then(async () => {
      const wait = Math.max(0, nextRequestAt - Date.now());
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      nextRequestAt = Date.now() + interval;
    });
    return schedule;
  };

  const worker = async () => {
    while (cursor < pending.length) {
      const entry = pending[cursor];
      cursor += 1;
      await acquireRateSlot();

      try {
        const html = await responseText(fetchImpl, entry.sourceUrl);
        const word = parseWordPage(html, entry);
        if (word) resultByUrl.set(entry.sourceUrl, word);
        else missingUrls.add(entry.sourceUrl);
        await onResult({ entry, word, error: null });
      } catch (error) {
        failed.push({ entry, error: String(error?.message ?? error) });
        await onResult({ entry, word: null, error });
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, pending.length || 1) }, worker),
  );

  return {
    words: entries
      .map((entry) => resultByUrl.get(entry.sourceUrl))
      .filter(Boolean),
    missing: entries.filter((entry) => missingUrls.has(entry.sourceUrl)),
    failed,
  };
}
