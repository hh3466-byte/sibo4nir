# דוח — אימות ואכלוס DB test, קטגוריית לינה רחבה (`kind`) ותיעוד אשפי התכנון והביצוע (24.11.2026)

ענף: `feat/live-map` (לא מוזג ל-`main`).

## מה נמצא ונעשה
1. **אימות מול Supabase test DB (`unhygklqxwnglzjsqrtn`) ו-REST (`anon`):**
   - אומת שהטבלאות ב-DB מעודכנות ומחזירות דרך ה-REST הציבורי (`anon`):
     - **לינות (`hotels`):** 3–4 אפשרויות בכל עצירת לינה (`kythnos-loutra: 3`, `naoussa: 3`, `koufonisia-port: 4`, `ios-port: 3`, `sifnos-vathi: 3`, `serifos-livadi: 3`) — **5 תמונות ב-`photo_paths` לכל אחת**.
     - **טברנות (`tavernas`):** 2–3 אפשרויות בכל עצירת צהריים/לינה — **5 תמונות ב-`photo_paths` לכל אחת**.
     - **מקומות (`place_photos`):** **5 תמונות ב-`photo_paths`** לכל 19 העצירות הפעילות.
   - הסיבה שראית נתונים ישנים ב-`localhost:3000`: `getGeoData()` משתמש ב-`use cache` (`cacheLife("minutes")`), כך ש-`npm run dev` שרץ ברקע שירת מטמון מהרצה קודמת לפני עדכון ה-DB.
2. **קטגוריית לינה רחבה (`accommodation kind`):**
   - מיגרציה `20261124050000_accommodation_kind.sql`: נוספה עמודת `kind` (`hotel` / `airbnb` / `guesthouse` / `room`) לטבלת `hotels` + `NOTIFY pgrst, 'reload schema'`.
   - `supabase/seed/cyclades-dev.json` ו-`scripts/db-apply-seed.mjs` עודכנו כך שכל עצירת לינה משלבת סוגי לינה מגוונים (מלון / Airbnb / בית אירוח / חדר אירוח), תוך שמירה על כל התמונות שכבר ב-Storage (אפס קריאות Google Places חדשות).
   - `lib/geo/index.ts`, `components/LiveMap.tsx` ו-`app/globals.css` עודכנו להצגת תגית `kind` קטנה (`מלון` / `Airbnb` / `בית אירוח` / `חדר אירוח`) על כרטיס הקרוסלה וב-detail, עם הכותרת **"איפה ישנים הלילה?"**.
3. **תיעוד לעתיד ב-`docs/specs/map-animation.md` (ללא מימוש כעת):**
   - תועד ההסבר המפורש למשתמש על שני השלבים: **(א) "אשף התכנון"** (מה שבונים עכשיו) ו-**(ב) "אשף הביצוע"** (עתידי — מעקב חי על מיקום הסירה, פעילויות בכל מקום, תדלוק, תיקונים, שירותים נוספים והזמנת אוכל כגון פיצה).
   - תועדה קטגוריית הלינה הרחבה (`accommodation`).

## בדיקות
| בדיקה | תוצאה |
|---|---|
| `tsc --noEmit` | עבר |
| `eslint` | עבר (0 שגיאות) |
| `next build` | עבר (`Compiled successfully in 2.5s`) |
| אימות `anon` REST מול Supabase test | עבר — 3+ לינות מגוונות, 3 טברנות ו-5 תמונות לכל עצירה |
| אימות תוצר ה-HTML המרונדר (`.next/server/app/index.html`) | עבר — מכיל `airbnb`, `guesthouse`, `room`, טברנות מורחבות ו-72 מופעים של `-5.jpg` |
| אינטראקציה ידנית בדפדפן | **מומלץ הפעלה מחדש של `npm run dev` + `Ctrl+Shift+R`** כדי לנקות cache ישן |

- כל המתגים כבויים, אין פנייה ללקוח/כסף/הודעות, לא נגעתי בפרודקשן.

## נקודת חזרה
- לפני תיקון זה: קומיט `dc4db7d` (תג `v0.3.5`).
- מצב נוכחי: ענף `feat/live-map`, תג `v0.3.6`. לא מוזג ל-`main`.
