import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeFoodClinically } from './src/services/siboClinicalEngine';

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

        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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
1. חילוץ טקסט עברי מדויק (OCR): אם צולמה אריזה, בקבוק, פחית או תווית אחורית - קרא היטב את כל הכיתוב בעברית/אנגלית (לדוגמה: "מיץ תפוזים 100% סחוט טרי", "רכיבים: 100% מיץ תפוזים סחוט", "אבקת קקאו", "קצפת צמחית להקצפה", "פרי מור", "פרי ניב").
2. זהה את המוצר והרכיבים גם אם התווית מעוקלת על בקבוק, או אם צולמה חזית האריזה (למשל בקבוק מיץ תפוזים סחוט או קופסת קקאו).
3. נתח כל רכיב קלינית לפי חוקי ה-SIBO.

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
        ? `נתח את המאכל הבא עבור ניר עם סיבו (${isPhase1 ? 'שלב 1 קפדני' : 'שלב 2 הרחבה'}): "${textPrompt}". אם צורפה תמונה, זהה אותה ופרט את כל הרכיבים הנראים.`
        : `זהה ונתח את המאכל/מנה שבתמונה עבור ניר עם סיבו (${isPhase1 ? 'שלב 1 קפדני' : 'שלב 2 הרחבה'}). קבע אור ירוק, צהוב או אדום.`;

      parts.push({ text: promptText });

      // Helper to generate content with model fallback
      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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
תיאור נוסף: "${textScenario || 'נא להציע פתרונות שובע מהירים'}"
שלב SIBO: ${isPhase1 ? 'שלב 1 קפדני' : 'שלב 2'}
${imageBase64 ? 'זהה מתוך התמונה את המצרכים הבטוחים ל-SIBO והרכב מהם 2-3 ארוחות שובע מהירות (בתוך 3-5 דקות).' : 'הרכב עבורה 2-3 ארוחות שובע מיידיות שמתאימות במדויק להקשר המיקום שלה.'}
`;
      parts.push({ text: promptText });

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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
                  prepTimeMinutes: { type: Type.INTEGER, description: 'זמן הכנה בדקות (0-3 דקות)' },
                  suggestedMeals: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, description: 'שם המנה המהירה' },
                        timeToMake: { type: Type.STRING, description: 'זמן הכנה / פתיחה (למשל: 1 דקה / מוכן מיד)' },
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
          calmMessage: 'ניר, את בדרכים ואפשר להשביע את הרעב מיד! בכל חנות נוחות יש פתרונות SIBO מוכנים לאכילה ברכב.',
          prepTimeMinutes: 1,
          suggestedMeals: [
            {
              title: '🥚 זוג ביצים קשות מוכנות (במקרר הסנדוויצ׳ים של Yellow)',
              timeToMake: '1 דקה (מוכן מיד)',
              ingredients: ['זוג ביצים קשות קלופות', 'שקית מלח קטנה', 'מלפפון טרי מהמקרר'],
              simpleSteps: ['קונים זוג ביצים קשות במקרר', 'ממליחים מעט ואוכלים מיד ברכב לצד מלפפון'],
              satietyReason: 'חלבון מלא ואיכותי, 0% לקטוז ו-0% פודמאפ שסוגר את הרעב תוך 2 דקות.',
            },
            {
              title: '🐟 טונה בשמן זית + פריכיות אורז',
              timeToMake: '1 דקה',
              ingredients: ['קופסת טונה בשמן זית (Easy Open)', 'חבילת פריכיות אורז 100%'],
              simpleSteps: ['פותחים את קופסת הטונה', 'מניחים על 2-3 פריכיות ואוכלים בנחת'],
              satietyReason: 'חלבון עשיר ושומן בריא שמעניקים שובע ל-4 שעות ללא נפיחות.',
            },
            {
              title: '🥜 שקית אגוזי מלך / פקאן טבעיים',
              timeToMake: 'חצי דקה',
              ingredients: ['שקית אגוזי מלך טבעיים לא קלויים (חופן עד 30 גרם)'],
              simpleSteps: ['אוכלים חופן אגוזים לצד בקבוק מים צוננים'],
              satietyReason: 'שומן אומגה 3 בריא שמייצב מיד את תחושת הרעב.',
            },
          ],
          safeIngredientsIdentified: ['ביצים קשות', 'טונה בשמן זית', 'פריכיות אורז', 'אגוזי מלך', 'מלפפון'],
          cautionWarnings: ['להימנע מסנדוויצ׳ים קנויים (מכילים מיונז תעשייתי, בצל, שום וחיטה)'],
          quickTip: 'ביצה קשה וטונה הם המאכלים הכי בטוחים בדרכים!',
        });
      }

      if (locationType === 'supermarket') {
        return res.json({
          scenarioTitle: 'חילוץ שובע בסופרמרקט (מוכן לאכילה מהמדף)',
          calmMessage: 'ניר, הסופר מלא באוכל בטוח! הנה המאכלים הכי משביעים שקונים ואוכלים מיד.',
          prepTimeMinutes: 1,
          suggestedMeals: [
            {
              title: '🍗 עוף חם בגריל מהמעדנייה (חזה עוף נקי)',
              timeToMake: '1 דקה (חם ומוכן)',
              ingredients: ['חזה עוף צלוי חם מהמעדנייה ללא רוטב', 'מלפפון טרי'],
              simpleSteps: ['מבקשים במעדנייה חזה עוף בגריל חם', 'אוכלים לצד מלפפון פריך'],
              satietyReason: 'חלבון טהור שמשביע מיד ללא שום סיכון תסיסה.',
            },
            {
              title: '🐟 סלמון מעושן פרוס + פריכיות אורז',
              timeToMake: '1 דקה',
              ingredients: ['חבילת סלמון מעושן (100 גרם)', 'פריכיות אורז מלא'],
              simpleSteps: ['מניחים פרוסות סלמון על פריכיות אורז', 'אוכלים מיד'],
              satietyReason: 'עשיר בחלבון ושומן בריא איכותי שמרגיע את הבטן.',
            },
            {
              title: '🥑 אבוקדו בשל + פריכיות ומלח ים',
              timeToMake: '2 דקות',
              ingredients: ['אבוקדו בשל (עד חצי אבוקדו)', 'פריכיות אורז', 'מלח ים'],
              simpleSteps: ['פותחים את האבוקדו, מורחים על פריכית וממליחים'],
              satietyReason: 'שומן צמחי בריא ומשביע.',
            },
          ],
          safeIngredientsIdentified: ['עוף בגריל', 'סלמון מעושן', 'פריכיות אורז', 'אבוקדו', 'מלפפון'],
          cautionWarnings: ['להימנע מסלטים מוכנים בקופסאות (מכילים מיונז שום, בצל וחומרים משמרים)'],
          quickTip: 'חזה עוף חם מהמעדנייה הוא פתרון הארוחה המהיר והבטוח ביותר.',
        });
      }

      // Home fallback
      return res.json({
        scenarioTitle: 'פתרונות שובע מהירים במטבח ב-3 דקות',
        calmMessage: 'ניר, את בבית ליד המטבח! הנה ארוחות בזק שמשביעות מיד ושומרות על הבטן שלך שקטה.',
        prepTimeMinutes: 3,
        suggestedMeals: [
          {
            title: '🍳 חביתת 2 ביצים בשמן זית + פריכיות אורז ומלפפון',
            timeToMake: '3 דקות',
            ingredients: ['2 ביצים טריות', 'כף שמן זית כתית מעולה', '2-3 פריכיות אורז 100%', 'מלפפון טרי פרוס עם מלח ים'],
            simpleSteps: ['מחממים מחבת עם שמן זית', 'טורפים 2 ביצים עם מעט מלח ומטגנים דקה וחצי', 'מגישים על פריכיות עם מלפפון רענן'],
            satietyReason: 'חלבון מלא ושומן בריא שמעניקים שובע מיידי לשעות ללא שום תסיסה חיידקית.',
          },
          {
            title: '🐟 סלט טונה מהיר עם שמן זית, מלפפון וטחינה גולמית',
            timeToMake: '2 דקות',
            ingredients: ['קופסת טונה בשמן זית / מים', 'מלפפון קצוץ', 'כף טחינה גולמית 100%', 'מעט מיץ לימון ומלח'],
            simpleSteps: ['פותחים את קופסת הטונה לקערה', 'מוסיפים מלפפון קצוץ, כף טחינה גולמית ומלח', 'מערבבים ואוכלים עם פריכיות או ישירות במזלג'],
            satietyReason: '0 פחמימות, חלבון עשיר ושומן איכותי המייצב את רמות הסוכר בדם.',
          },
        ],
        safeIngredientsIdentified: ['ביצים', 'טונה', 'שמן זית', 'מלפפון', 'פריכיות אורז', 'טחינה גולמית'],
        cautionWarnings: ['להימנע לחלוטין מתוספת בצל, שום, רטבים תעשייתיים או לחם רגיל'],
        quickTip: 'שילוב של חלבון ושומן בריא (ביצה/טונה + שמן זית) משביע פי 3 ומעניק אנרגיה יציבה.',
      });
    } catch (e: any) {
      console.error('[Fridge Chef API] Error:', e);
      return res.status(500).json({ error: 'שגיאה בהפעלת אשף החירום' });
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

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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
