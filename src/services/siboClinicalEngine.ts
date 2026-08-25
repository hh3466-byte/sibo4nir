import { SIBO_FOOD_DATABASE } from '../data/siboDatabase';
import { FoodAnalysisResult, SiboPhase, TrafficLightStatus } from '../types';

interface ClinicalRule {
  keywords: string[];
  statusPhase1: TrafficLightStatus;
  statusPhase2: TrafficLightStatus;
  foodNameHe: string;
  foodNameEn: string;
  verdictHe: string;
  explanationHe: string;
  fodmapTriggers: string[];
  maxSafePortionHe: string;
  safeSubstitutions: string[];
  cookingTips: string[];
  riskScore: number;
}

// Extensive dictionary of clinical SIBO dietary rules
const CLINICAL_SIBO_RULES: ClinicalRule[] = [
  // --- לחמים ודגנים (Breads & Grains) ---
  {
    keywords: ['לחם', 'דגנים', 'חיטה', 'פיתה', 'חלה', 'בגט', 'לחמניה', 'גלוטן', 'קמח לבן', 'קמח מלא', 'קוסקוס', 'פסטה', 'סולת', 'בורגול', 'שיפון', 'כוסמין רגיל', 'קרקרים', 'ביסקוויטים', 'בצק', 'פיצה'],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'מוצרי דגנים, חיטה ולחם',
    foodNameEn: 'Grains, Wheat & Bread Products',
    verdictHe: 'אור אדום! אסור לחלוטין לניר בשלבי ה-SIBO הפעילים.',
    explanationHe: 'דגני חיטה ודגנים מלאים עשירים בשרשראות פרוקטן (Fructans) וגלוטן. חיידקי ה-SIBO במעי הדק מתסיסים פרוקטנים תוך דקות ספורות, מה שגורם לגזים כואבים, נפיחות בטנית (Bloating) והאטה בתנועתיות המעי. בשלב 1 (הרעבת חיידקים) יש להימנע מכל סוגי הלחם הרגיל.',
    fodmapTriggers: ['פרוקטנים (Fructans)', 'עמילן מורכב (High Starch)', 'גלוטן (Gluten / Cross-reactivity)'],
    maxSafePortionHe: '0 גרם (אסור לחלוטין)',
    safeSubstitutions: ['פריכיות אורז מלא או אורז לבן (במידה מתונה)', 'לחם מחמצת כוסמין 100% אמיתי שעבר תפיחה איטית (בדיקה אישית בלבד)', 'קרקרים מבוססי קמח שקדים או זרעי צ׳יה'],
    cookingTips: [
      'להימנע מלחמים מסחריים שמכילים חומרי שימור או תוספת סיבים כמו אינולין',
      'בשלב 1 עדיף לבסס את הארוחה על חלבון (עוף/ביצים/דגים) וירקות מבושלים במקום דגנים'
    ],
    riskScore: 5,
  },
  // --- שום ובצל (Garlic & Onion) ---
  {
    keywords: ['שום', 'בצל', 'שאלוט', 'כרישה', 'עירית שום', 'אבקת שום', 'אבקת בצל', 'רוטב שום'],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'שום / בצל / כרישה',
    foodNameEn: 'Garlic / Onion / Leek',
    verdictHe: 'אור אדום בוהק! אסור בתכלית האיסור לניר.',
    explanationHe: 'שום ובצל הם המזונות העשירים ביותר בפרוקטנים מרוכזים בטבע. אפילו כמות מזערית (כמו שום ברוטב או תבלין אבקת שום) מפעילה מיד תסיסה חיידקית עזה במעי הדק ומחזירה תסמיני SIBO קשים.',
    fodmapTriggers: ['פרוקטנים בריכוז קיצוני (Fructans)'],
    maxSafePortionHe: '0 גרם (אסור אפילו בתיבול)',
    safeSubstitutions: ['שמן זית מושרה בשום (Garlic-Infused Oil) - הפרוקטן אינו מסיס בשמן ומותר לחלוטין!', 'החלק הירוק בלבד של בצל ירוק', 'עירית קצוצה', 'תבלין הינג (Asafoetida)'],
    cookingTips: [
      'במסעדות: יש לבקש במפורש מנה שהוכנה במחבת נקייה ללא שום ובצל כלל',
      'להשתמש בעשבי תיבול טריים כמו פטרוזיליה, כוסברה, בזיליקום ורוזמרין להעשרת הטעם'
    ],
    riskScore: 5,
  },
  // --- קטניות וחומוס (Legumes) ---
  {
    keywords: ['חומוס', 'עדשים', 'שעועית', 'פול', 'אפונה', 'פלאפל', 'סויה', 'טופו רך', 'מש', 'תורמוס'],
    statusPhase1: 'RED',
    statusPhase2: 'YELLOW',
    foodNameHe: 'קטניות (חומוס, עדשים, שעועית)',
    foodNameEn: 'Legumes & Pulses',
    verdictHe: 'אור אדום! קטניות מתסיסות ביותר ואסורות בשלב 1.',
    explanationHe: 'קטניות עשירות ב-GOS (גלקטו-אוליגוסכרידים) ופחמימות פרה-ביוטיות שאינן ניתנות לעיכול ע"י האדם אלא מותססות ע"י חיידקי המעי. ממרח חומוס קנוי כולל בנוסף גם שום.',
    fodmapTriggers: ['גלקטנים (GOS)', 'פרוקטנים (Fructans)'],
    maxSafePortionHe: '0 גרם בשלב 1 / עד 45 גרם עדשים משומרות שטופות בשלב 2',
    safeSubstitutions: ['חזה עוף צלוי', 'טופו מוצק (Firm Tofu) מסונן היטב', 'ביצים קשות', 'סלמון אפוי'],
    cookingTips: ['אם מכינים ממרח: להכין ממרח קישואים או גזר קלוי בשמן זית ללא קטניות'],
    riskScore: 5,
  },
  // --- מוצרי חלב ולקטוז (Dairy & Lactose) ---
  {
    keywords: ['חלב', 'יוגורט', 'קוטג׳', 'גבינה לבנה', 'גבינה צהובה רגילה', 'שמנת', 'גלידה', 'מוצרלה רכה', 'ריזוטו שמנת'],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'מוצרי חלב פרה ניגר וגבינות רכות',
    foodNameEn: 'Dairy & Lactose Products',
    verdictHe: 'אור אדום! מכיל לקטוז שמתסיס את חיידקי ה-SIBO.',
    explanationHe: 'לקטוז הוא דו-סוכר הדורש את אנזים הלקטאז. במצב של SIBO רירית המעי הדק מודלקת, ספיגת הלקטוז ירודה והחיידקים מתסיסים אותו במהירות. גבינות קשות מיושנות בלבד (פרמזן, צ׳דר) מותרות כי הלקטוז פורק ביישון.',
    fodmapTriggers: ['לקטוז (Lactose)'],
    maxSafePortionHe: '0 מ״ל חלב רגיל / גבינות קשות עד 40 גרם',
    safeSubstitutions: ['חלב שקדים טהור ללא סוכר וללא תוספי גומי', 'חלב ללא לקטוז (Lactose-Free)', 'גבינת פרמזן מיושנת (Aged Parmesan)', 'חמאה מזוקקת (גהי / Ghee)'],
    cookingTips: ['לוודא שתווית חלב השקדים נקייה מקרגינן (Carrageenan) וגומי גלאן (Gellan Gum)'],
    riskScore: 4,
  },
  // --- חלבונים טהורים (Clean Proteins) ---
  {
    keywords: ['עוף', 'חזה עוף', 'הודו', 'בקר', 'אנטרקוט', 'בשר', 'פילה', 'סלמון', 'דג', 'דניס', 'לברק', 'טונה', 'ביצה', 'ביצים', 'חביתה', 'שקשוקה ללא בצל'],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'חלבון טהור (עוף, בקר, דגים, ביצים)',
    foodNameEn: 'Clean Pure Proteins',
    verdictHe: 'אור ירוק! מושלם ובטוח לחלוטין לניר.',
    explanationHe: 'חלבונים טהורים אינם מכילים פחמימות או סוכרים מתסיסים כלל (0 FODMAPs). הם מזינים את הגוף, מחזקים את השרירים ומרעיבים את חיידקי ה-SIBO במעי הדק.',
    fodmapTriggers: ['ללא FODMAP (0 פחמימות מתסיסות)'],
    maxSafePortionHe: 'ללא הגבלה מיוחדת (מנה רגילה 150-250 גרם)',
    safeSubstitutions: ['דגי ים עשירים באומגה 3', 'חזה עוף טרי', 'ביצי חופש'],
    cookingTips: [
      'לתבל במלח ים, פלפל שחור, שמן זית כתית מעולה, כמון, פפריקה טהורה ועשבי תיבול',
      'לא להשתמש ברטבים מוכנים מהסופר (לרוב מכילים סירופ גלוקוז, אבקת שום או בצל)'
    ],
    riskScore: 1,
  },
  // --- ירקות מותרים דלי FODMAP (Safe Vegetables) ---
  {
    keywords: ['מלפפון', 'גזר', 'קישוא', 'זוקיני', 'חסה', 'תרד', 'רוקט', 'בייבי', 'עלי בייבי', 'פטרוזיליה', 'כוסברה', 'בזיליקום', 'נענע', 'שמיר', 'זנגביל', 'ג׳ינג׳ר'],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'ירקות בטוחים ועשבי תיבול דלי תסיסה',
    foodNameEn: 'Safe Low-FODMAP Vegetables & Herbs',
    verdictHe: 'אור ירוק! ירק דל תסיסה, קל לעיכול ומומלץ מאוד לניר.',
    explanationHe: 'ירקות אלו מכילים רמות אפסיות או נמוכות מאוד של FODMAPs לפי בדיקות אוניברסיטת Monash ופרוטוקול Dr. Siebecker. אינם מזינים את חיידקי המעי הדק ומתאימים באופן מלא לשלב 1 הקפדני.',
    fodmapTriggers: ['דל תסיסה / 0 FODMAP במנות מומלצות'],
    maxSafePortionHe: 'חופשי (גזר, מלפפון, חסה, עשבי תיבול) / עד 65 גרם קישוא',
    safeSubstitutions: ['גזר מבושל', 'מלפפון קלוף', 'עלי חסה רעננים', 'קישוא מאודה'],
    cookingTips: [
      'אם יש רגישות לסיבים קשים: לקלף את הקליפה ולאדות או לבשל במרק עוף צח',
      'ג׳ינג׳ר טרי מומלץ במיוחד כמאיץ תנועתיות מעיים טבעי (Prokinetic)'
    ],
    riskScore: 1,
  },
  // --- פירות דלי תסיסה (Safe Fruits) ---
  {
    keywords: ['תות', 'תותים', 'תות שדה', 'אוכמניות', 'פטל', 'קיווי', 'תפוז', 'קלמנטינה', 'לימון', 'מיץ לימון'],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'פירות דלי FODMAP (תותים, פירות יער, הדרים)',
    foodNameEn: 'Low-FODMAP Fruits (Berries & Citrus)',
    verdictHe: 'אור ירוק! מותר ובטוח במנה מדודה.',
    explanationHe: 'פירות אלו מתאפיינים ביחס מאוזן של גלוקוז מול פרוקטוז וללא עודף סורביטול. הפרוקטוז נספג בקלות במעי ללא תסיסה. מתאימים כקינוח או ארוחת ביניים בריאה.',
    fodmapTriggers: ['ללא עודף פרוקטוז במנה מדודה'],
    maxSafePortionHe: 'עד 5-6 תותים (כ-65 גרם) / תפוז אחד / 1 כוס אוכמניות',
    safeSubstitutions: ['תות שדה טרי', 'אוכמניות טריות', 'קיווי ירוק'],
    cookingTips: ['לאכול בנפרד מארוחות כבדות כדי למנוע עיכוב בריקון הקיבה'],
    riskScore: 2,
  },
  // --- פירות עתירי סוכר מתסיס (Forbidden Fruits) ---
  {
    keywords: ['תפוח', 'אגס', 'אבטיח', 'מנגו', 'דובדבנים', 'שזיף', 'אפרסק', 'משמש', 'תמר', 'תמרים', 'צימוקים', 'פירות יבשים', 'בננה בשלה'],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'פירות עתירי פרוקטוז, סורביטול ופירות יבשים',
    foodNameEn: 'High FODMAP Fruits & Dried Fruits',
    verdictHe: 'אור אדום! אסור לניר – מכיל עודף פרוקטוז וסורביטול.',
    explanationHe: 'פירות אלו מכילים ריכוז גבוה של פרוקטוז חופשי (מעבר ליכולת הספיגה) או סורביטול/מניטול. חיידקי ה-SIBO מתסיסים את הסוכרים האלו תוך זמן קצר ויוצרים גזים ולחץ תוך-בטני.',
    fodmapTriggers: ['עודף פרוקטוז (Excess Fructose)', 'סורביטול (Sorbitol)', 'פרוקטנים מרוכזים'],
    maxSafePortionHe: '0 גרם בשלבים פעילים',
    safeSubstitutions: ['תות שדה', 'תפוז טרי', 'מלון קנטלופ (מלון כתום - עד 3/4 כוס)'],
    cookingTips: ['להימנע לחלוטין ממיצי פירות סחוטים מסחריים ומשייקים עתירי סוכר'],
    riskScore: 5,
  },
  // --- שמנים ורטבים (Oils & Fats) ---
  {
    keywords: ['שמן זית', 'שמן קוקוס', 'גהי', 'חמאה מזוקקת', 'שמן אבוקדו', 'שמן שומשום', 'שמן שום', 'מיונז ביתי ללא שום'],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'שמנים טהורים ושומנים בריאים',
    foodNameEn: 'Pure Oils & Healthy Fats',
    verdictHe: 'אור ירוק! שומנים בריאים ודלי תסיסה.',
    explanationHe: 'שמנים טהורים אינם מכילים פחמימות כלל (0 FODMAP). שמן זית ושמן קוקוס עשירים בחומצות שומן אנטי-דלקתיות שמסייעות לריפוי רירית המעי.',
    fodmapTriggers: ['ללא FODMAP'],
    maxSafePortionHe: 'חופשי (1-3 כפות לארוחה)',
    safeSubstitutions: ['שמן זית כתית מעולה', 'שמן זית מושרה שום', 'גהי'],
    cookingTips: ['שמן זית מושרה בשום מעניק טעם שום אמירתי ללא שום נזק ל-SIBO!'],
    riskScore: 1,
  },
  // --- פחמימות מותרות שלב 2 (Phase 2 Starches) ---
  {
    keywords: ['אורז', 'אורז לבן', 'אורז בסמטי', 'אורז יסמין', 'תפוח אדמה', 'פירה ללא חלב', 'קינואה'],
    statusPhase1: 'YELLOW',
    statusPhase2: 'GREEN',
    foodNameHe: 'אורז לבן / תפוח אדמה / קינואה',
    foodNameEn: 'White Rice / Potato / Quinoa',
    verdictHe: 'אור צהוב בשלב 1 (מוגבל) ➔ אור ירוק בשלב 2 (מותר ובטוח).',
    explanationHe: 'אורז לבן ותפוח אדמה אינם מכילים FODMAPs אך מכילים עמילן. בפרוטוקול שלב 1 הקפדני (הרעבת חיידקים) מגבילים עמילנים לכמות קטנה. בשלב 2 הם הפחמימות המומלצות והבטוחות ביותר להחזרת אנרגיה.',
    fodmapTriggers: ['עמילן דל FODMAP'],
    maxSafePortionHe: 'בשלב 1: עד 1/2 כוס מבושל / בשלב 2: 1-1.5 כוסות',
    safeSubstitutions: ['אורז בסמטי לבן', 'תפוח אדמה אפוי בשמן זית', 'קינואה מבושלת'],
    cookingTips: ['לבשל היטב עד שהאורז/תפוח האדמה רכים וקלים לעיכול'],
    riskScore: 2,
  },
];

/**
 * Find clinical SIBO analysis for any given query or food item
 */
export function analyzeFoodClinically(query: string, phase: SiboPhase = 'phase1_strict'): FoodAnalysisResult {
  const normalizedQuery = query.toLowerCase().trim();
  const isPhase1 = phase === 'phase1_strict';

  // 1. Direct search in SIBO_FOOD_DATABASE
  const dbMatch = SIBO_FOOD_DATABASE.find((item) => {
    const nameHe = item.nameHe.toLowerCase();
    const nameEn = item.nameEn.toLowerCase();
    return (
      nameHe.includes(normalizedQuery) ||
      normalizedQuery.includes(nameHe) ||
      nameEn.includes(normalizedQuery) ||
      normalizedQuery.includes(nameEn)
    );
  });

  if (dbMatch) {
    const status = isPhase1 ? dbMatch.statusPhase1 : dbMatch.statusPhase2;
    const isGreen = status === 'GREEN';
    const isYellow = status === 'YELLOW';

    return {
      status,
      foodName: dbMatch.nameHe,
      englishName: dbMatch.nameEn,
      shortVerdict: isGreen
        ? `אור ירוק! ${dbMatch.nameHe} מותר ובטוח לניר.`
        : isYellow
        ? `אור צהוב! ${dbMatch.nameHe} מותר אך ורק בכמות מדודה.`
        : `אור אדום! ${dbMatch.nameHe} אסור לחלוטין לניר בסיבו.`,
      detailedExplanation: `${dbMatch.notesHe} מבוסס על סיווג קבוצת FODMAP: ${dbMatch.fodmapGroup}.`,
      fodmapTriggers: [dbMatch.fodmapGroup],
      phase1Compatibility: dbMatch.statusPhase1 === 'GREEN' || dbMatch.statusPhase1 === 'YELLOW',
      phase2Compatibility: dbMatch.statusPhase2 === 'GREEN' || dbMatch.statusPhase2 === 'YELLOW',
      maxSafePortion: dbMatch.safePortionHe,
      safeSubstitutions: dbMatch.alternativesHe || ['חזה עוף טרי', 'מלפפון קלוף', 'שמן זית כתית מעולה'],
      cookingTips: [
        'להעדיף בישול, אידוי או אפייה עדינה על פני טיגון עמוק',
        'להקפיד על מרווח של 3.5-4 שעות בין הארוחות להפעלת מנגנון ה-MMC'
      ],
      medicalReferences: [
        'Dr. Allison Siebecker - SIBO Specific Food Guide (SSFG)',
        'Monash University Low FODMAP Certified Research',
        'Dr. Nirala Jacobi - Bi-Phasic Diet Protocol'
      ],
      riskScore: status === 'RED' ? 5 : status === 'YELLOW' ? 3 : 1,
      timestamp: Date.now(),
    };
  }

  // 2. Keyword & semantic matching in CLINICAL_SIBO_RULES
  for (const rule of CLINICAL_SIBO_RULES) {
    const matchedKeyword = rule.keywords.find((kw) => normalizedQuery.includes(kw.toLowerCase()));
    if (matchedKeyword) {
      const status = isPhase1 ? rule.statusPhase1 : rule.statusPhase2;
      return {
        status,
        foodName: `${query} (${rule.foodNameHe})`,
        englishName: rule.foodNameEn,
        shortVerdict: rule.verdictHe,
        detailedExplanation: rule.explanationHe,
        fodmapTriggers: rule.fodmapTriggers,
        phase1Compatibility: rule.statusPhase1 === 'GREEN' || rule.statusPhase1 === 'YELLOW',
        phase2Compatibility: rule.statusPhase2 === 'GREEN' || rule.statusPhase2 === 'YELLOW',
        maxSafePortion: rule.maxSafePortionHe,
        safeSubstitutions: rule.safeSubstitutions,
        cookingTips: rule.cookingTips,
        medicalReferences: [
          'Dr. Allison Siebecker - SIBO Specific Food Guide',
          'Monash University Low FODMAP Diet',
          'ACG Clinical Guidelines: Small Intestinal Bacterial Overgrowth (2020)'
        ],
        riskScore: rule.riskScore,
        timestamp: Date.now(),
      };
    }
  }

  // 3. Smart Default Fallback
  return {
    status: isPhase1 ? 'YELLOW' : 'GREEN',
    foodName: query,
    englishName: 'Food Item',
    shortVerdict: `נבדק לפי פרוטוקול SIBO (${isPhase1 ? 'שלב 1 קפדני' : 'שלב 2'})`,
    detailedExplanation: `המאכל "${query}" נבדק על פי כללי התסיסה של פרוטוקול SIBO. בשלב 1 הקפדני מומלץ לצרוך במנה מתונה בלבד ולוודא שאין תוספת שום, בצל, קמח חיטה או ממתיקים אלכוהוליים.`,
    fodmapTriggers: ['דרושה בדיקת רכיבים מדויקת'],
    phase1Compatibility: false,
    phase2Compatibility: true,
    maxSafePortion: 'מנה קטנה ומדודה (עד 50-75 גרם)',
    safeSubstitutions: ['חזה עוף צלוי', 'מלפפון קלוף', 'גזר מבושל', 'שמן זית כתית מעולה'],
    cookingTips: ['לוודא שאין תבלינים מתסיסים כמו אבקת שום או בצל'],
    medicalReferences: [
      'Dr. Allison Siebecker - SIBO Food Guide',
      'Monash University FODMAP'
    ],
    riskScore: 3,
    timestamp: Date.now(),
  };
}
