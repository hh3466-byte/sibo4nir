דוח שלב 0 – תשתית – Take Me Out (15.11.2026)

מה הוקם
1. Git: ה-repo אותחל ב-C:\Projects\take-me-out, ענף main. יש .gitignore (כולל .env*, .vercel ו-.claude/settings.local.json), README בעברית ו-CLAUDE.md עם כללי העבודה.
2. Next.js 16.4.6 (App Router, TypeScript, Tailwind 4) כ-PWA:
   - html lang="he" dir="rtl", גופן Heebo, עמוד בית ריק בעברית בלבד.
   - app/manifest.ts (lang he, dir rtl) ואייקונים זמניים 192/512.
   - lib/i18n: עברית היא שפת הבסיס (he.ts, t(), getDirection()).
   - lint ו-build עוברים.
3. מבנה התיקיות:
   - app/api/webhooks/{grow, booking-system, whatsapp}: מחזירים 200 בלי שום לוגיקה ובלי לשמור את הגוף.
   - lib/payments (Grow), lib/invoicing (Morning), lib/messaging (Green API, ובהמשך Cloud API), lib/booking (MMK/NauSYS): ממשקים ריקים בלבד.
   - supabase/migrations, supabase/functions, docs/specs.
   - config/flags.ts: שמונה מתגים, כולם false.
4. Supabase: שני פרויקטים חדשים בפרנקפורט (eu-central-1), בארגון hh3466-byte's Org:
   - take-me-out-test, ref unhygklqxwnglzjsqrtn, https://supabase.com/dashboard/project/unhygklqxwnglzjsqrtn
   - take-me-out-prod, ref alymjydmogcxuzjzbsez, https://supabase.com/dashboard/project/alymjydmogcxuzjzbsez
   - בשניהם רצה המיגרציה 20261115000000_rls_closed_by_default: כל טבלה חדשה ב-public מקבלת RLS אוטומטית ובלי policy, כלומר סגורה.
   - אימות: בשני הפרויקטים נוצרה טבלת בדיקה בתוך טרנזקציה שבוטלה (rollback), וה-RLS הופעל בה אוטומטית. מספר הטבלאות ב-public: 0.
   - סיסמאות מסד הנתונים נוצרו מקומית ונשמרו רק ב-.env.local, שלא נכנס ל-git. הן לא הוצגו בצ'אט.
5. Vercel: נוצר הפרויקט take-me-out (חשבון hh3466-1830) ונפרס ל-production מהמחשב המקומי.
   - כתובת: https://take-me-out-two.vercel.app
   - בדקתי בפריסה: html lang="he" dir="rtl", ו-POST ל-/api/webhooks/grow מחזיר 200.

מה נשאר ריק בכוונה
- אין טבלאות, לא של לקוחות ולא של הזמנות.
- אין חיבור ל-Grow, Morning, Green API, MMK או NauSYS.
- אין שליחת הודעות ואין תשלומים.
- אין משתני Supabase ב-Vercel, והאפליקציה לא מתחברת ל-Supabase. החיבור אומת רק דרך ה-CLI.
- ה-webhooks לא עושים כלום, וכל המתגים כבויים.
- האייקונים זמניים (TMO על רקע כחול).

נקודת חזרה
- ענף main, תג v0.0.1-skeleton (commit 59937c9). הדוח הזה נשמר ב-commit שאחריו.
- פריסת Vercel: dpl_Z9C2qobJKmx93tSuAitQyESVzqLk.
- גיבוי Supabase: אין מה לגבות (0 טבלאות).

מה חסם, ועובדות שכדאי שתדע
- ה-repo לא מחובר ל-Git ב-Vercel: אין repo ב-GitHub ואין remote, ו-gh לא מותקן. הפריסה נעשתה מה-CLI.
- הגנת הפריסה (Vercel Authentication) פעילה: האתר נפתח רק למי שמחובר לחשבון ה-Vercel.
- הבדיקה עם vercel curl יצרה בפרויקט סוד מסוג "Protection Bypass for Automation". הוא נשאר בפרויקט עד שמבטלים אותו.
- Vercel ממליץ להפעיל אימות דו-שלבי בחשבון: https://vercel.com/account/settings/authentication?setup=authenticator
- בארגון ה-Supabase יש עכשיו שלושה פרויקטים: hh3466-byte's Project הקיים, ועוד שני החדשים. לא בדקתי את התוכנית או החיוב של הארגון.
