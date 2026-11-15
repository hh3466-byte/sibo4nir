import he from "./he";

// עברית היא שפת הבסיס. שפות נוספות (אם בכלל) יתווספו כאן בהמשך.
export const locales = ["he"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "he";

const rtlLocales: readonly Locale[] = ["he"];

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

const dictionaries: Record<Locale, Record<string, string>> = { he };

export type MessageKey = keyof typeof he;

export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  return dictionaries[locale][key] ?? dictionaries[defaultLocale][key] ?? key;
}
