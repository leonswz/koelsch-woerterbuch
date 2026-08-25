export function splitWordMeanings(translation: string): string[] {
  const meanings: string[] = [];
  let current = "";
  let depth = 0;

  const flush = () => {
    const value = current.trim();
    current = "";
    if (!value) return;
    const key = value.toLocaleLowerCase("de-DE");
    if (!meanings.some((meaning) => meaning.toLocaleLowerCase("de-DE") === key)) {
      meanings.push(value);
    }
  };

  for (const character of translation) {
    if (character === "(") depth += 1;
    if (character === ")" && depth > 0) depth -= 1;

    if ((character === "," || character === ";") && depth === 0) {
      flush();
    } else {
      current += character;
    }
  }
  flush();

  return meanings;
}
