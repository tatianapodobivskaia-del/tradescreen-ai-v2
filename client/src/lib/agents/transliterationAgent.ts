import { generateAllVariants } from "@/lib/transliteration";
import type { TransliterationInput, TransliterationOutput } from "./types";

export const runTransliterationAgent = async (input: TransliterationInput): Promise<TransliterationOutput> => {
  // Transliteration runs locally, synchronous by nature, but we wrap in a promise
  // to maintain the async Agent pattern expectations.
  const entities = input.entities.map(r => {
    const info = generateAllVariants(r.name || "");
    return {
      original: r.name,
      variants: info.variants,
      country: r.country,
    };
  });

  return { entities };
};
