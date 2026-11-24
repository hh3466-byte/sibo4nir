# תוכן למסלול הדגל — עגינה ואטרקציות

קובץ `route-content.json` מרכז שני סוגי תוכן אמיתי שחסרים כרגע ב-DB, מוכנים לסנכרון:

1. **`mooring_by_place`** — סיווג עגינה לכל אחת מ-19 התחנות (med / anchor / pickup) + הערה.
2. **`attractions_by_island`** — 3–4 אטרקציות אמיתיות לכל אחד מ-13 האיים, עם הערה והמלצת זמן ("כמה שעות ביבשה").

המחקר נשען על מקורות שייט (noforeignland, moorings.com, sailingissues, noonsite) וידע כללי. **כל נקודה ניתנת לעריכה** — חגי לאמת מול מפות ימיות/תצלומי לוויין, ובהמשך הרשת החברתית תוסיף ותתקן.

## מה צריך ב-Supabase (לעשות ביחד)

כרגע המודולים ב-UI עובדים עם placeholder:
- **מודול העגינה** (`components/LiveMap.tsx`) מחזיק את הבחירה ב-state (ברירת מחדל "לבדוק"); צריך שיקרא ערך התחלתי מ-`place.mooring`.
- **מודול "טיול בתוך האי"** מציג טקסט כללי; צריך שיציג את רשימת ה-`attractions` של האי.

### שינויי סכמה מוצעים

1. **עמודת `mooring` בטבלת `places`** — `text`, ערכים: `med` | `anchor` | `pickup` | `null`.
   ```sql
   alter table places add column if not exists mooring text;
   ```
   ואז עדכון מתוך `mooring_by_place` (place_id → mooring).

2. **טבלת `attractions`** חדשה (או עמודת JSON ב-`islands`):
   ```sql
   create table if not exists attractions (
     id bigserial primary key,
     island_id text references islands(id),
     name text not null,
     note text,
     sort int default 0
   );
   ```
   ואז הזרמה מתוך `attractions_by_island`.

### שינויים ב-`lib/geo/index.ts`

- לקרוא `mooring` מ-`places` ולהוסיף לשדה `Place`.
- לקרוא `attractions` (עם join ל-island) ולהחזיר `attractionsByIsland`.

### שינויים ב-`components/LiveMap.tsx`

- במודול העגינה: ברירת מחדל `cur = mooring[place.id] ?? place.mooring` (עדיין ניתן לעריכה ידנית).
- במודול הטיול: לרנדר את רשימת ה-`attractions` של `activeStop.place.island` (קרוסלה/רשימה) במקום הטקסט הכללי.

## סדר ביצוע מומלץ (כשחגי זמין)

1. להריץ את ה-SQL (migrations) מול Supabase (test ואז prod).
2. סקריפט sync קטן (`scripts/sync-content.mjs`) שקורא את `route-content.json` וכותב ל-`places.mooring` ו-`attractions`.
3. עדכון `lib/geo` + `LiveMap` לקריאת הנתונים.
4. אימות בדפדפן: תג העגינה הנכון לכל תחנה, ואטרקציות אמיתיות בכל אי.

> הערה: הכתיבה ל-Supabase דורשת את המפתחות/הגישה של חגי — לכן זה שלב שנעשה ביחד, לא בעבודת לילה.
