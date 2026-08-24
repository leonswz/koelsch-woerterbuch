export const SESSION_COOKIE = "koelsch_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}

async function fixedLengthEqual(left: string, right: string): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([digest(left), digest(right)]);
  let difference = 0;
  for (let index = 0; index < leftDigest.length; index += 1) {
    difference |= leftDigest[index] ^ rightDigest[index];
  }
  return difference === 0;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function credentialsMatch(
  username: string,
  password: string,
  configured: { username: string; password: string },
): Promise<boolean> {
  const [usernameMatches, passwordMatches] = await Promise.all([
    fixedLengthEqual(username, configured.username),
    fixedLengthEqual(password, configured.password),
  ]);
  return usernameMatches && passwordMatches;
}

export async function createSessionToken({
  username,
  secret,
  now = new Date(),
  maxAgeSeconds,
}: {
  username: string;
  secret: string;
  now?: Date;
  maxAgeSeconds: number;
}): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        u: username,
        exp: now.getTime() + maxAgeSeconds * 1000,
      }),
    ),
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload)),
  );
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  now = new Date(),
): Promise<{ username: string; expiresAt: number } | null> {
  try {
    if (!token || !secret) return null;
    const parts = token.split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const [payload, encodedSignature] = parts;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      fromBase64Url(encodedSignature),
      encoder.encode(payload),
    );
    if (!valid) return null;

    const parsed = JSON.parse(decoder.decode(fromBase64Url(payload))) as {
      u?: unknown;
      exp?: unknown;
    };
    if (
      typeof parsed.u !== "string" ||
      !parsed.u ||
      typeof parsed.exp !== "number" ||
      !Number.isFinite(parsed.exp) ||
      parsed.exp <= now.getTime()
    ) {
      return null;
    }
    return { username: parsed.u, expiresAt: parsed.exp };
  } catch {
    return null;
  }
}

export function safeRedirectPath(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  try {
    const parsed = new URL(value, "https://local.invalid");
    if (parsed.origin !== "https://local.invalid" || parsed.pathname === "/login") {
      return "/";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}
