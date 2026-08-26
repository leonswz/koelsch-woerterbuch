import type { TranslationDirection } from "./translator.ts";

export type TranslationGrammarRule = {
  source: string;
  target: string;
  label: "Personalpronomen" | "Zeitangabe" | "Negation";
};

const germanToKoelschRules: TranslationGrammarRule[] = [
  { source: "ich", target: "ich", label: "Personalpronomen" },
  { source: "du", target: "do", label: "Personalpronomen" },
  { source: "er", target: "hä", label: "Personalpronomen" },
  { source: "wir", target: "mer", label: "Personalpronomen" },
  { source: "ihr", target: "ehr", label: "Personalpronomen" },
  { source: "heute", target: "hügg", label: "Zeitangabe" },
  { source: "nicht", target: "nit", label: "Negation" },
];

export function translationGrammarRules(
  direction: TranslationDirection,
): TranslationGrammarRule[] {
  if (direction === "de-koelsch") return germanToKoelschRules;

  return germanToKoelschRules.map((rule) => ({
    source: rule.target,
    target: rule.source,
    label: rule.label,
  }));
}
