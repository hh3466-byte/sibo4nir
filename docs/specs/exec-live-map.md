# פקודת ביצוע — חלק 1: מפה חיה

מתחילים מחלק 1 מתוך שלושת חלקי השלד (ראה docs/brief-20261124.md §5). קרא קודם את docs/brief-20261124.md, docs/specs/design-system.md ו-docs/specs/geo-seed.md.

1. מפתח Mapbox כבר נמצא ב-.env.local כ-NEXT_PUBLIC_MAPBOX_TOKEN (מפתח ציבורי). הוסף אותו גם לסביבת Vercel בעת פריסה. אל תדפיס אותו בדוח.
2. קמט ל-main: CLAUDE.md + docs/brief-20261124.md + docs/specs/design-system.md + docs/specs/geo-seed.md + supabase/seed/cyclades-dev.json. הודעת קומיט בעברית.
3. פתח ענף feat/live-map וקבע תג חזרה. בלי מיזוג ל-main בלי "מאושר".
4. סכמה ב-Supabase test (RLS סגור): islands, places, tavernas, hotels, routes. טען את supabase/seed/cyclades-dev.json. בלי פרודקשן בשלב זה.
5. מפה חיה: Mapbox Satellite GL, טוקן מ-NEXT_PUBLIC_MAPBOX_TOKEN. הצג את ה-places כסמנים ואת מסלול הדגל "לב הקיקלדים" כקו פליז מעל המים — זום-אין לכל עצירה, אותה סירה לכל אורכו. נתיב בין עצירות שלא חוצה יבשה (בפיתוח קו פשוט מספיק; לפני הדגמה — ניתוב מים אמיתי).
6. עיצוב וקול לפי docs/specs/design-system.md בלבד: צבעי דיו/שמנת/פליז, גופנים Frank Ruhl Libre + Heebo, RTL מלא.
7. בלי פנייה ללקוח, בלי כסף, בלי הודעות. כל המתגים כבויים.
8. שמור דוח בעברית ב-docs/reports/, כולל נקודת חזרה. שלושה צפצופים כשתסיים.
