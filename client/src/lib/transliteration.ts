// =============================================================================
// TradeScreen AI — Multi-Script Transliteration Engine
// Academic Research Prototype | Tatiana Podobivskaia © 2026
// =============================================================================

// ---------------------------------------------------------------------------
// 1. COMBINATORIAL CYRILLIC → LATIN (TM mapping, cap 20 variants)
// ---------------------------------------------------------------------------

const TM: Record<string, string | string[]> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
  'Ж': ['Zh', 'J'], 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L',
  'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
  'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': ['Ts', 'Tc', 'C'], 'Ч': 'Ch',
  'Ш': 'Sh', 'Щ': ['Shch', 'Sch'], 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E',
  'Ю': ['Yu', 'Iu'], 'Я': ['Ya', 'Ia'],
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': ['zh', 'j'], 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l',
  'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': ['ts', 'tc', 'c'], 'ч': 'ch',
  'ш': 'sh', 'щ': ['shch', 'sch'], 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e',
  'ю': ['yu', 'iu'], 'я': ['ya', 'ia'],
};

const MAX_VARIANTS = 20;

/**
 * Combinatorial Cyrillic → Latin transliteration.
 * Ambiguous chars (ж, щ, ц, ю, я…) produce multiple variants.
 * Returns up to MAX_VARIANTS unique Latin strings.
 */
export function transliterateCombinatorial(input: string): string[] {
  let variants: string[] = [''];

  for (const char of input) {
    const mapped = TM[char];

    if (mapped === undefined) {
      // Non-Cyrillic char — pass through
      variants = variants.map((v) => v + char);
      continue;
    }

    if (Array.isArray(mapped)) {
      const next: string[] = [];
      for (const alt of mapped) {
        for (const v of variants) {
          next.push(v + alt);
        }
      }
      variants = next;
    } else {
      variants = variants.map((v) => v + mapped);
    }

    // Cap early to avoid exponential blowup
    if (variants.length > MAX_VARIANTS) {
      variants = variants.slice(0, MAX_VARIANTS);
    }
  }

  return [...new Set(variants)].slice(0, MAX_VARIANTS);
}

// ---------------------------------------------------------------------------
// 2. LATIN → ALL VARIANTS (REVERSE_MAP, 2-pass, cap 20)
// ---------------------------------------------------------------------------

interface ReverseRule {
  p: RegExp;
  a: string[];
}

const REVERSE_MAP: ReverseRule[] = [
  { p: /shch/gi, a: ['shch', 'sch', 'stch', 'shtch', 'sc'] },
  { p: /tsch/gi, a: ['tsch', 'ch', 'tch', 'cz'] },
  { p: /sch(?=[aeiou])/gi, a: ['sch', 'shch', 'sh'] },
  { p: /zh/gi, a: ['zh', 'j', 'dj', 'dzh'] },
  { p: /(?<![ds])j(?=[aeiou])/gi, a: ['j', 'zh', 'dzh'] },
  { p: /kh/gi, a: ['kh', 'h', 'ch', 'x'] },
  { p: /ts(?=[aeiou])/gi, a: ['ts', 'tc', 'c', 'tz', 'z'] },
  { p: /yu/gi, a: ['yu', 'iu', 'ju', 'you'] },
  { p: /iu/gi, a: ['iu', 'yu', 'ju'] },
  { p: /ya/gi, a: ['ya', 'ia', 'ja'] },
  { p: /ia(?=[^a-z]|$)/gi, a: ['ia', 'ya', 'ja', 'iya'] },
  { p: /yo/gi, a: ['yo', 'io', 'jo'] },
  { p: /ye/gi, a: ['ye', 'ie', 'je'] },
  { p: /aia$/gi, a: ['aia', 'aya', 'aja'] },
  { p: /skaia$/gi, a: ['skaia', 'skaya', 'skaja'] },
  { p: /aya$/gi, a: ['aya', 'aia', 'aja'] },
  { p: /iy$/gi, a: ['iy', 'y', 'ii', 'i', 'yy'] },
  { p: /sky$/gi, a: ['sky', 'skiy', 'skii', 'ski', 'skij'] },
  { p: /skaya$/gi, a: ['skaya', 'skaia', 'skaja'] },
  { p: /ov$/gi, a: ['ov', 'off', 'ow'] },
  { p: /ev$/gi, a: ['ev', 'eff', 'ew', 'yev'] },
  { p: /ova$/gi, a: ['ova', 'off', 'owa'] },
  { p: /eva$/gi, a: ['eva', 'ewa', 'yeva'] },
  { p: /enko$/gi, a: ['enko', 'yenko', 'ienko'] },
  { p: /ch(?=[aeiou])/gi, a: ['ch', 'tch', 'cz'] },
  { p: /v(?=[aeiou])/gi, a: ['v', 'w', 'b'] },
  { p: /oo/gi, a: ['oo', 'ou', 'u'] },
  { p: /ee/gi, a: ['ee', 'ie', 'ye'] },
  { p: /ph/gi, a: ['ph', 'f'] },
  { p: /ks/gi, a: ['ks', 'x'] },
  { p: /tz/gi, a: ['tz', 'ts', 'c', 'z'] },
  { p: /ou/gi, a: ['ou', 'oo', 'u'] },
  { p: /sh(?!ch)/gi, a: ['sh', 'sch'] },
  { p: /(?<=[aeiou])y(?=[aeiou])/gi, a: ['y', 'i', ''] },
  { p: /iv/gi, a: ['iv', 'iw'] },
  { p: /sk/gi, a: ['sk', 'sc'] },
];

/**
 * Latin → All Variants via REVERSE_MAP (2-pass).
 * Generates alternative spellings of a Latin name.
 * Returns up to MAX_VARIANTS unique strings.
 */
export function generateLatinVariants(input: string): string[] {
  const allVariants = new Set<string>([input.toLowerCase()]);

  for (let pass = 0; pass < 2; pass++) {
    const currentVars = [...allVariants];
    for (const current of currentVars) {
      for (const rule of REVERSE_MAP) {
        const re = new RegExp(rule.p.source, rule.p.flags);
        if (re.test(current)) {
          for (const alt of rule.a) {
            const nv = current.replace(
              new RegExp(rule.p.source, rule.p.flags.replace('g', '')),
              alt
            );
            allVariants.add(nv);
            if (allVariants.size >= MAX_VARIANTS) break;
          }
        }
        if (allVariants.size >= MAX_VARIANTS) break;
      }
      if (allVariants.size >= MAX_VARIANTS) break;
    }
  }

  return [...allVariants].slice(0, MAX_VARIANTS);
}

// ---------------------------------------------------------------------------
// 3. INDIVIDUAL STANDARD TRANSLITERATIONS (for display / standard labels)
// ---------------------------------------------------------------------------

const ISO9_MAP: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Ë',
  'Ж': 'Ž', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Č', 'Ш': 'Š', 'Щ': 'Ŝ', 'Ъ': 'ʺ',
  'Ы': 'Y', 'Ь': 'ʹ', 'Э': 'È', 'Ю': 'Û', 'Я': 'Â',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'ë',
  'ж': 'ž', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'č', 'ш': 'š', 'щ': 'ŝ', 'ъ': 'ʺ',
  'ы': 'y', 'ь': 'ʹ', 'э': 'è', 'ю': 'û', 'я': 'â',
};

const ICAO_MAP: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
  'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'I', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'KH', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH',
  'Ъ': 'IE', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'IU', 'Я': 'IA',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': 'ie', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'iu', 'я': 'ia',
};

const BGN_MAP: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'Ye', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '"', 'Ы': 'Y', 'Ь': '\'', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'ye', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '"', 'ы': 'y', 'ь': '\'', 'э': 'e', 'ю': 'yu', 'я': 'ya',
};

const INFORMAL_MAP: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
};

function applyMap(input: string, map: Record<string, string>): string {
  return input
    .split('')
    .map((c) => (map[c] !== undefined ? map[c] : c))
    .join('');
}

export function transliterateISO9(input: string): string {
  return applyMap(input, ISO9_MAP);
}

export function transliterateICAO(input: string): string {
  return applyMap(input, ICAO_MAP);
}

export function transliterateBGN(input: string): string {
  return applyMap(input, BGN_MAP);
}

export function transliterateInformal(input: string): string {
  return applyMap(input, INFORMAL_MAP);
}

// ---------------------------------------------------------------------------
// 4. UTILITY
// ---------------------------------------------------------------------------

/**
 * Returns true if the string contains any Cyrillic characters.
 */
export function isCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

/**
 * Master function: generates all screening variants for a given name.
 *
 * - Cyrillic input → combinatorial TM variants (up to 20)
 * - Latin input → REVERSE_MAP variants (up to 20)
 * - Always includes the original input.
 *
 * Returns { variants: string[], standards: {...} | null, direction: 'cyrillic' | 'latin' }
 */
export function generateAllVariants(input: string): {
  variants: string[];
  standards: {
    iso9: string;
    icao: string;
    bgn: string;
    informal: string;
  } | null;
  direction: 'cyrillic' | 'latin';
} {
  const trimmed = input.trim();

  if (isCyrillic(trimmed)) {
    const combinatorial = transliterateCombinatorial(trimmed);
    // Expand each combinatorial variant through REVERSE_MAP
    const expanded = new Set<string>();
    for (const variant of combinatorial) {
      const reverseVariants = generateLatinVariants(variant);
      reverseVariants.forEach((v) => expanded.add(v));
    }
    const allVariants = [...expanded].slice(0, 20);
    return {
      variants: allVariants,
      standards: {
        iso9: transliterateISO9(trimmed),
        icao: transliterateICAO(trimmed),
        bgn: transliterateBGN(trimmed),
        informal: transliterateInformal(trimmed),
      },
      direction: 'cyrillic' as const,
    };
  }

  // Latin input
  const latinVariants = generateLatinVariants(trimmed);
  return {
    variants: latinVariants,
    standards: null,
    direction: 'latin',
  };
}

// ---------------------------------------------------------------------------
// 5. SCREENING HELPER — expand needles for sanctions matching
// ---------------------------------------------------------------------------

/**
 * Takes a vendor name and returns all variants to screen against sanctions lists.
 * Used by Screening.tsx pipeline.
 */
export function expandScreeningNeedles(name: string): string[] {
  const { variants } = generateAllVariants(name);
  // Always include the original
  const result = new Set<string>([name.trim(), ...variants]);
  return [...result];
}
