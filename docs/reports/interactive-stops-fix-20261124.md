# דוח — תיקון קריטי לעצירות אינטראקטיביות (overlay אבסולוטי, sticky footer, cooperativeGestures והסרת הגריד) (24.11.2026)

ענף: `feat/live-map` (לא מוזג ל-`main`).

## מה נעשה
1. **כרטיס עצירה כ-overlay קומפקטי מעל המפה (`components/LiveMap.tsx`, `app/globals.css`):**
   - `.tmo-map-wrap` מוגדר `position: relative` (ב-CSS וגם inline), ו-`.tmo-stop-pop` מוגדר `position: absolute` מעל המפה (`max-width: 380px`, `max-height: 72%` מגובה המפה, `display: flex; flex-direction: column; overflow: hidden`).
   - מיקום בצד הנגדי לנקודת העצירה כדי לא להסתיר את המרקר; המפה החיה נשארת גלויה מאחור; אנימציית `scale + fade` ממשיכה לצאת מקואורדינטת המרקר (`transform-origin`).
2. **גובה חסום וגלילה פנימית בלבד:**
   - `.tmo-stop-modal-media` הוקטן לגובה קומפקטי קבוע (`150px`, `flex-shrink: 0`).
   - `.tmo-stop-scroll` מוגדר `flex: 1; min-height: 0; overflow-y: auto` כך שכל הגלילה נשארת בתוך הכרטיס בלבד.
3. **כפתור "המשך" קבוע (`sticky`):**
   - `.tmo-stop-footer` מוגדר `position: sticky; bottom: 0; flex-shrink: 0` בתחתית הכרטיס, כך שכפתור **"המשך ← ..."** גלוי תמיד בלי לגלול (גם בתצוגת העצירה וגם בתצוגות ה-detail של טברנות ומלונות).
4. **תיקון מלכודת הגלילה במפה:**
   - נוסף `cooperativeGestures: true` באתחול `mapboxgl.Map` — גלגלת העכבר גוללת את העמוד כרגיל, וזום במפה נעשה עם `Ctrl`/`⌘` + גלגלת.
5. **הסרת הגריד הסטטי מתחת למפה (`app/page.tsx`, `app/globals.css`):**
   - הוסר `section-cream` עם `.stops-grid` (19 הכרטיסים הסטטיים) — החוויה האינטראקטיבית על המפה מחליפה אותו.
6. **עדכון ספק:** `docs/specs/map-animation.md` עודכן בכל הדרישות.

## בדיקות
| בדיקה | תוצאה |
|---|---|
| `tsc --noEmit` | עבר |
| `eslint` | 0 שגיאות (7 אזהרות מוכרות) |
| `next build` | עבר (`Compiled successfully in 3.6s`) |
| בדיקה אינטראקטיבית בדפדפן (`npm run dev`) | **לא נבדקה** |

- כל המתגים כבויים, אין פנייה ללקוח/כסף/הודעות, לא נגעתי בפרודקשן.

## נקודת חזרה
- לפני תיקון זה: קומיט `97e2764` (תג `v0.3.3`).
- מצב נוכחי: ענף `feat/live-map`, תג `v0.3.4`. לא מוזג ל-`main`.
