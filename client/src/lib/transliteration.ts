/**
 * Cyrillic → Latin transliteration (ISO 9, ICAO, BGN/PCGN, Informal).
 * Core maps follow the four standards; extended Cyrillic letters use the same tables where defined,
 * otherwise fall back to informal Latin approximations.
 */

export const CYRILLIC_RE = /[\u0400-\u04FF]/;

export function isCyrillic(input: string): boolean {
  return CYRILLIC_RE.test(input);
}

type CharMap = Record<string, string>;

/** ISO 9:1995 systematic (scientific) — user-specified */
export const iso9Map: CharMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "ë",
  ж: "ž",
  з: "z",
  и: "i",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "č",
  ш: "š",
  щ: "ŝ",
  ъ: "ʺ",
  ы: "y",
  ь: "ʹ",
  э: "è",
  ю: "û",
  я: "â",
  і: "ì",
  ї: "ï",
  є: "ê",
  ґ: "g̀",
  ў: "ù",
  ђ: "đ",
  ѓ: "ǵ",
  ј: "ǰ",
  љ: "ľ",
  њ: "ň",
  ћ: "ć",
  ќ: "ḱ",
  ѝ: "ì",
  џ: "dž",
  ҁ: "k",
  ғ: "ġ",
  ҕ: "ǵ",
  җ: "ž",
  ҙ: "ẑ",
  қ: "q",
  ҝ: "q",
  ҟ: "k",
  ҡ: "q",
  ң: "ṅ",
  ҥ: "ṅ",
  ҧ: "ṕ",
  ҩ: "ħ",
  ҫ: "ç",
  ҭ: "t",
  ү: "u",
  ұ: "u",
  ҳ: "h",
  ҵ: "c",
  ҷ: "c",
  ҹ: "c",
  һ: "h",
  ҽ: "æ",
  ҿ: "æ",
  ӂ: "ž",
  ӄ: "q",
  ӆ: "ḱ",
  ӈ: "ṅ",
  ӊ: "ṅ",
  ӌ: "dž",
  ӎ: "m",
  ӑ: "ă",
  ӓ: "ä",
  ӕ: "æ",
  ӗ: "ĕ",
  ә: "ə",
  ӛ: "ë",
  ӝ: "ž",
  ӟ: "z",
  ӡ: "ẑ",
  ӣ: "ī",
  ӥ: "i",
  ӧ: "ö",
  ө: "ô",
  ӫ: "ö",
  ӭ: "ī",
  ӯ: "ū",
  ӱ: "ü",
  ӳ: "ü",
  ӵ: "č",
  ӷ: "ǵ",
  ӹ: "y",
  ӻ: "g",
  ӽ: "h",
  ӿ: "h",
};

/** ICAO (Doc 9303) — user-specified */
export const icaoMap: CharMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "ie",
  ы: "y",
  ь: "",
  э: "e",
  ю: "iu",
  я: "ia",
  і: "i",
  ї: "i",
  є: "e",
  ґ: "g",
  ў: "u",
  ј: "j",
  љ: "lj",
  њ: "nj",
  ђ: "dj",
  ћ: "ts",
  џ: "dzh",
  ѓ: "g",
  ѕ: "dz",
  ќ: "k",
  ѝ: "i",
  ѡ: "o",
  ѣ: "e",
  ѥ: "je",
  ѧ: "ja",
  ѩ: "ja",
  ѫ: "u",
  ѭ: "ju",
  ѯ: "dz",
  ѱ: "ps",
  ѳ: "f",
  ѵ: "y",
  ѷ: "v",
  ѹ: "ou",
  ѻ: "o",
  ѽ: "ot",
  ѿ: "o",
  ҁ: "k",
  ғ: "g",
  ҕ: "g",
  җ: "zh",
  ҙ: "z",
  қ: "k",
  ҝ: "g",
  ҟ: "k",
  ҡ: "q",
  ң: "ng",
  ҥ: "n",
  ҧ: "p",
  ҩ: "kh",
  ҫ: "ts",
  ҭ: "t",
  ү: "u",
  ұ: "u",
  ҳ: "kh",
  ҵ: "ts",
  ҷ: "ch",
  ҹ: "ch",
  һ: "h",
};

/** BGN/PCGN static letters (е is contextual in transliterateBGN) */
export const bgnMap: CharMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "ʺ",
  ы: "y",
  ь: "ʹ",
  э: "e",
  ю: "yu",
  я: "ya",
  ё: "yë",
  і: "i",
  ї: "yi",
  є: "ye",
  ґ: "g",
  ў: "w",
  ј: "y",
  љ: "ly",
  њ: "ny",
  ђ: "dh",
  ћ: "ć",
  џ: "zh",
  ѓ: "g",
  ѕ: "z",
  ќ: "k",
  ѝ: "i",
};

/** Informal — user-specified */
export const informalMap: CharMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  і: "i",
  ї: "yi",
  є: "ye",
  ґ: "g",
  ў: "u",
  ј: "j",
  љ: "lj",
  њ: "nj",
  ђ: "dj",
  ћ: "ch",
  џ: "dz",
  ѓ: "g",
  ѕ: "dz",
  ќ: "k",
  ѝ: "i",
  ѡ: "o",
  ѣ: "e",
  ѥ: "ye",
  ѧ: "ja",
  ѩ: "ja",
  ѫ: "u",
  ѭ: "yu",
  ѯ: "dz",
  ѱ: "ps",
  ѳ: "f",
  ѵ: "y",
  ѷ: "v",
  ѹ: "ou",
  ѻ: "o",
  ѽ: "ot",
  ѿ: "o",
  ҁ: "k",
  ғ: "g",
  ҕ: "g",
  җ: "zh",
  ҙ: "z",
  қ: "k",
  ҝ: "g",
  ҟ: "k",
  ҡ: "q",
  ң: "ng",
  ҥ: "n",
  ҧ: "p",
  ҩ: "kh",
  ҫ: "ts",
  ҭ: "t",
  ү: "u",
  ұ: "u",
  ҳ: "kh",
  ҵ: "ts",
  ҷ: "ch",
  ҹ: "ch",
  һ: "h",
};

function expandMapKeys(map: CharMap): CharMap {
  const out: CharMap = { ...map };
  for (const [k, v] of Object.entries(map)) {
    if (k.length === 1) {
      const u = k.toUpperCase();
      if (u !== k && out[u] === undefined) out[u] = v;
    }
  }
  return out;
}

function applyCharMap(input: string, map: CharMap, fallback: CharMap): string {
  const m = expandMapKeys(map);
  const fb = expandMapKeys(fallback);
  let out = "";
  for (const ch of input) {
    if (m[ch]) {
      out += m[ch];
      continue;
    }
    const low = ch.toLowerCase();
    if (m[low]) {
      out += m[low];
      continue;
    }
    if (!CYRILLIC_RE.test(ch)) {
      out += ch;
      continue;
    }
    out += fb[ch] ?? fb[low] ?? "";
  }
  return out;
}

/** BGN/PCGN: е → ye at word start / after vowel or ъь / after space or hyphen */
const BGN_YE_PREV = new Set([
  "а",
  "е",
  "ё",
  "и",
  "о",
  "у",
  "ы",
  "э",
  "ю",
  "я",
  "і",
  "ї",
  "є",
  "ъ",
  "ь",
]);

export function transliterateBGN(input: string): string {
  const m = expandMapKeys(bgnMap);
  const fb = expandMapKeys(informalMap);
  let out = "";
  let wordStart = true;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (!CYRILLIC_RE.test(ch)) {
      out += ch;
      if (/\s/.test(ch) || ch === "-") wordStart = true;
      else wordStart = false;
      continue;
    }
    const cl = ch.toLowerCase();

    if (cl === "е") {
      const prev = i > 0 ? input[i - 1] : "";
      const prevCyr = CYRILLIC_RE.test(prev) ? prev.toLowerCase() : "";
      const useYe =
        wordStart ||
        prev === "" ||
        /\s/.test(prev) ||
        prev === "-" ||
        (prevCyr !== "" && BGN_YE_PREV.has(prevCyr));
      out += useYe ? "ye" : "e";
      wordStart = false;
      continue;
    }

    const rep = m[ch] ?? m[cl] ?? fb[ch] ?? fb[cl] ?? "";
    out += rep;
    wordStart = false;
  }
  return out;
}

export function transliterateISO9(input: string): string {
  return applyCharMap(input, iso9Map, informalMap);
}

export function transliterateICAO(input: string): string {
  return applyCharMap(input, icaoMap, informalMap);
}

export function transliterateInformal(input: string): string {
  return applyCharMap(input, informalMap, informalMap);
}

export function generateAllVariants(input: string): {
  iso9: string;
  icao: string;
  bgn: string;
  informal: string;
  unique: string[];
} {
  const iso9 = transliterateISO9(input).trim();
  const icao = transliterateICAO(input).trim();
  const bgn = transliterateBGN(input).trim();
  const informal = transliterateInformal(input).trim();
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const s of [iso9, icao, bgn, informal]) {
    if (!s) continue;
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      unique.push(s);
    }
  }
  return { iso9, icao, bgn, informal, unique };
}
