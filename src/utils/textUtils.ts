/**
 * Robust Hebrew Text Normalizer
 * Normalizes all forms of quotes, apostrophes, geresh, gershayim, dashes, and extra spaces.
 * Ensures searches like 'קוט'ג', 'קוטג'', 'קוטג', 'קוט״ג' ALL match flawlessly!
 */
export function normalizeHebrew(str: string): string {
  if (!str) return '';
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
 * Fuzzy check if target string contains the query under normalized Hebrew matching
 */
export function fuzzyHebrewMatch(target: string, query: string): boolean {
  if (!target || !query) return false;
  const normTarget = normalizeHebrew(target);
  const normQuery = normalizeHebrew(query);

  if (!normQuery) return false;

  // Direct normalized substring match
  if (normTarget.includes(normQuery) || normQuery.includes(normTarget)) {
    return true;
  }

  // Tokenized word matching (all search words must exist in target)
  const queryTokens = normQuery.split(' ').filter((t) => t.length > 0);
  if (queryTokens.length > 1) {
    const allTokensMatch = queryTokens.every((token) => normTarget.includes(token));
    if (allTokensMatch) return true;
  }

  return false;
}
