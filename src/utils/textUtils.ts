/**
 * Robust Hebrew Text Normalizer
 * Normalizes all forms of quotes, apostrophes, geresh, gershayim, dashes, and extra spaces.
 * Ensures searches like 'קוט'ג', 'קוטג'', 'קוטג', 'קוט״ג' ALL match flawlessly!
 */
export function normalizeHebrew(str: string): string {
  if (!str) return '';
  // Normalize known typos and common misspellings in Hebrew food terms
  str = (str || '')
    .replace(/קווטקר|קווקר|קואקר/gi, 'קוואקר')
    .replace(/תפוציפס|תפוצ'יפס|תפוציפ'ס/gi, "תפוצ'יפס")
    .replace(/שבולת/gi, 'שיבולת');

  return str
    .toLowerCase()
    // Replace Hebrew Geresh, Gershayim, ASCII single/double quotes, typographic quotes with empty string
    .replace(/['"`׳״’‘"“”״]/g, '')
    // Replace dashes, hyphens, slashes, punctuation with space
    .replace(/[-–—_.,/\\():;!?]/g, ' ')
    // Normalize consecutive spaces to single space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Known distinct Hebrew food pairs where one word is a substring of the other,
 * but they are completely DIFFERENT foods with different nutritional / SIBO profiles!
 * E.g., 'כרוב' (cabbage) vs 'כרובית' (cauliflower), 'שום' (garlic) vs 'שומשום' (sesame).
 */
const SEMANTIC_COLLISION_PAIRS: Array<{ wordA: string; wordB: string }> = [
  { wordA: 'כרוב', wordB: 'כרובית' },
  { wordA: 'שום', wordB: 'שומשום' },
  { wordA: 'דלעת', wordB: 'דלורית' },
  { wordA: 'חלב', wordB: 'חלבון' },
  { wordA: 'חלב', wordB: 'חלמון' },
];

/**
 * Fuzzy check if target string contains the query under normalized Hebrew matching.
 * Uses whole-word boundary matching and explicit semantic collision guards.
 */
export function fuzzyHebrewMatch(target: string, query: string): boolean {
  if (!target || !query) return false;
  const normTarget = normalizeHebrew(target);
  const normQuery = normalizeHebrew(query);

  if (!normQuery || !normTarget) return false;

  // Exact match
  if (normTarget === normQuery) return true;

  const targetTokens = normTarget.split(' ').filter((t) => t.length > 0);
  const queryTokens = normQuery.split(' ').filter((t) => t.length > 0);

  // 1. Guard against distinct Hebrew foods that share substring roots
  for (const pair of SEMANTIC_COLLISION_PAIRS) {
    const queryHasA = queryTokens.includes(pair.wordA);
    const queryHasB = queryTokens.includes(pair.wordB) || normQuery.includes(pair.wordB);
    const targetHasA = targetTokens.includes(pair.wordA);
    const targetHasB = targetTokens.includes(pair.wordB) || normTarget.includes(pair.wordB);

    // If query specifically asks for A and target is B (without A as independent token)
    if (queryHasA && !queryHasB && targetHasB && !targetHasA) {
      return false;
    }
    // If query specifically asks for B and target is A (without B)
    if (queryHasB && !queryHasA && targetHasA && !targetHasB) {
      return false;
    }
  }

  // 2. Exact token match (e.g. query 'כרוב' inside 'כרוב לבן טרי')
  if (queryTokens.length === 1 && targetTokens.includes(normQuery)) {
    return true;
  }
  if (targetTokens.length === 1 && queryTokens.includes(normTarget)) {
    return true;
  }

  // 3. Short token protection: In Hebrew, most root nouns are 3-4 letters
  // (שום, בצל, כרוב, דלעת, גזר, חלב, תה, ביצה, עוף, אורז, דג).
  // Require whole-token match if either side is <= 4 characters to prevent false positives.
  if (normTarget.length <= 4) {
    return queryTokens.includes(normTarget);
  }
  if (normQuery.length <= 4) {
    return targetTokens.includes(normQuery);
  }

  // 4. Substring match for longer strings (>= 5 chars)
  if (normTarget.includes(normQuery) || normQuery.includes(normTarget)) {
    return true;
  }

  // 5. Tokenized multi-word matching (all search words must exist in target)
  if (queryTokens.length > 1) {
    const allTokensMatch = queryTokens.every((token) =>
      token.length <= 4 ? targetTokens.includes(token) : normTarget.includes(token)
    );
    if (allTokensMatch) return true;
  }

  return false;
}
