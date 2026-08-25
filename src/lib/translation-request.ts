import type { TranslationDirection } from "./translator.ts";

type ValidTranslationRequest = {
  ok: true;
  text: string;
  direction: TranslationDirection;
};

type InvalidTranslationRequest = {
  ok: false;
  error: string;
};

export function parseTranslationRequest(
  input: unknown,
): ValidTranslationRequest | InvalidTranslationRequest {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Ungültige Anfrage." };
  }

  const value = input as { text?: unknown; direction?: unknown };
  const text = typeof value.text === "string" ? value.text.trim() : "";

  if (!text) {
    return { ok: false, error: "Bitte gib einen Text ein." };
  }
  if (text.length > 500) {
    return { ok: false, error: "Der Text darf höchstens 500 Zeichen lang sein." };
  }
  if (value.direction !== "de-koelsch" && value.direction !== "koelsch-de") {
    return { ok: false, error: "Unbekannte Übersetzungsrichtung." };
  }

  return { ok: true, text, direction: value.direction };
}
