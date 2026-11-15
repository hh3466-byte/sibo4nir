/**
 * מתגים (feature flags).
 * כל מה שפונה ללקוח או שולח הודעות – כבוי עד שחגי מאשר.
 * הדלקה = שינוי מפורש כאן, באישור חגי בלבד.
 */
export const flags = {
  customerJourney: false, // מסע הלקוח (חיפוש, הזמנה)
  payments: false, // גבייה דרך Grow
  invoicing: false, // חשבוניות דרך Morning
  whatsappMessaging: false, // שליחת הודעות וואטסאפ
  whatsappLogin: false, // כניסה בקוד חד-פעמי בוואטסאפ
  socialLogin: false, // כניסה עם גוגל/אפל
  bookingSystemSync: false, // חיבור למערכת ההזמנות (MMK/NauSYS)
  aiAssistant: false, // עוזר AI
} as const satisfies Record<string, boolean>;

export type FlagName = keyof typeof flags;

export function isEnabled(name: FlagName): boolean {
  return flags[name];
}
