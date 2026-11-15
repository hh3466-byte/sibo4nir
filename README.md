# Take Me Out

אפליקציית ווב בעברית (PWA) להזמנה ותשלום של השכרת סירות ויאכטות ביוון, לשוק הישראלי.

מקור אמת: `docs/brief-20261115.md`. מפרטים: `docs/specs/`.

## מחסנית
- Next.js (App Router) + TypeScript + Tailwind, עברית ו-RTL כברירת מחדל.
- Supabase – שני פרויקטים נפרדים: test ו-prod.
- Vercel – אירוח ופריסה.

## מבנה
| תיקייה | תפקיד |
|---|---|
| `app/` | מסע הלקוח (RTL) |
| `app/api/webhooks/` | webhooks של Grow, מערכת ההזמנות ו-WhatsApp – ריקים בשלב זה |
| `lib/payments/` | שכבת Grow |
| `lib/invoicing/` | שכבת Morning |
| `lib/messaging/` | שכבת שליחה אחידה (Green API) |
| `lib/booking/` | מתאם אחיד ל-MMK / NauSYS |
| `lib/i18n/` | טקסטים, עברית כשפת בסיס |
| `config/flags.ts` | מתגים – הכול כבוי עד אישור |
| `supabase/migrations/` | מיגרציות |
| `supabase/functions/` | Edge Functions |

## הרצה מקומית
```
npm install
npm run dev
```

## כללים
- סודות רק במשתני סביבה (`.env.local`, לא נכנס ל-git) או ב-Vercel / Supabase.
- בלי מחיקות נתונים – סימון/הסתרה בלבד.
- כל מה שפונה ללקוח או שולח הודעות – מאחורי מתג כבוי.
