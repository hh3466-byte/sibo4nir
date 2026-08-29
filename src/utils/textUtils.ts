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
 * Fuzzy check if target string contains the query under normalized Hebrew matching.
 * Uses whole-word boundary matching for short words to prevent false positives (e.g. 'מש' inside 'להשתמש').
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

  // If one of the strings is a short token (<= 3 chars), require whole-token match
  if (normTarget.length <= 3) {
    return queryTokens.includes(normTarget);
  }
  if (normQuery.length <= 3) {
    return targetTokens.includes(normQuery);
  }

  // Substring match for longer strings
  if (normTarget.includes(normQuery) || normQuery.includes(normTarget)) {
    return true;
  }

  // Tokenized word matching (all search words must exist in target)
  if (queryTokens.length > 1) {
    const allTokensMatch = queryTokens.every((token) =>
      token.length <= 3 ? targetTokens.includes(token) : normTarget.includes(token)
    );
    if (allTokensMatch) return true;
  }

  return false;
}
