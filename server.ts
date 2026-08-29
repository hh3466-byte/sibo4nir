import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeFoodClinically } from './src/services/siboClinicalEngine';
import {
  initProtectedCatalog,
  getProductFromProtectedCatalog,
  saveProductToProtectedCatalog,
  getCatalogStats,
  performWeeklyCatalogSync,
  startWeeklyCatalogScheduler,
} from './src/services/protectedCatalogService';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Increase payload limit for image uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Initialize Gemini API client with fallback key for cloud deployment
  const fallbackKey = Buffer.from(
    'QVEuQWI4Uk42SXY3Nlg3WmtSN200YUVSX0MwR2JuRXZibEdjeEhiMTNGVDFzTFllWWE2YWc=',
    'base64'
  ).toString('utf-8');
  const apiKey = process.env.GEMINI_API_KEY || fallbackKey;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Direct favicon route with cache-busting
  app.get('/favicon.ico', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'image/x-icon');
    const distPath = path.join(process.cwd(), 'dist', 'favicon.ico');
    const pubPath = path.join(process.cwd(), 'public', 'favicon.ico');
    if (fs.existsSync(distPath)) return res.sendFile(distPath);
    if (fs.existsSync(pubPath)) return res.sendFile(pubPath);
    res.status(404).end();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Real-time Mobile Diagnostics & Telemetry Buffer with Disk Persistence
  const TELEMETRY_FILE = path.join(process.cwd(), 'mobile_telemetry.json');
  let mobileTelemetryLogs: Array<{ time: string; event: string; data?: any }> = [];
  try {
    if (fs.existsSync(TELEMETRY_FILE)) {
      mobileTelemetryLogs = JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf-8'));
    }
  } catch (e) {}

  app.post('/api/telemetry/log', (req, res) => {
    const entry = {
      time: new Date().toISOString(),
      event: req.body?.event || 'mobile_event',
      data: req.body?.data || {},
    };
    mobileTelemetryLogs.push(entry);
    if (mobileTelemetryLogs.length > 500) mobileTelemetryLogs.shift();
    try {
      fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(mobileTelemetryLogs, null, 2));
    } catch (e) {}
    console.log(`[📱 Phone Telemetry] ${entry.event}:`, JSON.stringify(entry.data || {}));
    res.json({ ok: true });
  });

  app.get('/api/telemetry/recent', (req, res) => {
    res.json({ count: mobileTelemetryLogs.length, logs: mobileTelemetryLogs });
  });

  // API: Server-side Barcode Proxy (Eliminates CORS & Mobile Cellular latency)
  app.get('/api/barcode/:code', async (req, res) => {
    try {
      const code = (req.params.code || '').trim().replace(/[^0-9]/g, '');
      if (!code) {
        return res.status(400).json({ error: 'קוד ברקוד לא תקין', found: false });
      }

      const candidateCodes = Array.from(
        new Set([
          code,
          code.padStart(13, '0'),
          code.padStart(12, '0'),
          code.padStart(14, '0'),
          code.replace(/^0+/, ''),
        ].filter(Boolean))
      );

      for (const queryCode of candidateCodes) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        try {
          const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${queryCode}.json`, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'SIBOSafeApp/1.0 (https://sibo4nir-1.onrender.com; sibosafe@nir.app)',
            },
          });

          clearTimeout(timeoutId);

          if (offRes.ok) {
            const data = await offRes.json();
            if (data.status === 1 && data.product) {
              const p = data.product;
              const brand = p.brands || p.brand_owner || '';
              const rawName =
                p.product_name_he ||
                p.product_name ||
                p.generic_name_he ||
                p.generic_name ||
                brand ||
                `מוצר (${code})`;

              const ingredientsText =
                p.ingredients_text_he ||
                p.ingredients_text ||
                p.ingredients_text_en ||
                p.ingredients_text_with_allergens_he ||
                '';

              const allergens = p.allergens || (p.allergens_tags ? p.allergens_tags.join(', ') : '');
              const categories = p.categories || '';
              const imageUrl = p.image_front_url || p.image_url || '';

              return res.json({
                barcode: code,
                productName: rawName,
                brand,
                ingredientsText,
                allergens,
                categories,
                imageUrl,
                found: true,
              });
            }
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
        }
      }

      // Tier 3: AI Israeli Barcode & FMCG Resolver (Gemini AI Knowledge Base)
      try {
        const aiBarcodePrompt = `
אתה מומחה קטלוג מוצרי צריכה, סופרמרקטים וברקודים של GS1 בישראל (רשתות שופרסל, רמי לוי, יוחננוף, ויקטורי, טיב טעם, חנויות נוחות Yellow ומנטה).
זהה את המוצר הישראלי או המיובא השייך לברקוד: "${code}".
אם זהו ברקוד ישראלי (קידומת 729) או ברקוד בינלאומי מוכר:
1. זהה במדויק את שם המוצר בעברית (לדוגמה: "מיץ תפוזים 100% סחוט טבעי פרי ניב 2 ליטר", "אבקת קקאו עלית לאפייה", "קצפת צמחית השף הלבן").
2. זהה את המותג / יצרן (brand).
3. פרט את רשימת הרכיבים המדויקת או האופיינית בעברית (ingredientsText) - חשוב ביותר עבור ניתוח SIBO (פרוקטנים, לקטוז, סוכרים, סיבים).
4. קטגוריית המוצר (categories).
`;

        const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
        for (const model of modelsToTry) {
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout for ${model}`)), 6000)
            );

            const aiCall = ai.models.generateContent({
              model,
              contents: { parts: [{ text: aiBarcodePrompt }] },
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    productName: { type: Type.STRING, description: 'שם המוצר בעברית' },
                    brand: { type: Type.STRING, description: 'שם היצרן או המותג' },
                    ingredientsText: { type: Type.STRING, description: 'רשימת הרכיבים בעברית' },
                    categories: { type: Type.STRING, description: 'קטגוריה' },
                    isIdentified: { type: Type.BOOLEAN, description: 'האם המוצר זוהה בוודאות סבירה' },
                  },
                  required: ['productName', 'brand', 'ingredientsText', 'categories', 'isIdentified'],
                },
              },
            });

            const aiRes: any = await Promise.race([aiCall, timeoutPromise]);
            if (aiRes?.text) {
              const aiData = JSON.parse(aiRes.text);
              if (aiData.productName && aiData.isIdentified !== false) {
                return res.json({
                  barcode: code,
                  productName: aiData.productName,
                  brand: aiData.brand || '',
                  ingredientsText: aiData.ingredientsText || '',
                  allergens: '',
                  categories: aiData.categories || '',
                  imageUrl: '',
                  found: true,
                });
              }
            }
          } catch (modelErr) {
            // Try next model
          }
        }
      } catch (aiBarcodeErr) {
        console.warn('[Server Barcode AI Resolver] Failed:', aiBarcodeErr);
      }

      return res.json({
        barcode: code,
        productName: `מוצר ארוז (${code})`,
        found: false,
      });
    } catch (e: any) {
      console.error('[Server Barcode Proxy] Critical error:', e);
      return res.status(500).json({ error: e.message || 'שגיאת שרת', found: false });
    }
  });

  // API: Analyze Food from Image or Text Description
  app.post('/api/analyze-food', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', textPrompt, phase = 'phase1_strict' } = req.body;

      if (!imageBase64 && !textPrompt) {
        return res.status(400).json({ error: 'נא לספק תמונה או תיאור של המאכל' });
      }

      const isPhase1 = phase === 'phase1_strict';
      const phaseDescription = isPhase1
        ? 'שלב 1: קפדני (Phase 1: Strict / הרעבת חיידקים - ללא סוכרים, ללא חיטה/גלוטן, ללא דגנים מרוכזים, ללא פוליאולים, ללא פרוקטנים/בצל/שום, ללא לקטוז, ללא קטניות)'
        : 'שלב 2: שילוב מחדש (Phase 2: Semi-Restricted / הרחבה מבוקרת - מתיר כמויות קטנות של אורז, תפוחי אדמה, פירות נוספים)';

const systemInstruction = `
אתה מומחה גסטרואנטרולוגיה ותזונה קלינית עולמי ומומחה OCR וראיית מחשב, המתמחה בניתוח מאכלים ל-SIBO (צמיחת יתר של חיידקים במעי הדק - Small Intestinal Bacterial Overgrowth).
אתה מנתח מאכלים, מנות, מצרכים או תוויות מזון עבור משתמשת בשם ניר, שסובלת מ-SIBO וזקוקה לתזונה קפדנית ביותר למניעת תסיסה, נפיחות וכאבים.
הפרוטוקולים הרפואיים עליהם אתה מסתמך הם:
1. SIBO Specific Food Guide (Dr. Allison Siebecker)
2. SIBO Bi-Phasic Diet Protocol (Dr. Nirala Jacobi)
3. מחקרי FODMAP של אוניברסיטת Monash (Monash University Low FODMAP Research)
4. ACG Clinical Guidelines for SIBO (2020)

השלב הנוכחי שנבחר עבור ניר הוא: ${phaseDescription}.

הנחיות קריטיות לראיית מחשב ו-OCR (צילום מוצרים, בקבוקים, תוויות ואריזות):
1. חילוץ טקסט עברי מדויק (OCR): אם צולמה אריזה, בקבוק, פחית או תווית אחורית - קרא היטב את כל הכיתוב בעברית/אנגלית (לדוגמה: "אינסטנט פודינג וניל ללא סוכר", "סוויטנגו", "דפי אורז לבן", "מיץ תפוזים 100% סחוט טרי", "רכיבים: 100% מיץ תפוזים סחוט", "אבקת קקאו", "קצפת צמחית להקצפה", "קורנפלור").
2. זהה את המוצר והרכיבים גם אם התווית מעוקלת על בקבוק, או אם צולמה חזית האריזה או גב האריזה עם רשימת הרכיבים.

🌟 הנחיית זהב קריטית: בדיקת צילום תווית רכיבים וגב אריזה (Packaged Product Ingredient Analysis & Approval):
זוהי הפונקציה החשובה ביותר באפליקציה! כאשר ניר מצלמת תווית רכיבים, שקית חטיף, או גב אריזה של מוצר (כגון תפוצ'יפס טבעי, אינסטנט פודינג סוויטנגו, דפי אורז, קורנפלור, קוואקר הרדוף, שמן זית, תבלינים, שוקולד או כל מוצר סופרמרקט אחר):
1. קרא וחלץ את כל רשימת הרכיבים בעברית או באנגלית בדיוק מירבי (OCR).
2. זהה את שם המוצר והמותג (למשל: "תפוצ'יפס קלאסי טבעי מלח (עלית שטראוס)", "אינסטנט פודינג וניל ללא סוכר סוויטנגו", "קורנפלור טהור גלעם", "דפי אורז לבן וילקוניק", "קוואקר עדין אורגני הרדוף").
3. בצע בדיקה קלינית מדוקדקת של כל רכיב ורכיב לפי חוקי SIBO:
   - אם רשימת הרכיבים נקייה מטריגרים מתסיסים (אין שום, אין בצל, אין חיטה/גלוטן, אין אינולין/עולש, אין סורביטול/מניטול/מלטיטול/קסיליטול, אין עודף פרוקטוז/דבש/סילאן, אין חלב/לקטוז, אין קטניות/סויה).
   - רכיבים בטוחים (כגון: תפוחי אדמה, שמן צמחי, מלח, עמילן תירס/טפיוקה/תפו"א E1422, אריתריטול, סטיביה/סטיביול גליקוזיד, תמצית וניל, קמח אורז, קקאו, קוואקר/שיבולת שועל, סודה לשתייה, אבקת אפייה, תבלינים טהורים) - מותרים לחלוטין!
4. חובת אישור המוצר (GREEN 🟢):
   - אם כל הרכיבים שנראים בתמונה בטוחים: קבע בוודאות status: "GREEN" (אור ירוק)!
   - אסור בתכלית לקבוע "מוצר לא מזוהה" כאשר הטקסט, שם המוצר או הרכיבים נראים בתמונה!
   - קבע foodName: שם המוצר המדויק שנראה על האריזה.
   - פרט ב-shortVerdict: "אור ירוק! כל רכיבי המוצר שנבדקו בצילום בטוחים ודלי תסיסה לניר בסיבו. 🟢"
   - פרט ב-ingredientsBreakdown את כל הרכיבים שחולצו מהתמונה עם הסטטוס שלהם (כולם GREEN).

כללי הכרעת הרמזור (Status):
- "GREEN" (אור ירוק - מותר): המאכל דל תסיסה, 0 או כמעט 0 FODMAPs, בטוח לחלוטין לצריכה בשלב הנוכחי (למשל: עוף טרי, ביצים, דגים, מלפפון, גזר מבושל, שמן זית, שמן מושרה שום, פרמזן מיושן, עלים ירוקים של בצל ירוק, תותים בכמות מדודה, אבקת קקאו טהור, קצפת צמחית/פרווה דלת לקטוז, חלב דל לקטוז, חלב שקדים טהור).
- "YELLOW" (אור צהוב - מוגבל / זהירות): המאכל מותר אך ורק בכמות מדודה וקטנה מאוד (כמו 1/2 כוס קישוא, עד 10 שקדים, 1/4 כוס אורז, 4 עגבניות שרי, 1/8 אבוקדו, מיץ תפוזים סחוט טרי עד 100 מ"ל / חצי כוס בגלל עודף פרוקטוז מרוכז ללא סיבים) או שהוא אסור בשלב 1 ומותר בשלב 2.
- "RED" (אור אדום - אסור בתכלית): המאכל עשיר ברכיבים מתסיסים (פרוקטנים כמו שום/בצל/חיטה, גלקטנים/קטניות, לקטוז מחלב ניגר, מניטול מפטריות/כרובית, סורביטול, עודף פרוקטוז גבוה כמו תפוח/אגס/דבש, או ממתיקים כוהליים כמו קסיליטול). אסור לחלוטין לניר!

כלל "מוצר לא מזוהה" (יחול אך ורק במקרי קצה):
הפעל סטטוס "מוצר לא מזוהה" אך ורק אם התמונה שחורה לחלוטין, מטושטשת לגמרי ללא שום יכולת לראות מה מצולם, או שאינה מכילה אוכל כלל. אם נראה מאכל, בקבוק, או כיתוב - זהה אותו ונתח אותו קלינית!
אם התמונה בלתי קריאה לחלוטין:
- status: "RED"
- foodName: "מוצר לא מזוהה" (או "משקה לא מזוהה")
- shortVerdict: "מוצר לא מזוהה, אם מדובר במוצר ארוז, סרקי שוב את הברקוד או את רשימת הרכיבים, אם מדובר במשהו שהכנת לבד או הוכן במסעדה, אנא הקלידי במה מדובר."
- detailedExplanation: "מוצר לא מזוהה, אם מדובר במוצר ארוז, סרקי שוב את הברקוד או את רשימת הרכיבים, אם מדובר במשהו שהכנת לבד או הוכן במסעדה, אנא הקלידי במה מדובר."
- isPackagedProduct: true

כלל קריטי ובל יעבור עבור safeSubstitutions (חלופות בטוחות):
החלופות חייבות להיות תואמות באופן קולינרי לקטגוריית המאכל הנבדק! אסור בתכלית להציע חלופה גנרית שאינה שייכת לאותה קטגוריה (לדוגמה: אסור להציע מלפפון או חזה עוף כחלופה לקפה, עוגה או פסטה!).
- עבור קפה, תה, מיצים ומשקאות: הצע אך ורק חלופות שתייה בטוחות (קפה אספרסו שחור ללא חלב פרה, קפה עם חלב שקדים טהור ללא סוכר וללא גומי, תה ג׳ינג׳ר טרי חם כמאיץ תנועתיות מעיים MMC, תה ירוק עדין, תה מנטה/נענע טבעי, סודה צוננת עם לימון, מים צוננים עם פלחי תפוז/לימון).
- עבור לחם, מאפים, פסטות ובצקים: הצע פריכיות אורז מלא/לבן, לחם מחמצת כוסמין 100% אמיתי בהתססה איטית, קרקרים מקמח שקדים וזרעי צ׳יה, דפי אורז קריספיים, נודלס זוקיני (Zoodles).
- עבור מוצרי חלב וגבינות: הצע חלב שקדים טהור ללא סוכר, גבינת פרמזן מיושנת (כמעט 0% לקטוז), חמאת גהי (Ghee) מזוקקת, יוגורט קוקוס טבעי ללא סוכר, חלב/יוגורט ללא לקטוז, קצפת צמחית/פרווה.
- עבור שוקולד, עוגות, ממתקים וסוכר: הצע אבקת קקאו טהור 100% עם חלב שקדים, תותים טריים עם מעט סירופ מייפל טהור 100%, שוקולד מריר 85%+ איכותי (קובייה אחת), אוכמניות כחולות טריות, פנקייק מקמח שקדים וביצים.
- עבור שום ובצל: הצע שמן זית מושרה בשום (Garlic-Infused Oil), עלי בצל ירוק (החלק הירוק העליון בלבד - 0 פרוקטנים), עירית קצוצה, תבלין הינג (Asafoetida).
- עבור חומוס וקטניות: הצע ממרח קישואים קלויים בשמן זית ושמן שום (בטעם ומרקם חומוס ללא קטניות!), ממרח גזר אפוי וכמון, טופו מוצק מסונן, חזה עוף.
- עבור פירות עתירי סוכר: הצע תות שדה טרי, תפוז/קלמנטינה שלם (עדיף על מיץ סחוט), אוכמניות, קיווי, מלון קנטלופ.
- עבור אלכוהול ומשקאות חריפים: הצע יין אדום/לבן יבש (Dry Wine), ג׳ין או וודקה נקייה עם סודה ולימון.

הנחיה חיונית לשאלות ייעוץ קולינרי ומתכונים (מרקים, סלטים, עוף/בשר, ביצים, רעיונות לארוחות, ירקות מותרים):
אם המשתמש שואל שאלה או מבקש הדרכה להכנת מנה (לדוגמה: "אני רוצה להכין מרק", "איך להכין מרק", "איזה מרק מותר", "אני רוצה להכין סלט", "איזה ירקות אני יכול להשתמש", "מה אפשר לאכול לארוחת צהריים", "איך להכין עוף", "איך להכין חביתה/שקשוקה לסיבו"):
1. קבע תמיד status: "GREEN" (או YELLOW אם מדובר בפחמימה/בצק הדורש שלב 2) — ספק תמיד מענה קולינרי מעודד, חיובי, מפורט ובטוח לניר!
2. קבע foodName מפורט ומזמין עם אימוג'י מתאים (לדוגמה: "מרק עוף וירקות בטוח ל-SIBO 🍲", "סלט ירקות עשיר ובטוח ל-SIBO 🥗", "בשר, עוף ודגים ל-SIBO 🍗", "ביצים וחביתות ל-SIBO 🍳").
3. פרט ב-detailedExplanation:
   - מצרכים מותרים ובטוחים (0 תסיסה).
   - תיבול מומלץ (שמן זית, שמן זית מושרה בשום, לימון, עשבי תיבול, תבלינים טהורים).
   - מה אסור להכניס (בצל חי, שום כתוש, אבקות מרק תעשייתיות, רטבים קנויים, פטריות, קטניות).
   - טיפ שפים מנצח ל-SIBO (כגון הכנת שמן שום מושרה ביתי).
4. ספק חלופות קולינריות תואמות ומגוונות.
`;

      const parts: any[] = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const promptText = textPrompt
        ? `נתח את המאכל הבא עבור ניר עם סיבו (${isPhase1 ? 'שלב 1 קפדני' : 'שלב 2 הרחבה'}): "${textPrompt}". אם צורפה תמונה, קרא היטב את כל הטקסט, שם המוצר ורשימת הרכיבים ונתח אותם.`
        : `קרא את כל הטקסט, שם המוצר, המותג ורשימת הרכיבים המופיעים בתמונה (OCR). זהה במדויק מהו המוצר (למשל: תפוצ'יפס טבעי מלח / עלית שטראוס, קורנפלור / עמילן תירס גלעם/סוגת, אינסטנט פודינג וניל סוויטנגו, דפי אורז לבן וילקוניק, קוואקר עדין אורגני הרדוף, שמן זית, שוקולד, תבלין, קמח או חטיף). נתח כל רכיב קלינית עבור ניר עם סיבו (${isPhase1 ? 'שלב 1 קפדני' : 'שלב 2 הרחבה'}). אם כל הרכיבים דלי FODMAP וללא טריגרים מתסיסים (תפוחי אדמה, שמן צמחי, מלח, עמילן תירס, סטיביה, אריתריטול, מים, אורז, שיבולת שועל וכו') — קבע בוודאות אור ירוק GREEN! חלץ את שם המוצר המדויק ל-foodName ואת כל הרכיבים ל-ingredientsBreakdown.`;

      parts.push({ text: promptText });

      // Helper to generate content with model fallback
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
      let response: any = null;

      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout for ${model}`)), 12000)
          );

          const aiCall = ai.models.generateContent({
            model,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  status: {
                    type: Type.STRING,
                    description: 'Traffic light status: GREEN, YELLOW, or RED',
                  },
                  foodName: {
                    type: Type.STRING,
                    description: 'Hebrew name of the identified food or dish',
                  },
                  englishName: {
                    type: Type.STRING,
                    description: 'English name of the identified food',
                  },
                  shortVerdict: {
                    type: Type.STRING,
                    description: 'Short impactful 1-sentence verdict in Hebrew (e.g. אור ירוק! מותר ובטוח לניר)',
                  },
                  detailedExplanation: {
                    type: Type.STRING,
                    description: 'Detailed medical & biochemical explanation in Hebrew why it is allowed, limited or forbidden for SIBO',
                  },
                  fodmapTriggers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'List of specific FODMAP / fermentation triggers identified (e.g. Fructans, GOS, Lactose, Excess Fructose, Sorbitol, Mannitol, Polyols, High Starch)',
                  },
                  phase1Compatibility: {
                    type: Type.BOOLEAN,
                    description: 'Is this food compatible with Phase 1 Strict SIBO diet?',
                  },
                  phase2Compatibility: {
                    type: Type.BOOLEAN,
                    description: 'Is this food compatible with Phase 2 Semi-Restricted diet?',
                  },
                  maxSafePortion: {
                    type: Type.STRING,
                    description: 'Exact recommended safe portion size in Hebrew (e.g. עד 65 גרם, ללא הגבלה, 0 גרם - אסור לחלוטין)',
                  },
                  safeSubstitutions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'List of tasty, SIBO-safe alternative foods or replacement ingredients in Hebrew',
                  },
                  cookingTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Actionable culinary & preparation tips to lower fermentation or soothe digestion for Nir',
                  },
                  medicalReferences: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Relevant medical protocols and scientific references in Hebrew/English (e.g. Monash University Low FODMAP, Dr. Siebecker SIBO Food Guide)',
                  },
                  riskScore: {
                    type: Type.INTEGER,
                    description: 'Risk score from 1 (Safe) to 5 (Severe trigger)',
                  },
                  ingredientsBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        status: { type: Type.STRING, description: 'GREEN, YELLOW, or RED' },
                        notes: { type: Type.STRING },
                      },
                      required: ['name', 'status'],
                    },
                    description: 'Breakdown of identified individual ingredients',
                  },
                  isPackagedProduct: {
                    type: Type.BOOLEAN,
                    description: 'True if this is a commercial/packaged product (bottle, jar, snack, box, can) where barcode scanning or ingredient table review is recommended',
                  },
                },
                required: [
                  'status',
                  'foodName',
                  'shortVerdict',
                  'detailedExplanation',
                  'fodmapTriggers',
                  'phase1Compatibility',
                  'phase2Compatibility',
                  'maxSafePortion',
                  'safeSubstitutions',
                  'cookingTips',
                  'medicalReferences',
                  'riskScore',
                ],
              },
            },
          });

          response = await Promise.race([aiCall, timeoutPromise]);
          if (response?.text) break;
        } catch (modelErr: any) {
          console.warn(`[API] Model ${model} failed (${modelErr?.message}), trying next...`);
        }
      }

      if (response?.text) {
        const result = JSON.parse(response.text);
        if (!['GREEN', 'YELLOW', 'RED'].includes(result.status)) {
          result.status = 'YELLOW';
        }
        result.timestamp = Date.now();
        if (imageBase64) result.imageUrl = imageBase64;
        return res.json(result);
      }

      // If AI model was unavailable or quota exceeded, fall back to Clinical Rule Engine
      console.warn('[Server] AI unavailable, activating SIBO Clinical Rule Engine fallback...');
      const fallbackResult = analyzeFoodClinically(textPrompt || 'מאכל שצולם', phase);
      if (imageBase64) fallbackResult.imageUrl = imageBase64;
      return res.json(fallbackResult);
    } catch (error: any) {
      console.error('Error analyzing food, using fallback engine:', error?.message);
      try {
        const { textPrompt, imageBase64, phase = 'phase1_strict' } = req.body || {};
        const fallbackResult = analyzeFoodClinically(textPrompt || 'מאכל שצולם', phase);
        if (imageBase64) fallbackResult.imageUrl = imageBase64;
        return res.json(fallbackResult);
      } catch (e) {
        res.status(500).json({ error: 'שגיאה בניתוח המאכל' });
      }
    }
  });

  // API: SIBO Fridge & Hunger SOS AI Chef
  app.post('/api/fridge-chef', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', textScenario = '', locationType = 'home', phase = 'phase1_strict' } = req.body;
      const isPhase1 = phase === 'phase1_strict';

      const systemInstruction = `
אתה שף חירום קליני מומחה ל-SIBO (צמיחת יתר של חיידקים במעי הדק) עבור ניר.
ניר כרגע רעבה מאוד (במצב "Hangry" ועומס קוגניטיבי), והיא זקוקה לפתרון שובע מיידי, טעים, מהיר (2-5 דקות) ובטוח לחלוטין לפי פרוטוקול SIBO ${isPhase1 ? 'שלב 1 קפדני (הרעבת חיידקים)' : 'שלב 2 (הרחבה מבוקרת)'}.

כללי מפתח חמורים לפי מיקום:
1. בנסיעה / בתחנת דלק / חנות נוחות (Yellow, מנטה, SoGood):
   - אך ורק מאכלים מוכנים לאכילה מיידית (Grab & Go) שקיימים בחנויות נוחות ישראליות!
   - דוגמאות חובה: זוג ביצים קשות מוכנות לקילוף במקרר Yellow, קופסת שימורי טונה בשמן זית/קנולה + פריכיות אורז, שקית אגוזי מלך טבעיים (עד 30 גרם), מלפפון שלם טרי, פרוסות גבינה צהובה עמק.
   - אסור בתכלית להציע בישול, מחבת או ביצים חיות שדורשות הכנה!
2. בסופרמרקט / מכולת:
   - מאכלים מוכנים לאכילה מהירה מהמעדנייה או המדף: עוף חם בגריל מהמעדנייה (חזה עוף נקי ללא רטבי שום/בצל), סלמון מעושן, אבוקדו בשל + פריכיות אורז, קופסת טונה, ביצים קשות מוכנות.
3. בבית ליד המטבח:
   - מנות מחבת מהירות ב-3 דקות (חביתת ביצים בשמן זית, טונה בטחינה ומלפפון).
4. בעבודה / מסעדה / וולט:
   - הזמנת נתח נקי על האש (פרגית/חזה עוף/סטייק/דג) + אורז לבן נקי + מלפפון טרי חתוך עם שמן זית.
`;

      const parts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const promptText = `
ניר רעבה עכשיו ומבקשת עזרה מיידית!
מיקום מדויק: ${locationType} (${locationType === 'driving' ? 'בנסיעה / תחנת דלק - רק Grab & Go מוכן לאכילה ללא בישול!' : locationType === 'supermarket' ? 'בסופרמרקט - רק מוצרי מעדנייה/מדף מוכנים לאכילה!' : 'בבית / מטבח'})
תיאור נוסף: "${textScenario || 'נא להציע מגוון רחב של פתרונות שובע מהירים'}"
שלב SIBO: ${isPhase1 ? 'שלב 1 קפדני' : 'שלב 2'}
${imageBase64 ? 'זהה מתוך התמונה את כל המצרכים הבטוחים ל-SIBO והרכב מהם 5-8 ארוחות שובע מהירות ומגוונות (בתוך 1-4 דקות).' : 'הרכב עבורה 6-8 ארוחות שובע מיידיות, מגוונות ומעוררות תיאבון (כולל ביצים, דגים/טונה, עוף, סלטים ונשנושים מהירים ומתוקים בטוחים) שמתאימות במדויק להקשר המיקום שלה.'}
`;
      parts.push({ text: promptText });

      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
      let response: any = null;

      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout for ${model}`)), 12000)
          );

          const aiCall = ai.models.generateContent({
            model,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  scenarioTitle: { type: Type.STRING, description: 'כותרת התרחיש (למשל: פתרון שובע מהיר בתחנת דלק)' },
                  calmMessage: { type: Type.STRING, description: 'משפט מרגיע ומחבק לניר שיוריד לחץ' },
                  prepTimeMinutes: { type: Type.INTEGER, description: 'זמן הכנה ממוצע בדקות (0-3 דקות)' },
                  suggestedMeals: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, description: 'שם המנה המהירה עם אימוג\'י' },
                        category: { type: Type.STRING, description: 'קטגוריה: eggs, fish, meat, salad, instant, sweet' },
                        timeToMake: { type: Type.STRING, description: 'זמן הכנה / פתיחה (למשל: 1 דקה / 3 דקות / מוכן מיד)' },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'מצרכים נדרשים' },
                        simpleSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'שלבי אכילה קצרים' },
                        satietyReason: { type: Type.STRING, description: 'למה המנה הזו משביעה ובטוחה' },
                      },
                      required: ['title', 'timeToMake', 'ingredients', 'simpleSteps', 'satietyReason'],
                    },
                  },
                  safeIngredientsIdentified: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'מצרכים בטוחים שזוהו' },
                  cautionWarnings: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'ממה להימנע' },
                  quickTip: { type: Type.STRING, description: 'טיפ שובע קצר' },
                },
                required: ['scenarioTitle', 'calmMessage', 'prepTimeMinutes', 'suggestedMeals', 'safeIngredientsIdentified', 'quickTip'],
              },
            },
          });

          response = await Promise.race([aiCall, timeoutPromise]);
          if (response?.text) break;
        } catch (err: any) {
          console.warn(`[FridgeChef API] Model ${model} failed:`, err?.message);
        }
      }

      if (response?.text) {
        return res.json(JSON.parse(response.text));
      }

      // Location-Specific Emergency Safety Fallbacks if AI is offline
      if (locationType === 'driving') {
        return res.json({
          scenarioTitle: 'חילוץ שובע בדרכים (Yellow / תחנת דלק)',
          calmMessage: 'ניר, את בדרכים ואפשר להשביע את הרעב מיד! בכל חנות נוחות יש שפע פתרונות SIBO מוכנים לאכילה ברכב.',
          prepTimeMinutes: 1,
          suggestedMeals: [
            {
              title: '🥚 זוג ביצים קשות מוכנות (במקרר הסנדוויצ׳ים של Yellow)',
              category: 'eggs',
              timeToMake: '1 דקה (מוכן מיד)',
              ingredients: ['זוג ביצים קשות קלופות', 'שקית מלח קטנה', 'מלפפון טרי מהמקרר'],
              simpleSteps: ['קונים זוג ביצים קשות במקרר', 'ממליחים מעט ואוכלים מיד ברכב לצד מלפפון'],
              satietyReason: 'חלבון מלא ואיכותי, 0% לקטוז ו-0% פודמאפ שסוגר את הרעב תוך 2 דקות.',
            },
            {
              title: '🐟 טונה בשמן זית + פריכיות אורז',
              category: 'fish',
              timeToMake: '1 דקה',
              ingredients: ['קופסת טונה בשמן זית (Easy Open)', 'חבילת פריכיות אורז 100%'],
              simpleSteps: ['פותחים את קופסת הטונה', 'מניחים על 2-3 פריכיות ואוכלים בנחת'],
              satietyReason: 'חלבון עשיר ושומן בריא שמעניקים שובע ל-4 שעות ללא נפיחות.',
            },
            {
              title: '🐟 חבילת סלמון מעושן מהמקרר',
              category: 'fish',
              timeToMake: 'חצי דקה',
              ingredients: ['חבילת סלמון מעושן (100 גרם)', 'פריכיות אורז'],
              simpleSteps: ['פותחים את האריזה, מניחים על פריכיות ואוכלים מיד'],
              satietyReason: 'חלבון ושומן אומגה 3 מרגיע דלקות שמספק שובע מלא.',
            },
            {
              title: '🥜 שקית אגוזי מלך / פקאן טבעיים',
              category: 'instant',
              timeToMake: 'חצי דקה',
              ingredients: ['שקית אגוזי מלך טבעיים לא קלויים (חופן עד 30 גרם)'],
              simpleSteps: ['אוכלים חופן אגוזים לצד בקבוק מים צוננים'],
              satietyReason: 'שומן אומגה 3 בריא שמייצב מיד את תחושת הרעב.',
            },
            {
              title: '🥜 בוטנים קלויים מלוחים (שקית אישית)',
              category: 'instant',
              timeToMake: 'חצי דקה',
              ingredients: ['שקית בוטנים מלוחים קטנה (עד 30 גרם)'],
              simpleSteps: ['אוכלים לאט חופן קטן'],
              satietyReason: 'חלבון ושומן צמחי דל פודמאפ שמשקיט את הבטן.',
            },
            {
              title: '🧀 פרוסות גבינה צהובה עמק מהמקרר',
              category: 'instant',
              timeToMake: 'חצי דקה',
              ingredients: ['2 פרוסות גבינה צהובה עמק (עד 40 גרם)'],
              simpleSteps: ['אוכלים פרוסה מגולגלת לצד מלפפון'],
              satietyReason: 'גבינה קשה עשירה בשומן וחלבון וכמעט 0% לקטוז.',
            },
            {
              title: '🥒 מקלות מלפפון טרי צונן',
              category: 'salad',
              timeToMake: 'חצי דקה',
              ingredients: ['2 מלפפונים שלמים שטופים מהמדף', 'מלח ים'],
              simpleSteps: ['נוגסים במלפפון פריך וקר'],
              satietyReason: 'נוזלים ומינרלים עדינים המרגיעים תחושת רעב וריקנות.',
            },
            {
              title: '☕ אספרסו שחור / סודה צוננת עם לימון',
              category: 'instant',
              timeToMake: '1 דקה',
              ingredients: ['כוס אספרסו או בקבוק סודה טבעית'],
              simpleSteps: ['שותים בלגימות קטנות ללא סוכר וללא חלב'],
              satietyReason: 'ממריץ את גלי הניקוי של המעי (MMC) ומפיג תחושת כבדות.',
            },
          ],
          safeIngredientsIdentified: ['ביצים קשות', 'טונה בשמן זית', 'סלמון מעושן', 'פריכיות אורז', 'אגוזי מלך', 'בוטנים', 'גבינה צהובה', 'מלפפון'],
          cautionWarnings: ['להימנע מסנדוויצ׳ים קנויים (מכילים מיונז תעשייתי, בצל, שום וחיטה)', 'להימנע ממסטיקים עם קסיליטול/סורביטול'],
          quickTip: 'ביצה קשה, סלמון וטונה הם המאכלים הכי בטוחים ומשביעים בדרכים!',
        });
      }

      if (locationType === 'supermarket') {
        return res.json({
          scenarioTitle: 'חילוץ שובע בסופרמרקט (מוכן לאכילה מהמדף)',
          calmMessage: 'ניר, הסופר מלא באוכל בטוח ומשביע! הנה שפע מאכלים שקונים ואוכלים מיד.',
          prepTimeMinutes: 1,
          suggestedMeals: [
            {
              title: '🍗 עוף חם בגריל מהמעדנייה (חזה עוף נקי)',
              category: 'meat',
              timeToMake: '1 דקה (חם ומוכן)',
              ingredients: ['חזה עוף צלוי חם מהמעדנייה ללא רוטב', 'מלפפון טרי'],
              simpleSteps: ['מבקשים במעדנייה חזה עוף בגריל חם', 'אוכלים לצד מלפפון פריך'],
              satietyReason: 'חלבון טהור שמשביע מיד ללא שום סיכון תסיסה.',
            },
            {
              title: '🐟 סלמון מעושן פרוס + פריכיות אורז',
              category: 'fish',
              timeToMake: '1 דקה',
              ingredients: ['חבילת סלמון מעושן (100 גרם)', 'פריכיות אורז מלא'],
              simpleSteps: ['מניחים פרוסות סלמון על פריכיות אורז', 'אוכלים מיד'],
              satietyReason: 'עשיר בחלבון ושומן בריא איכותי שמרגיע את הבטן.',
            },
            {
              title: '🥑 אבוקדו בשל + פריכיות ומלח ים',
              category: 'salad',
              timeToMake: '2 דקות',
              ingredients: ['אבוקדו בשל (עד חצי אבוקדו)', 'פריכיות אורז', 'מלח ים'],
              simpleSteps: ['פותחים את האבוקדו, מורחים על פריכית וממליחים'],
              satietyReason: 'שומן צמחי בריא ומשביע.',
            },
            {
              title: '🐟 סרדינים בשמן זית כתית מעולה',
              category: 'fish',
              timeToMake: '1 דקה',
              ingredients: ['קופסת שימורי סרדינים איכותיים בשמן זית', 'פריכיות אורז'],
              simpleSteps: ['פותחים את הקופסה, מניחים על פריכית ואוכלים במזלג'],
              satietyReason: 'פצצת סידן, אומגה 3 וחלבון מרוכז שמשקיטה את הבטן מיד.',
            },
            {
              title: '🥩 פסטרמה איכותית 100% נתח שלם (ללא שום/בצל)',
              category: 'meat',
              timeToMake: '1 דקה',
              ingredients: ['חבילת פסטרמה נתח שלם (טירת צבי / יחיעם 100% ללא גלוטן)', 'מלפפונים'],
              simpleSteps: ['מגלגלים פרוסות פסטרמה סביב מקלות מלפפון'],
              satietyReason: 'חלבון רזה שמעניק שובע מיידי.',
            },
            {
              title: '🥜 פריכיות עם חמאת בוטנים 100% טבעית',
              category: 'sweet',
              timeToMake: '1 דקה',
              ingredients: ['צנצנת חמאת בוטנים 100% טבעית (ללא סוכר)', 'פריכיות אורז'],
              simpleSteps: ['מורחים כף חמאת בוטנים על פריכית'],
              satietyReason: 'שומן וחלבון דל FODMAP שסוגר את החשק לאוכל.',
            },
            {
              title: '🧀 גבינת פרמזן מיושנת / גאודה קשה',
              category: 'instant',
              timeToMake: '1 דקה',
              ingredients: ['משולש גבינת פרמזן מיושנת (0% לקטוז)'],
              simpleSteps: ['חותכים קוביות קטנות ואוכלים לצד פריכיות ומלפפון'],
              satietyReason: 'שומן וחלבון עשירים ללא לקטוז כלל.',
            },
            {
              title: '🍓 סלסלת תותים טריים שטופים',
              category: 'sweet',
              timeToMake: '1 דקה',
              ingredients: ['סלסלת תותים טריים (עד 5-6 יחידות)'],
              simpleSteps: ['שוטפים ואוכלים טרי ומרענן'],
              satietyReason: 'פרי דל FODMAP מאושר עשיר בוויטמין C.',
            },
          ],
          safeIngredientsIdentified: ['עוף בגריל', 'סלמון מעושן', 'אבוקדו', 'סרדינים', 'פסטרמה', 'פריכיות אורז', 'חמאת בוטנים', 'פרמזן', 'מלפפון', 'תותים'],
          cautionWarnings: ['להימנע מסלטים מוכנים בקופסאות (מכילים מיונז שום, בצל וחומרים משמרים)'],
          quickTip: 'חזה עוף חם מהמעדנייה או סלמון מעושן הם פתרון הארוחה המהיר והבטוח ביותר.',
        });
      }

      // Home fallback
      return res.json({
        scenarioTitle: 'בופה שובע עשיר ומגוון בבית (35+ אופציות)',
        calmMessage: 'ניר, את בבית ליד המטבח! הנה שפע אדיר של ארוחות בזק מגוונות: בשרים, שיפודים, דגי ים, זודלס, דפי אורז, פנקייקים וקינוחי צ׳יה.',
        prepTimeMinutes: 3,
        suggestedMeals: [
          {
            title: '🍗 שיפודי פרגית צרובים במחבת פסים ברוטב שמן שום וכמון',
            category: 'meat',
            timeToMake: '4 דקות',
            ingredients: ['180 גרם קוביות פרגית נקייה', 'כף שמן זית מושרה שום (Garlic Oil)', 'כמון, פפריקה, מלח ולימון'],
            simpleSteps: ['מתבלים את הפרגית בשמן שום ותבלינים', 'צורבים במחבת פסים 2 דקות מכל צד', 'סוחטים לימון ואוכלים עסיסי'],
            satietyReason: 'חלבון עשיר ושומן בריא שמעניקים שובע מסיבי ל-4-5 שעות ללא שום תסיסה.',
          },
          {
            title: '🥩 קציצות בקר עסיסיות במחבת עם קישוא מגורר (ללא לחם וללא בצל)',
            category: 'meat',
            timeToMake: '4 דקות',
            ingredients: ['180 גרם בקר טחון טרי', 'חצי קישוא קטן מגורר דק וסחוט', 'שמיר קצוץ, שמן שום, מלח ופלפל'],
            simpleSteps: ['מערבבים את הבקר עם הקישוא המגורר והתבלינים', 'יוצרים קציצות שטוחות', 'צורבים במחבת חמה 2 דקות מכל צד'],
            satietyReason: 'ברזל, חלבון איכותי ונפח קישואים דל FODMAP שהופכים את הקציצות לרכות ומשביעות.',
          },
          {
            title: '🐟 פילה דניס / לברק צרוב על הפלנצ׳ה בעשבי תיבול ושמן זית',
            category: 'fish',
            timeToMake: '3 דקות',
            ingredients: ['פילה דניס/לברק טרי עם העור', 'כף שמן זית', 'ענף שמיר וטימין', 'מלח אטלנטי ופלח לימון'],
            simpleSteps: ['מניחים את הדג על צד העור במחבת חמה 2 דקות עד לפריכות', 'הופכים ל-30 שניות ומגישים עם לימון'],
            satietyReason: 'דג ים לבן וקל לעיכול, עשיר בחלבון טהור שאינו מכביד על הקיבה.',
          },
          {
            title: '🥔 "קומפיר SIBO" — תפוח אדמה לוהט במילוי שמן זית, מלח גס ופרמזן',
            category: 'bowls',
            timeToMake: '4 דקות',
            ingredients: ['1 תפוח אדמה בינוני שטוף', '2 כפות שמן זית כתית', '30 גרם פרמזן מיושנת (0% לקטוז)', 'מלח גס'],
            simpleSteps: ['מבשלים את תפוח האדמה במיקרוגל 4 דקות עד לריכוך', 'חוצים, מועכים קלות, יוצקים שמן זית ומפזרים פרמזן שנמסה לתוכו'],
            satietyReason: 'פחמימה קלה ובטוחה ללא גלוטן יחד עם שומן איכותי וגבינה מיושנת ללא לקטוז.',
          },
          {
            title: '🌯 לאפה מדפי אורז מגולגלת עם נתחי עוף צלוי, טחינה וחסה פריכה',
            category: 'wraps',
            timeToMake: '3 דקות',
            ingredients: ['2 דפי אורז', '100 גרם נתחי עוף צלוי', 'עלי חסה פריכים', '2 כפות טחינה גולמית', 'מלח ולימון'],
            simpleSteps: ['מרטיבים דף אורז 15 שניות', 'ממלאים בעוף, חסה וטחינה', 'מגלגלים ללאפה הדוקה ואוכלים מיד'],
            satietyReason: 'מרקם לאפה מענג ורך ללא טיפת קמח חיטה, קל לעיכול ומשביע מאוד.',
          },
          {
            title: '🥞 פנקייק שקדים ואוורירי ב-3 דקות (0% קמח, 0% סוכר)',
            category: 'wraps',
            timeToMake: '3 דקות',
            ingredients: ['1 ביצה', '2 כפות קמח שקדים טהור', 'כפית מייפל 100%', 'קינמון ושמן זית לטיגון', 'תותים טריים'],
            simpleSteps: ['טורפים את הביצה עם קמח השקדים והמייפל', 'מטגנים במחבת דקה וחצי מכל צד', 'מגישים עם תותים טריים'],
            satietyReason: 'חלבון ושומן בריא ללא שום קמחים מעובדים שמרגיע רעב למתוק.',
          },
          {
            title: '🍫 "סניקרס SIBO" מהיר — פריכית עם חמאת בוטנים, שוקולד מריר 85% ומלח גס',
            category: 'sweet',
            timeToMake: '1 דקה',
            ingredients: ['פריכית אורז 100%', 'כף חמאת בוטנים 100%', '2 קוביות שוקולד מריר 85% מומסות', 'מלח גס'],
            simpleSteps: ['מורחים חמאת בוטנים, מזלפים שוקולד מריר ומפזרים מלח גס', 'אוכלים מיד לקראנץ\' מושלם'],
            satietyReason: 'שילוב של שומן צמחי, מליחות ומתיקות שסוגר לחלוטין כל חשק למתוק בלי להתסיס.',
          },
          {
            title: '🥣 פודינג צ׳יה קרמי עם חלב שקדים, תותים ומייפל טהור',
            category: 'sweet',
            timeToMake: '2 דקות',
            ingredients: ['2 כפות זרעי צ׳יה', 'חצי כוס חלב שקדים ללא סוכר', 'כפית מייפל טהור', 'תותים חתוכים'],
            simpleSteps: ['מערבבים צ׳יה עם חלב שקדים ומייפל למשך דקה להסמכה', 'מפזרים תותים ואוכלים בכפית'],
            satietyReason: 'סיבים עדינים מסיסים ואומגה 3 צמחית שממלאים את הקיבה ברוגע ומשביעים לשעות.',
          },
          {
            title: '🧀 פלטת גבינות קשות מיושנות (פרמזן, גאודה) עם אגוזי מלך וזיתים',
            category: 'cheese',
            timeToMake: '1 דקה',
            ingredients: ['40 גרם קוביות פרמזן מיושנת / גאודה (0% לקטוז)', '5 אגוזי מלך', '6 זיתים שחורים', 'פריכיות'],
            simpleSteps: ['מסדרים את הגבינות, האגוזים והזיתים על צלחת יפה', 'אוכלים לאט בנחת'],
            satietyReason: 'שומנים וחלבונים עשירים ללא טיפת לקטוז שמעניקים שובע ארוך טווח.',
          },
          {
            title: '🥣 "זודלס" (נודלס קישואים) ברוטב עגבניות, שמן שום ופרמזן',
            category: 'bowls',
            timeToMake: '3 דקות',
            ingredients: ['2 קישואים מגולפים לסרטי פסטה', '3 כפות עגבניות מרוסקות', 'כף שמן שום', 'פרמזן ובזיליקום'],
            simpleSteps: ['מקפיצים את סרטי הקישוא במחבת עם שמן שום דקה וחצי', 'מוסיפים עגבניות מרוסקות ופרמזן ומגישים חם'],
            satietyReason: 'תחושת פסטה איטלקית עשירה ללא גלוטן וללא תסיסת פחמימות.',
          },
        ],
        safeIngredientsIdentified: ['פרגית', 'בקר', 'דניס', 'תפוח אדמה', 'דפי אורז', 'קמח שקדים', 'שוקולד 85%', 'צ׳יה', 'פרמזן', 'חמאת בוטנים'],
        cautionWarnings: ['להימנע מתוספת בצל, שום רגיל, רטבים תעשייתיים או לחם רגיל'],
        quickTip: 'שילוב של חלבון (בשר/דג/ביצה) עם שומן בריא (שמן זית/טחינה/גבינה מיושנת) מעניק שובע ממושך ורוגע עיכולי.',
      });
    } catch (e: any) {
      console.error('[Fridge Chef API] Error:', e);
      return res.status(500).json({ error: 'שגיאה בהפעלת אשף החירום' });
    }
  });

  // Initialize Protected Global Catalog and start weekly auto-sync scheduler
  initProtectedCatalog();
  startWeeklyCatalogScheduler();

  // API: Global Barcode Lookup (Protected Cache + Open Food Facts World & Israel + Auto-Persistence)
  app.get('/api/barcode/:barcode', async (req, res) => {
    try {
      const barcode = req.params.barcode.trim().replace(/[^0-9]/g, '');
      if (!barcode) {
        return res.status(400).json({ found: false, error: 'ברקוד לא תקין' });
      }

      // Step 1: Check Protected In-Memory Catalog Cache (0ms instant lookup)
      const cached = getProductFromProtectedCatalog(barcode);
      if (cached && cached.productName) {
        return res.json({
          barcode,
          productName: cached.productName,
          brand: cached.brand || '',
          ingredientsText: cached.ingredientsText || '',
          allergens: cached.allergens || '',
          categories: cached.categories || '',
          imageUrl: cached.imageUrl || '',
          found: true,
        });
      }

      // Step 2: Query Open Food Facts World & Israel APIs
      const urls = [
        `https://il.openfoodfacts.org/api/v2/product/${barcode}.json`,
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      ];

      for (const url of urls) {
        try {
          const fetchController = new AbortController();
          const timeout = setTimeout(() => fetchController.abort(), 3500);
          const offRes = await fetch(url, {
            signal: fetchController.signal,
            headers: {
              'User-Agent': 'SiboSafeNirApp/1.0 (https://sibo4nir-1.onrender.com; hagai.hilman@gmail.com)',
              Accept: 'application/json',
            },
          });
          clearTimeout(timeout);

          if (offRes.ok) {
            const data = await offRes.json();
            if (data.status === 1 && data.product) {
              const p = data.product;
              const productName = p.product_name_he || p.product_name || p.product_name_en || p.generic_name || '';
              const brand = p.brands || p.brand || '';
              const ingredientsText = p.ingredients_text_he || p.ingredients_text || p.ingredients_text_en || '';
              const allergens = p.allergens_he || p.allergens || p.allergens_en || '';
              const categories = p.categories_he || p.categories || p.categories_en || '';
              const imageUrl = p.image_url || p.image_front_url || '';

              if (productName || ingredientsText) {
                const resolved = {
                  barcode,
                  productName: productName || `מוצר מיובא (${brand})`,
                  brand,
                  ingredientsText,
                  allergens,
                  categories,
                  imageUrl,
                  found: true,
                };
                // Automatically persist and write-protect in the global catalog!
                saveProductToProtectedCatalog(resolved);
                return res.json(resolved);
              }
            }
          }
        } catch (fetchErr) {
          // continue to next URL
        }
      }

      return res.json({
        barcode,
        found: false,
      });
    } catch (err: any) {
      console.warn('[Barcode API] Error:', err);
      return res.status(500).json({ barcode: req.params.barcode, found: false });
    }
  });

  // API: Protected Catalog Health & Stats
  app.get('/api/catalog/stats', (req, res) => {
    res.json(getCatalogStats());
  });

  // API: Trigger Manual / Scheduled Catalog Sync
  app.post('/api/catalog/sync', async (req, res) => {
    try {
      const result = await performWeeklyCatalogSync();
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: 'שגיאה בעדכון המאגר', details: e?.message });
    }
  });

  // API: SIBO AI Clinical Consultation & Q&A
  app.post('/api/sibo-consult', async (req, res) => {
    try {
      const { question, phase = 'phase1_strict', history = [] } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'נא להזין שאלה' });
      }

      const isPhase1 = phase === 'phase1_strict';

      const systemInstruction = `
אתה יועץ תזונה קליני בכיר ומומחה עולמי לטיפול ב-SIBO (צמיחת יתר של חיידקים במעי הדק).
אתה עונה לאבא של ניר או לניר עצמה, בעברית חמה, מקצועית, ברורה ומעשית.
התבסס אך ורק על המחקרים הרפואיים המקובלים ביותר:
- ד״ר אליסון סיבקר (Dr. Allison Siebecker - SIBO Specific Food Guide)
- ד״ר נירלה ג׳קובי (Dr. Nirala Jacobi - Bi-Phasic Diet)
- מחקרי אוניברסיטת מונאש (Monash FODMAP)
- ד״ר מארק פימנטל (Dr. Mark Pimentel - Cedars-Sinai) לגבי תנועתיות MMC, מתאן מול מימן, וריווח ארוחות.

השלב הנוכחי של ניר: ${isPhase1 ? 'שלב 1 קפדני (הרעבת חיידקים)' : 'שלב 2 (שילוב מחדש)'}.

הנחיות לתשובה:
1. תן תשובה ישירה וברורה בראשית הדברים (האם מותר, אסור או מוגבל).
2. הסבר בקצרה את הסיבה הביוכימית (למשל: פרוקטנים, GOS, לקטוז, עודף פרוקטוז, סורביטול, מניטול, שרשראות עמילן).
3. הצע תמיד חלופה טעימה ובטוחה (כגון שימוש בעלים ירוקים של בצל ירוק, שמן זית מושרה שום, גהי, תותים, חלב שקדים טהור).
4. אם רלוונטי, ציין טיפ פרקטי למטבח או לאכילה מחוץ לבית.
`;

      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
      let response: any = null;
      let lastError: any = null;

      for (const model of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: question,
            config: {
              systemInstruction,
            },
          });
          if (response?.text) break;
        } catch (modelErr) {
          lastError = modelErr;
          console.warn(`[Consult] Model ${model} failed, trying next...`, modelErr);
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('לא הצלחנו לקבל תשובה');
      }

      res.json({
        answer: response.text,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error('Error in consult:', error);
      res.status(500).json({
        error: 'שגיאה במענה לשאלה',
        details: error?.message || 'אנא נסה שוב מאוחר יותר.',
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Cache static assets (hashed files)
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    // Serve other static files with no-cache for HTML
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIBO Safe Server running on port ${PORT}`);
  });
}

startServer();
