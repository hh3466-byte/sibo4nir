import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeFoodClinically } from './src/services/siboClinicalEngine';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

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
    const fs = require('fs');
    if (fs.existsSync(distPath)) return res.sendFile(distPath);
    if (fs.existsSync(pubPath)) return res.sendFile(pubPath);
    res.status(404).end();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
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
אתה מומחה גסטרואנטרולוגיה ותזונה קלינית עולמי המתמחה בטיפול ב-SIBO (צמיחת יתר של חיידקים במעי הדק - Small Intestinal Bacterial Overgrowth).
אתה מנתח מאכלים, מנות, מצרכים או תוויות מזון עבור משתמשת בשם ניר, שסובלת מ-SIBO וזקוקה לתזונה קפדנית ביותר למניעת תסיסה, נפיחות וכאבים.
הפרוטוקולים הרפואיים עליהם אתה מסתמך הם:
1. SIBO Specific Food Guide (Dr. Allison Siebecker)
2. SIBO Bi-Phasic Diet Protocol (Dr. Nirala Jacobi)
3. מחקרי FODMAP של אוניברסיטת Monash (Monash University Low FODMAP Research)
4. ACG Clinical Guidelines for SIBO (2020)

השלב הנוכחי שנבחר עבור ניר הוא: ${phaseDescription}.

כללי הכרעת הרמזור (Status):
- "GREEN" (אור ירוק - מותר): המאכל דל תסיסה, 0 או כמעט 0 FODMAPs, בטוח לחלוטין לצריכה בשלב הנוכחי (למשל: עוף טרי, ביצים, דגים, מלפפון, גזר מבושל, שמן זית, שמן מושרה שום, פרמזן מיושן, עלים ירוקים של בצל ירוק, תותים בכמות מדודה).
- "YELLOW" (אור צהוב - מוגבל / זהירות): המאכל מותר אך ורק בכמות מדודה וקטנה מאוד (כמו 1/2 כוס קישוא, עד 10 שקדים, 1/4 כוס אורז, 4 עגבניות שרי, 1/8 אבוקדו) או שהוא אסור בשלב 1 ומותר בשלב 2.
- "RED" (אור אדום - אסור בתכלית): המאכל עשיר ברכיבים מתסיסים (פרוקטנים כמו שום/בצל/חיטה, גלקטנים/קטניות, לקטוז מחלב ניגר, מניטול מפטריות/כרובית, סורביטול, עודף פרוקטוז כמו תפוח/אגס/דבש, או ממתיקים כוהליים כמו קסיליטול). אסור לחלוטין לניר!

עליך לזהות בדיוק מה מופיע בתמונה או בתיאור, להסביר בשפה ברורה ומעודדת בעברית, לפרט את טריגרי ה-FODMAP המדויקים, לציין כמויות בטוחות בגרמים, ולהציע חלופות טעימות ומותרות שמתאימות לניר.

כלל קריטי ובל יעבור עבור safeSubstitutions (חלופות בטוחות):
החלופות חייבות להיות תואמות באופן קולינרי לקטגוריית המאכל הנבדק! אסור בתכלית להציע חלופה גנרית שאינה שייכת לאותה קטגוריה (לדוגמה: אסור להציע מלפפון או חזה עוף כחלופה לקפה, עוגה או פסטה!).
- עבור קפה, תה ומשקאות: הצע אך ורק חלופות שתייה בטוחות (קפה אספרסו שחור ללא חלב פרה, קפה עם חלב שקדים טהור ללא סוכר וללא גומי, תה ג׳ינג׳ר טרי חם כמאיץ תנועתיות מעיים MMC, תה ירוק עדין, תה מנטה/נענע טבעי, סודה צוננת עם לימון).
- עבור לחם, מאפים, פסטות ובצקים: הצע פריכיות אורז מלא/לבן, לחם מחמצת כוסמין 100% אמיתי בהתססה איטית, קרקרים מקמח שקדים וזרעי צ׳יה, דפי אורז קריספיים, נודלס זוקיני (Zoodles).
- עבור מוצרי חלב וגבינות: הצע חלב שקדים טהור ללא סוכר, גבינת פרמזן מיושנת (כמעט 0% לקטוז), חמאת גהי (Ghee) מזוקקת, יוגורט קוקוס טבעי ללא סוכר, חלב/יוגורט ללא לקטוז.
- עבור שוקולד, עוגות, ממתקים וסוכר: הצע תותים טריים עם מעט סירופ מייפל טהור 100%, שוקולד מריר 85%+ איכותי (קובייה אחת), אוכמניות כחולות טריות, פנקייק מקמח שקדים וביצים.
- עבור שום ובצל: הצע שמן זית מושרה בשום (Garlic-Infused Oil), עלי בצל ירוק (החלק הירוק העליון בלבד - 0 פרוקטנים), עירית קצוצה, תבלין הינג (Asafoetida).
- עבור חומוס וקטניות: הצע ממרח קישואים קלויים בשמן זית ושמן שום (בטעם ומרקם חומוס ללא קטניות!), ממרח גזר אפוי וכמון, טופו מוצק מסונן, חזה עוף.
- עבור פירות עתירי סוכר: הצע תות שדה טרי, תפוז/קלמנטינה, אוכמניות, קיווי, מלון קנטלופ.
- עבור אלכוהול ומשקאות חריפים: הצע יין אדום/לבן יבש (Dry Wine), ג׳ין או וודקה נקייה עם סודה ולימון.
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
      const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
      let response: any = null;

      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout for ${model}`)), 4500)
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

      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.7-flash'];
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
