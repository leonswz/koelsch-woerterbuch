import type { TranslationResult } from "./translator.ts";

type TranslationStatus = TranslationResult["status"];

type TranslationStatusCopy = {
  label: string;
  description: string;
  tone: "dictionary" | "rule" | "partial";
};

const statusCopy: Record<TranslationStatus, TranslationStatusCopy> = {
  dictionary: {
    label: "Aus dem Wörterbuch",
    description: "Der Text ist vollständig durch gepflegte Wörter und Wendungen abgedeckt.",
    tone: "dictionary",
  },
  "rule-based": {
    label: "Regelbasiert zusammengesetzt",
    description: "Wörterbuch und feste Grammatikregeln decken den ganzen Text ab.",
    tone: "rule",
  },
  partial: {
    label: "Teilweise übersetzt",
    description: "Unbekannte Bestandteile bleiben unverändert im Text.",
    tone: "partial",
  },
  untranslated: {
    label: "Nicht übersetzt",
    description: "Kein Bestandteil wurde im Wörterbuch oder in den festen Regeln gefunden.",
    tone: "partial",
  },
};

export function translationStatusCopy(status: TranslationStatus) {
  return statusCopy[status];
}

export function translationCompletionMessage(status: TranslationStatus) {
  if (status === "untranslated" || status === "partial") return null;
  return status === "dictionary"
    ? "Alle Wörter wurden im Wörterbuch gefunden."
    : "Der Text wurde vollständig aus Wörterbuch und festen Regeln zusammengesetzt.";
}
