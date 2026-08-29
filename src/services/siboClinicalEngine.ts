import { SIBO_FOOD_DATABASE } from '../data/siboDatabase';
import { FoodAnalysisResult, SiboPhase, TrafficLightStatus } from '../types';
import { normalizeHebrew, fuzzyHebrewMatch } from '../utils/textUtils';

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

/**
 * Smart contextual substitution resolver based on food category
 * RULES:
 * 1. Must strictly belong to the same culinary category (drinks -> drinks, dairy -> dairy, bread -> starches).
 * 2. If the query is generic or unknown (e.g. 'מאכל שצולם', 'מוצר'), RETURN AN EMPTY ARRAY []!
 *    NEVER output random chicken/cucumber/oil.
 */
export function getSmartCategoricalSubstitutions(query: string): string[] {
  if (!query || !query.trim()) return [];
  const q = normalizeHebrew(query);

  // If generic placeholder query, return NO substitutions
  if (
    q === 'מאכל שצולם' ||
    q === 'מאכל' ||
    q === 'תמונה' ||
    q === 'אוכל' ||
    q === 'מנה' ||
    q === 'מוצר' ||
    q === 'food item' ||
    q === 'food'
  ) {
    return [];
  }

  // 1. Dairy Products, Milk & Soft Cheeses (חלב, יוגורט, דל לקטוז, יטבתה, תנובה, טרה, שטראוס)
  if (
    q.includes('חלב') ||
    q.includes('לקטוז') ||
    q.includes('יוגורט') ||
    q.includes('גבינ') ||
    q.includes('קוטג') ||
    q.includes('שמנת') ||
    q.includes('מוצרלה') ||
    q.includes('גלידה') ||
    q.includes('שוקו') ||
    q.includes('ריקוטה') ||
    q.includes('חמאה') ||
    q.includes('יטבתה') ||
    q.includes('תנובה') ||
    q.includes('טרה') ||
    q.includes('שטראוס') ||
    q.includes('מחלבות') ||
    q.includes('קזאין') ||
    q.includes('מעדן')
  ) {
    return [
      '🥛 חלב שקדים טהור ללא סוכר וללא תוספי גומי (Almond Milk)',
      '🥛 חלב / יוגורט 0% לקטוז (Lactose-Free)',
      '🧀 גבינת פרמזן מיושנת (Aged Parmesan) — כמעט 0% לקטוז ומותרת!',
      '🧈 חמאה מזוקקת (גהי / Ghee) נקייה ממוצקי חלב ולקטוז',
      '🥥 יוגורט קוקוס טבעי ללא סוכר וללא חומרי עיבוי'
    ];
  }

  // 2. Coffee, Tea & Hot/Cold Drinks (קפה, אספרסו, לאטה, תה, מיצים, משקאות)
  if (
    q.includes('קפה') ||
    q.includes('אספרסו') ||
    q.includes('לאטה') ||
    q.includes('נס קפה') ||
    q.includes('קפוצ') ||
    q.includes('הפוך') ||
    q.includes('תה') ||
    q.includes('משקאות') ||
    q.includes('מיץ') ||
    q.includes('קולה') ||
    q.includes('סודה') ||
    q.includes('שייק') ||
    q.includes('משקה') ||
    q.includes('תרכיז')
  ) {
    return [
      '☕ קפה אספרסו שחור נקי (ללא חלב פרה רגיל)',
      '🥛 קפה עם חלב שקדים טהור ללא סוכר וללא תוספי גומי',
      '🫚 תה ג׳ינג׳ר טרי מחומם (מאיץ מעולה לתנוعתיות מעיים MMC)',
      '🍵 תה ירוק עדין או תה נענע/מנטה טבעי ללא סוכר',
      '🍋 סודה טבעית מרעננת עם פלחי לימון ונענע'
    ];
  }

  // 3. Breads, Baked Goods, Wheat, Pastas & Grains (לחם, פסטה, פיתה, עוגיות, קרקרים)
  if (
    q.includes('לחם') ||
    q.includes('פיתה') ||
    q.includes('חלה') ||
    q.includes('בגט') ||
    q.includes('לחמני') ||
    q.includes('פסטה') ||
    q.includes('בצק') ||
    q.includes('פיצה') ||
    q.includes('קרקר') ||
    q.includes('ביסקוויט') ||
    q.includes('עוגה') ||
    q.includes('עוגיו') ||
    q.includes('טוסט') ||
    q.includes('קוסקוס') ||
    q.includes('בורגול') ||
    q.includes('דגנים') ||
    q.includes('גלוטן') ||
    q.includes('סנדוויץ') ||
    q.includes('כריך') ||
    q.includes('מאפה') ||
    q.includes('רוגלך') ||
    q.includes('קרואסון') ||
    q.includes('אנג׳ל') ||
    q.includes('ברמן')
  ) {
    return [
      '🌾 פריכיות אורז מלא או אורז לבן במתינות (1-2 יחידות)',
      '🍞 לחם מחמצת כוסמין 100% אמיתי בהתססה איטית ממושכת (בדיקה אישית בלבד)',
      '🥖 קרקרים מבוססי קמח שקדים וזרעי צ׳יה',
      '🥬 עטיפות עלי חסה פריכים כבסיס לכריך ללא גלוטן וללא פחמימות',
      '🍜 נודלס מקישואים מגוררים (Zoodles) כחלופה מעולה לפסטה'
    ];
  }

  // 4. Sweets, Sugar, Desserts & Chocolate (שוקולד, ממתקים, עוגות, סוכר, דבש)
  if (
    q.includes('שוקולד') ||
    q.includes('סוכר') ||
    q.includes('ממתק') ||
    q.includes('דבש') ||
    q.includes('סילאן') ||
    q.includes('ריבה') ||
    q.includes('חלבה') ||
    q.includes('קינוח') ||
    q.includes('קרמל') ||
    q.includes('ופל') ||
    q.includes('עלית') ||
    q.includes('ממתקים')
  ) {
    return [
      '🍓 תותים טריים עם מעט סירופ מייפל טהור 100%',
      '🍫 שוקולד מריר 85%+ איכותי דל סוכר (קובייה אחת מדודה)',
      '🫐 אוכמניות כחולות טריות (עד כוס אחת)',
      '🥞 פנקייק מקמח שקדים וביצים ממותק קלות במייפל טהור',
      '🥝 קיווי ירוק מרענן'
    ];
  }

  // 5. Onion, Garlic & Intense Seasonings (שום, בצל, כרישה, אבקת שום)
  if (
    q.includes('שום') ||
    q.includes('בצל') ||
    q.includes('כרישה') ||
    q.includes('שאלוט') ||
    q.includes('אבקת שום') ||
    q.includes('אבקת בצל') ||
    q.includes('רוטב שום')
  ) {
    return [
      '🧄 שמן זית מושרה בשום (Garlic-Infused Oil) — הפרוקטן אינו מסיס בשמן ומותר לחלוטין!',
      '🌱 עלי בצל ירוק (החלק הירוק העליון בלבד — 0 פרוקטנים)',
      '🌿 עירית טרייה קצוצה דק',
      '🧂 תבלין הינג (Asafoetida) שמעניק טעם בצל-שום ללא FODMAPs',
      '🌿 עשבי תיבול טריים: פטרוזיליה, כוסברה, בזיליקום ורוזמרין'
    ];
  }

  // 6. Legumes, Hummus & Beans (חומוס, עדשים, שעועית, פול, פלאפל)
  if (
    q.includes('חומוס') ||
    q.includes('עדשים') ||
    q.includes('שעועית') ||
    q.includes('פול') ||
    q.includes('פלאפל') ||
    q.includes('אפונה') ||
    q.includes('טחינה') ||
    q.includes('מסבחה') ||
    q.includes('צבר') ||
    q.includes('אחלה')
  ) {
    return [
      '🥒 ממרח קישואים קלויים בשמן זית ושמן שום (במרקם וטעם חומוס מדהים ללא קטניות!)',
      '🥕 ממרח גזר אפוי וטחון עם שמן זית וכמון',
      '🍳 ביצים קשות או חביתה עשירה בחלבון',
      '🍗 חזה עוף צלוי רך וקל לעיכול',
      '🍲 טופו מוצק (Firm Tofu) מסונן היטב'
    ];
  }

  // 7. High FODMAP Fruits (תפוח, אגס, מנגו, אבטיח, תמרים, פירות יבשים)
  if (
    q.includes('תפוח') ||
    q.includes('אגס') ||
    q.includes('אבטיח') ||
    q.includes('מנגו') ||
    q.includes('תמר') ||
    q.includes('צימוק') ||
    q.includes('משמש') ||
    q.includes('אפרסק') ||
    q.includes('דובדבן') ||
    q.includes('שזיף') ||
    q.includes('פרי יבש')
  ) {
    return [
      '🍓 תות שדה טרי (עד 5-6 תותים בינוניים)',
      '🍊 תפוז או קלמנטינה טרייה (יחס גלוקוז-פרוקטוז מאוזן 1:1)',
      '🫐 אוכמניות כחולות טריות (עד 1 כוס)',
      '🥝 קיווי ירוק טרי',
      '🍈 מלון קנטלופ (מלון כתום — עד 3/4 כוס)'
    ];
  }

  // 8. High FODMAP Vegetables (כרובית, פטריות, אספרגוס, ארטישוק)
  if (
    q.includes('כרובית') ||
    q.includes('פטריות') ||
    q.includes('אספרגוס') ||
    q.includes('ארטישוק') ||
    q.includes('סלק') ||
    q.includes('ברוקולי')
  ) {
    return [
      '🥕 גזר מבושל ורך (0 FODMAP וקל מאוד לעיכול)',
      '🥒 קישוא / זוקיני מאודה בשמן זית (עד 65 גרם)',
      '🥗 מלפפון טרי קלוף',
      '🥬 עלי תרד בייבי קלויים קלות בשמן זית',
      '🍄 פטריות אויסטר / ירדן (Oyster Mushrooms — מותרות עד 75 גרם!)'
    ];
  }

  // 9. Alcohol & Cocktails (בירה, יין, אלכוהול)
  if (
    q.includes('בירה') ||
    q.includes('אלכוהול') ||
    q.includes('יין') ||
    q.includes('וודקה') ||
    q.includes('ג׳ין') ||
    q.includes('קוקטייל') ||
    q.includes('וויסקי')
  ) {
    return [
      '🍷 כוס יין אדום או לבן יבש בלבד (Dry Wine — דל בסוכרים מתסיסים)',
      '🍸 ג׳ין או וודקה איכותית נקייה עם מי סודה ולימון (ללא משקאות מוגזים ממותקים)',
      '🍹 מים צוננים עם נענע, פלחי לימון וג׳ינג׳ר טרי'
    ];
  }

  // 10. High FODMAP Vegetables (כרובית, פטריות, ארטישוק, כרוב ניצנים, אספרגוס)
  if (
    q.includes('כרובית') ||
    q.includes('פטריות') ||
    q.includes('פטריה') ||
    q.includes('ארטישוק') ||
    q.includes('כרוב ניצנים') ||
    q.includes('אספרגוס') ||
    q.includes('סלק') ||
    q.includes('שמפיניון') ||
    q.includes('פורטובלו')
  ) {
    return [
      '🥒 קישואים / זוקיני מבושלים בשמן זית',
      '🥕 גזר טרי או אפוי',
      '🥬 עלי תרד בייבי טריים או מוקפצים',
      '🫑 פלפל אדום / צהוב טרי ופריך',
      '🥒 מלפפון טרי ירוק'
    ];
  }

  // 9. Processed Meats, Sausages & Deli (נקניקיות, פסטרמה, קבב, המבורגר מעובד)
  if (
    q.includes('נקניק') ||
    q.includes('פסטרמה') ||
    q.includes('קבב') ||
    q.includes('המבורגר') ||
    q.includes('שווארמה') ||
    q.includes('שניצל') ||
    q.includes('טירת צבי') ||
    q.includes('זוגלובק') ||
    q.includes('יחיעם')
  ) {
    return [
      '🍗 חזה עוף טרי צלוי בשמן זית, מלח ורוזמרין',
      '🥩 סטייק בקר או סינטה טרייה לא מעובדת',
      '🐟 פילה סלמון או דניס אפוי בתנור',
      '🥚 ביצים קשות או חביתה בשמן זית',
      '🍗 שווארמה ביתית מנתחי פרגית מתובלת בכמון וכורכום (ללא שום ובצל)'
    ];
  }

  // 10. Condiments, Sauces & Dressings (קטשופ, מיונז, רוטב טריאקי, רוטב צ'ילי, סויה)
  if (
    q.includes('קטשופ') ||
    q.includes('טריאקי') ||
    q.includes('צ\'ילי') ||
    q.includes('רוטב') ||
    q.includes('רוטב אלף האיים') ||
    q.includes('רוטב קיסר') ||
    q.includes('רוטב שום') ||
    q.includes('רוטב סויה') ||
    q.includes('סלסה')
  ) {
    return [
      '🫒 שמן זית כתית מעולה עם מיץ לימון סחוט טרי ומלח ים',
      '🧄 שמן זית מושרה שום (Garlic-Infused Oil) — מעניק טעם מושלם ללא FODMAPs!',
      '🥣 מיונז ביתי טרי משמן זית וחלמון ללא תוספי שום/סוכר',
      '🍶 רוטב סויה תמרי (Tamari) טהור ללא גלוטן וללא סוכר',
      '🌿 רוטב פסטו ביתי מעלי בזיליקום, שמן זית, פרמזן וצנוברים'
    ];
  }

  // 11. Nuts & Seeds (קשיו, פיסטוק, אגוזים)
  if (
    q.includes('קשיו') ||
    q.includes('פיסטוק') ||
    q.includes('אגוז') ||
    q.includes('שקדים') ||
    q.includes('בוטנים') ||
    q.includes('גרעינים')
  ) {
    return [
      '🌰 אגוזי מלך טבעיים (עד 10 חצאים / 30 גרם)',
      '🌰 אגוזי פקאן טבעיים (עד 10 יחידות)',
      '🌻 גרעיני דלעת או חמניה טבעיים (עד 2 כפות)',
      '🌰 אגוזי מקדמיה טריים (עשירים בשומן בריא ודלי FODMAP)',
      '🌰 שקדים טבעיים בכמות מדודה (עד 10 יחידות בלבד)'
    ];
  }

  // Unmatched food category: return [] (DO NOT hallucinate random foods)
  return [];
}

/**
 * Meticulous Ingredient-Level SIBO Parser
 * Inspects every single ingredient against clinical FODMAP and fermentation triggers.
 * Eliminates false alarms and identifies exact triggers with 100% precision.
 */
export function analyzeIngredientsList(
  ingredientsText: string,
  productName: string = 'מוצר ארוז',
  phase: SiboPhase = 'phase1_strict'
): FoodAnalysisResult {
  const isPhase1 = phase === 'phase1_strict';
  const cleanName = productName.replace(/\s*\(רכיבים:.*?\)/, '').trim() || 'מוצר ארוז';
  const rawIngs = ingredientsText.toLowerCase();

  // Split ingredients by comma, semicolon, or newlines
  // Strip out informational metadata or parenthetical notes before parsing individual ingredients
  const cleanIngsText = ingredientsText
    .replace(/\(.*?ללא.*?\)/gi, '')
    .replace(/\(.*?אור ירוק.*?\)/gi, '')
    .replace(/\(.*?מתאים ל.*?\)/gi, '');

  const rawList = cleanIngsText
    .split(/[,;\n\r]/)
    .map((s) => s.trim().replace(/^[-•*\s]+/, ''))
    .filter((s) => s.length > 1);

  const breakdown: { name: string; status: TrafficLightStatus; notes?: string }[] = [];
  const triggers: string[] = [];
  let hasRed = false;
  let hasYellow = false;

  for (const ing of rawList) {
    const lower = ing.toLowerCase();

    // 0. Check NEGATION & SAFE DECLARATIONS (e.g. "ללא שום", "ללא בצל", "ללא גלוטן", "ללא תוספת סוכר", "0% לקטוז")
    const isNegated = /ללא|0%|נקי מ|אינו מכיל|free from|without|no added|non-/i.test(lower);

    if (isNegated && /ללא\s*(?:תוספת\s*)?שום|נקי משום|אינו מכיל שום/i.test(lower)) {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'נקי משום (0 פרוקטנים)' });
      continue;
    }
    if (isNegated && /ללא\s*(?:תוספת\s*)?בצל|נקי מבצל|אינו מכיל בצל/i.test(lower)) {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'נקי מבצל (0 פרוקטנים)' });
      continue;
    }
    if (isNegated && /ללא\s*(?:תוספת\s*)?גלוטן|gluten.?free|ללא חיטה|נקי מגלוטן/i.test(lower)) {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'ללא גלוטן' });
      continue;
    }
    if (isNegated && /ללא\s*(?:תוספת\s*)?סוכר|0%\s*סוכר|sugar.?free|ללא סוכרים/i.test(lower)) {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'ללא סוכר מוסף' });
      continue;
    }
    if (isNegated && /ללא\s*לקטוז|0%\s*לקטוז|lactose.?free|דל לקטוז/i.test(lower)) {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'ללא לקטוז' });
      continue;
    }

    // Check Safe Sweeteners (Erythritol / Stevia / סוויטנגו)
    if (/אריתריטול|erythritol|סטיביה|stevia|סטיביול|גליקוזיד|גליקוזידים|סוויטנגו|sweetango/i.test(lower)) {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'ממתיק בטוח שאינו מותסס (אריתריטול/סטיביה)' });
      continue;
    }

    // 1. Check RED triggers
    if (/שום|אבקת שום|מיצוי שום|garlic/i.test(lower) && !/ללא\s*שום/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'מכיל פרוקטנים מתסיסים' });
      if (!triggers.includes('שום (פרוקטנים)')) triggers.push('שום (פרוקטנים)');
      hasRed = true;
    } else if (/בצל|אבקת בצל|מיצוי בצל|כרישה|שאלוט|onion|leek|shallot/i.test(lower) && !/ללא\s*בצל/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'מכיל פרוקטנים מתסיסים' });
      if (!triggers.includes('בצל (פרוקטנים)')) triggers.push('בצל (פרוקטנים)');
      hasRed = true;
    } else if (/אינולין|inulin|עולש|chicory|fos|פרוקטו-אוליגו/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'סיב פרה-ביוטי מתסיס' });
      if (!triggers.includes('אינולין / סיבי עולש (פרוקטנים)')) triggers.push('אינולין / סיבי עולש (פרוקטנים)');
      hasRed = true;
    } else if (/סירופ תירס עתיר פרוקטוז|hfcs|פרוקטוז|fructose|סירופ גלוקוז-פרוקטוז|דבש|סילאן|אגבה/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'עודף פרוקטוז מתסיס' });
      if (!triggers.includes('עודף פרוקטוז (Excess Fructose)')) triggers.push('עודף פרוקטוז (Excess Fructose)');
      hasRed = true;
    } else if (/סורביטול|sorbitol|e420|מניטול|mannitol|e421|מלטיטול|maltitol|e965|קסיליטול|xylitol|e967|איזומלט|isomalt|e953/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'ממתיק פוליאולי מתסיס' });
      if (!triggers.includes('פוליאולים / ממתיקים מתסיסים (Polyols)')) triggers.push('פוליאולים / ממתיקים מתסיסים (Polyols)');
      hasRed = true;
    } else if (/חלב פרה|אבקת חלב|מי גבינה|whey|מוצקי חלב/i.test(lower) && !/0%\s*לקטוז|ללא לקטוז|דל לקטוז|ללא חלב/i.test(rawIngs)) {
      breakdown.push({ name: ing, status: isPhase1 ? 'RED' : 'YELLOW', notes: 'מכיל לקטוז' });
      if (!triggers.includes('לקטוז (Lactose)')) triggers.push('לקטוז (Lactose)');
      if (isPhase1) hasRed = true; else hasYellow = true;
    } else if (/קמח חיטה|חיטה|wheat|שיפון|שעורה|לתת|גלוטן|קמח כוסמין מלא/i.test(lower) && !/ללא\s*גלוטן|ללא\s*חיטה/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'דגן עתיר פרוקטנים' });
      if (!triggers.includes('פרוקטנים מדגנים (חיטה/שיפון)')) triggers.push('פרוקטנים מדגנים (חיטה/שיפון)');
      hasRed = true;
    } else if (/קמח חומוס|קמח עדשים|סויה|פולי סויה|חלבון סויה/i.test(lower) && !/רוטב סויה|שמן סויה|לציטין סויה|ללא סויה/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'קטניות עתירות גלקטנים' });
      if (!triggers.includes('גלקטנים (GOS)')) triggers.push('גלקטנים (GOS)');
      hasRed = true;
    } else if (/כרובית|פטריות|ארטישוק/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'ירק עתיר FODMAP' });
      if (!triggers.includes('FODMAP גבוה')) triggers.push('FODMAP גבוה');
      hasRed = true;
    }
    // 2. Check YELLOW triggers
    else if (/\b(סוכר|סוכרוז|sugar|גלוקוז|דקסטרוז)\b|סוכר /i.test(lower) && !/סטיביול|גליקוזיד|ללא\s*(?:תוספת\s*)?סוכר|0%\s*סוכר/i.test(lower)) {
      breakdown.push({ name: ing, status: 'YELLOW', notes: 'סוכר מוסף (מוגבל במינון)' });
      if (!triggers.includes('סוכר מוסף')) triggers.push('סוכר מוסף');
      hasYellow = true;
    } else if (/רכז מיץ|רכז אפרסק|רכז לימון|רכז תפוחים|רכז פרי/i.test(lower)) {
      breakdown.push({ name: ing, status: 'YELLOW', notes: 'רכז פרי (פרוקטוז מרוכז)' });
      if (!triggers.includes('רכז פרי')) triggers.push('רכז פרי');
      hasYellow = true;
    } else if (/עמילן מעובד|עמילן תירס|עמילן טפיוקה|מלטודקסטרין/i.test(lower)) {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'עמילן דל תסיסה לעיבוי (דל FODMAP)' });
    }
    // 3. GREEN triggers
    else {
      breakdown.push({ name: ing, status: 'GREEN', notes: 'רכיב בטוח ודל תסיסה' });
    }
  }

  const finalStatus: TrafficLightStatus = hasRed ? 'RED' : hasYellow ? 'YELLOW' : 'GREEN';
  const isGreen = finalStatus === 'GREEN';
  const isYellow = finalStatus === 'YELLOW';

  const smartSubs = getSmartCategoricalSubstitutions(cleanName);

  let verdict = '';
  let explanation = '';

  if (isGreen) {
    verdict = `אור ירוק! כל רכיבי המוצר (${cleanName}) בטוחים ונקיים מ-FODMAPs.`;
    explanation = `סריקת כל רכיבי המוצר (${cleanName}) הראתה שכל הרכיבים דלי תסיסה לחלוטין ומתאימים ל-SIBO ללא שום טריגרים מתסיסים.`;
  } else if (isYellow) {
    verdict = `אור צהוב! ${cleanName} מכיל רכיבים מוגבלים (${triggers.join(', ')}).`;
    explanation = `בבדיקת רשימת הרכיבים של ${cleanName} נמצאו רכיבים הדורשים הגבלה בכמות (${triggers.join(', ')}). מומלץ לצרוך במנה קטנה ומדודה בלבד.`;
  } else {
    verdict = `אור אדום! ${cleanName} מכיל רכיבים אסורים (${triggers.join(', ')}).`;
    explanation = `בבדיקת רשימת הרכיבים של ${cleanName} זוהו רכיבים עתירי FODMAP (${triggers.join(', ')}) המתסיסים את חיידקי ה-SIBO במעי הדק ועלולים לעורר נפיחות ואי-נוחות.`;
  }

  return {
    status: finalStatus,
    foodName: cleanName,
    shortVerdict: verdict,
    detailedExplanation: explanation,
    fodmapTriggers: triggers.length > 0 ? triggers : ['ללא טריגרים מתסיסים (דל FODMAP לחלוטין)'],
    phase1Compatibility: isGreen || (!hasRed && !isPhase1),
    phase2Compatibility: isGreen || isYellow,
    maxSafePortion: isGreen ? 'מנה רגילה' : isYellow ? 'מנה קטנה ומדודה (עד חצי כוס / 50 גרם)' : '0 גרם בשלבים פעילים',
    safeSubstitutions: smartSubs,
    cookingTips: isGreen
      ? ['מוצר נקי ובטוח לשימוש']
      : isYellow
      ? ['להגביל את הכמות ולא לשלב עם מזונות מתסיסים נוספים באותה ארוחה']
      : ['להימנע מצריכת מוצר זה ולהעדיף חלופות מותרות מרשימת האור הירוק'],
    medicalReferences: [
      'Monash University Low FODMAP Ingredients Database',
      'Dr. Allison Siebecker - SIBO Specific Food Guide'
    ],
    ingredientsBreakdown: breakdown,
    isPackagedProduct: true,
    riskScore: hasRed ? 5 : hasYellow ? 3 : 1,
    timestamp: Date.now(),
  };
}

// Extensive dictionary of clinical SIBO dietary rules
const CLINICAL_SIBO_RULES: ClinicalRule[] = [
  // --- קורנפלור / עמילן תירס / עמילן טפיוקה (גלעם, סוגת, מיה) - GREEN לניר ---
  {
    keywords: [
      'קורנפלור',
      'עמילן תירס',
      'קורנפלור טהור',
      'קורנפלור סוגת',
      'קורנפלור גלעם',
      'קורנפלור מיה',
      'קורנפלור שופרסל',
      'עמילן תפוחי אדמה',
      'קמח תפוחי אדמה',
      'עמילן טפיוקה',
      'קמח טפיוקה',
      'קמח אורז',
      'קמח אורז לבן',
      'cornstarch',
      'cornflour',
      'tapioca starch',
      'potato starch'
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'קורנפלור טהור / עמילן תירס (גלעם / סוגת / מיה)',
    foodNameEn: 'Pure Cornflour / Cornstarch',
    verdictHe: 'אור ירוק! קורנפלור הוא עמילן טהור ודל תסיסה, מותר ובטוח לניר בסיבו. 🟢',
    explanationHe: 'קורנפלור (עמילן תירס טהור למאכל) מופק מגרעיני תירס ועובר תהליך שבו מופרד העמילן הטהור מהסיבים והסוכרים המתסיסים. הוא 100% ללא גלוטן, ללא פרוקטנים, ללא לקטוז וללא FODMAPs, ונספג בקלות במערכת העיכול. מצוין להסמכת מרקים ורטבים, להכנת פודינג ביתי, קינוחים ואפייה עדינה!',
    fodmapTriggers: ['ללא FODMAP (עמילן טהור דל תסיסה)'],
    maxSafePortionHe: '2-4 כפות במתכון / מנה רגילה',
    safeSubstitutions: [
      '🌽 קורנפלור טהור (גלעם / סוגת / מיה)',
      '🥔 קמח תפוחי אדמה טהור',
      '🌾 קמח טפיוקה או קמח אורז לבן'
    ],
    cookingTips: [
      'להמיס תחילה במעט מים קרים לפני ההוספה לתבשיל רותח כדי למנוע גושים',
      'מושלם להכנת קינוחי מלבי או פודינג על בסיס חלב שקדים ללא סוכר'
    ],
    riskScore: 1,
  },
  // --- אינסטנט פודינג וניל סוויטנגו / ממתיק סוויטנגו (Sweetango) - GREEN לניר ---
  {
    keywords: [
      'סוויטנגו',
      'סוויטאנגו',
      'sweetango',
      'פודינג סוויטנגו',
      'אינסטנט פודינג סוויטנגו',
      'פודינג וניל סוויטנגו',
      'אינסטנט פודינג וניל של סוויטנגו',
      'פודינג וניל ללא סוכר',
      'אינסטנט פודינג ללא סוכר',
      'ממתיק סוויטנגו'
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'אינסטנט פודינג וניל ללא סוכר סוויטנגו (Sweetango)',
    foodNameEn: 'Sweetango Sugar-Free Instant Vanilla Pudding',
    verdictHe: 'אור ירוק! אינסטנט פודינג וניל סוויטנגו מתאים ובטוח לניר בסיבו. 🟢',
    explanationHe: 'אינסטנט פודינג וניל של סוויטנגו ממותק באמצעות שילוב של אריתריטול (Erythritol) וסטיביה טהורה ללא שום סוכר מוסף. בניגוד לסורביטול, מלטיטול או קסיליטול, אריתריטול נספג ברובו במעי הדק ואינו מותסס על ידי חיידקי ה-SIBO. עמילן הטפיוקה/תירס המעובד בכמות מדודה בטוח לעיכול. מומלץ להכין עם חלב שקדים ללא סוכר או מים לקבלת קינוח מושלם וטעים ללא נפיחות!',
    fodmapTriggers: ['0 סוכר (ממותק באריתריטול וסטיביה שאינם מותססים)'],
    maxSafePortionHe: 'מנה אישית (1-2 כוסות פודינג מוכן)',
    safeSubstitutions: [
      '🍮 פודינג וניל סוויטנגו מוכן עם חלב שקדים ללא סוכר',
      '🍓 תותים טריים עם קצפת צמחית ריץ׳',
      '🍫 שוקולד מריר סוויטנגו ללא סוכר'
    ],
    cookingTips: [
      'להקציף עם 2 כוסות חלב שקדים קר ללא סוכר במקום חלב פרה רגיל',
      'לשלב עם תותים טריים חתוכים מעל'
    ],
    riskScore: 1,
  },
  // --- דפי אורז לבן / וילקוניק (Wilconic Rice Paper) - GREEN לניר ---
  {
    keywords: [
      'דפי אורז',
      'דפי אורז לבן',
      'דפי אורז וילקוניק',
      'דפי אורז לבן של וילקוניק',
      'דפי אורז עגולים',
      'דף אורז',
      'וילקוניק',
      'wilconic',
      'rice paper'
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'דפי אורז לבן (וילקוניק Wilconic / מזרח ומערב)',
    foodNameEn: 'White Rice Paper Sheets (Wilconic)',
    verdictHe: 'אור ירוק! דפי אורז לבן מותרים, בטוחים ומצוינים לניר בסיבו. 🟢',
    explanationHe: 'דפי אורז לבן (כגון וילקוניק) מיוצרים מ-100% קמח אורז לבן, עמילן טפיוקה, מים ומלח. הם 0% גלוטן, 0% פרוקטנים, 0% לקטוז ואינם מתסיסים כלל את חיידקי המעי הדק. מושלמים להכנת רולים קראנצ׳יים ממולאים בעוף מבושל, מלפפון, גזר ונבטים!',
    fodmapTriggers: ['ללא FODMAP (מבוסס על אורז לבן וטפיוקה)'],
    maxSafePortionHe: '3-5 דפי אורז בארוחה',
    safeSubstitutions: [
      '🌯 רול דפי אורז ממולא ברצועות חזה עוף, מלפפון וגזר',
      '🍚 אורז בסמטי לבן מבושל',
      '🌾 פריכיות אורז מלא'
    ],
    cookingTips: [
      'לטבול במים פושרים למשך 5-10 שניות בלבד עד לריכוך קל',
      'למלא בחלבון מותר (עוף, סלמון, ביצה) וירקות דלי FODMAP (גזר, מלפפון, תרד)'
    ],
    riskScore: 1,
  },
  // --- תפוצ'יפס בטעמים מתובלים (שמנת בצל / ברביקיו / מקסיקני) - RED לניר ---
  {
    keywords: [
      "תפוצ'יפס שמנת בצל",
      "תפוצ'יפס בצל",
      "תפוצ'יפס ברביקיו",
      "תפוצ'יפס מקסיקני",
      "תפוציפס שמנת בצל",
      "תפוציפס ברביקיו",
      "תפוצ'יפס פפריקה",
      "תפוצ'יפס חריף",
      "תפוצ׳יפס שמנת בצל",
      "תפוצ׳יפס ברביקיו"
    ],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'תפוצ׳יפס בטעמים (שמנת בצל / ברביקיו / מקסיקני)',
    foodNameEn: 'Flavored Tapuchips (Onion / BBQ / Mexican)',
    verdictHe: 'אור אדום! תפוצ׳יפס בטעמים אסור לניר (מכיל אבקת בצל, אבקת שום ולקטוז). 🔴',
    explanationHe: 'בניגוד לתפוצ׳יפס טבעי, חטיפי תפוצ׳יפס בטעמים מתובלים כוללים אבקת בצל יבש, אבקת שום, סוכרים מוספים ומוצקי חלב/שמנת (לקטוז). רכיבים אלו עשירים מאוד בפרוקטנים ומתסיסים את חיידקי ה-SIBO במעי הדק.',
    fodmapTriggers: ['אבקת בצל (פרוקטנים)', 'אבקת שום', 'סוכר ולקטוז'],
    maxSafePortionHe: '0 גרם (אסור)',
    safeSubstitutions: [
      '🥔 תפוצ׳יפס קלאסי בטעם טבעי (מלח בלבד) — מותר וירוק!',
      '🍿 פופקורן טבעי במלח ים',
      '🌽 נאצ׳וס/דוריטוס טבעי במלח בלבד'
    ],
    cookingTips: ['להעדיף תמיד תפוצ׳יפס טבעי קלאסי (שקית אדומה רגילה ללא תבליני בצל ושום)'],
    riskScore: 5,
  },
  // --- תפוצ'יפס טבעי / קלאסי מלח (עלית / שטראוס) - GREEN לניר ---
  {
    keywords: [
      "תפוצ'יפס טבעי",
      "תפוצ'יפס בטעם טבעי",
      "תפוצ'יפס קלאסי",
      "תפוצ'יפס מלח",
      "תפוצ'יפס גלים",
      "תפוצ'יפס xtra",
      "תפוצ'יפס אקסטרה",
      "תפוצ'יפס שטראוס",
      "תפוצ'יפס עלית",
      "תפוצ'יפס",
      "תפוציפס",
      "תפוציפ'ס",
      "תפוצ׳יפס",
      "תפוצ׳יפס קלאסי",
      "תפוצ׳יפס טבעי",
      "tapuchips",
      "ציפס תפוח אדמה מלח"
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'תפוצ׳יפס קלאסי בטעם טבעי (מלח בלבד) עלית שטראוס',
    foodNameEn: 'Tapuchips Classic Salt (Strauss Elite)',
    verdictHe: 'אור ירוק! תפוצ׳יפס בטעם טבעי (מלח) מתאים ובטוח לניר בסיבו. 🟢',
    explanationHe: 'תפוצ׳יפס קלאסי בטעם טבעי (כולל גרסאות גלים ו-XTRA מלח) מיוצר מ-3 רכיבים בלבד: תפוחי אדמה, שמן צמחי ומלח ים. הוא 100% ללא שום, ללא בצל, ללא גלוטן, ללא לקטוז וללא סוכרים מוספים, ונחשב דל FODMAP לחלוטין! שימי לב: גרסאות עם תבלינים כמו "שמנת בצל", "ברביקיו" או "מקסיקני" מכילות אבקת בצל ושום ואסורות. מומלץ לצרוך מנה סבירה (שקית אישית עד 50 גרם) בגלל השמן.',
    fodmapTriggers: ['0 שום', '0 בצל', '0 גלוטן', '0 לקטוז (דל FODMAP לחלוטין)'],
    maxSafePortionHe: 'שקית אישית עד 50 גרם',
    safeSubstitutions: [
      '🥔 תפוצ׳יפס קלאסי / גלים מלח טבעי',
      '🌽 פריכיות אורז מלא או פריכיות תירס',
      '🍿 פופקורן טבעי עם מלח ושמן'
    ],
    cookingTips: ['לוודא שקונים תפוצ׳יפס בטעם טבעי (מלח) בלבד ולא בטעמי שמנת-בצל/ברביקיו המכילים שום ובצל'],
    riskScore: 1,
  },
  // --- שיבולת שועל / קוואקר (הרדוף אורגני, סוגת, קוואקר, תבואות, שופרסל גרין) ---
  {
    keywords: [
      'קוואקר',
      'קווטקר',
      'קווקר',
      'קואקר',
      'שיבולת שועל',
      'שבולת שועל',
      'פתיתי שיבולת שועל',
      'דייסת קוואקר',
      'דייסת שיבולת שועל',
      'שיבולת שועל להכנה מהירה',
      'קוואקר להכנה מהירה',
      'קוואקר עדין',
      'קוואקר עבה',
      'קוואקר דק',
      'קוואקר אורגני',
      'הרדוף קוואקר',
      'הרדוף שיבולת שועל',
      'קוואקר הרדוף',
      'שיבולת שועל הרדוף',
      'קוואקר עדין אורגני',
      'קוואקר עדין אורגני הרדוף',
      'קוואקר עדין אורגני של הרדוף',
      'סובין שיבולת שועל',
      'קוואקר אינסטנט',
      'שיבולת שועל דקה',
      'שיבולת שועל עבה',
      'הרדוף',
      'oats',
      'rolled oats',
      'quick oats',
      'quaker',
      'oatmeal',
      'harduf oats'
    ],
    statusPhase1: 'YELLOW',
    statusPhase2: 'GREEN',
    foodNameHe: 'שיבולת שועל / קוואקר (הרדוף אורגני / סוגת / Quaker)',
    foodNameEn: 'Rolled Oats / Quick Oats (Harduf Organic / Quaker)',
    verdictHe: 'אור צהוב! קוואקר/שיבולת שועל מותר לניר אך ורק במנה מדודה של עד 23 גרם (כ-2 כפות שטוחות). 🟡',
    explanationHe: 'שיבולת שועל (קוואקר, כולל קוואקר עדין אורגני של הרדוף ושיבולת שועל להכנה מהירה) מכילה שרשראות פרוקטנים (Fructans) וגלקטו-אוליגוסכרידים (GOS). לפי פרוטוקול ד"ר אליסון סיבקר (SSFG) ומחקרי אוניברסיטת מונאש: בשלב 1 קפדני מותרת מנה מדודה בלבד של עד 23 גרם (כ-2 כפות שטוחות יבשות) להכנת דייסה קלה על בסיס מים או חלב שקדים ללא סוכר. מנה רגילה גדולה (מעל 23-30 גרם) עשירה בפרוקטנים שמתסיסים את חיידקי ה-SIBO במעי הדק ועלולה לגרום לנפיחות וגזים. בשלב 2 (שילוב מחדש) ניתן להעלות בהדרגה את המנה עד 45-52 גרם (כחצי כוס).',
    fodmapTriggers: ['פרוקטנים (Fructans)', 'גלקטנים (GOS) בכמות מעל 23 גרם'],
    maxSafePortionHe: 'עד 23 גרם (כ-2 כפות שטוחות יבשות) בשלב 1 / עד 50 גרם בשלב 2',
    safeSubstitutions: [
      '🍚 דייסת אורז לבן מבושל או פודינג אורז קל (0 פרוקטנים)',
      '🌾 דייסת קינואה עדינה מבושלת היטב בחלב שקדים',
      '🥣 פריכיות אורז מלא במתינות',
      '🥑 ביצים מקושקשות עם עשבי תיבול ותרד לארוחת בוקר מושלמת'
    ],
    cookingTips: [
      'להכין עם מים רותחים או חלב שקדים ללא סוכר במקום חלב פרה רגיל',
      'מומלץ להשרות 10 דקות במים חמים לפני האכילה כדי להקל על תהליך העיכול',
      'למתק עם מעט תותים טריים או חצי בננה ירוקה במקום סוכר או סילאן'
    ],
    riskScore: 2,
  },
  // --- קצפת צמחית / קצפת פרווה (ריץ' / השף הלבן צמחית / אלפרו) - GREEN לניר ---
  {
    keywords: [
      'קצפת צמחית',
      'קצפת פרווה',
      'קצפת ריץ',
      'קצפת ריץ\'',
      'ריץ\'',
      'ריץ',
      'שמנת צמחית',
      'השף הלבן צמחית',
      'קצפת צמחית להקצפה',
      'שמנת פרווה',
      'קצפת השף הלבן',
      'שמנת צמחית לבישול',
      'אלפרו להקצפה',
      'rich',
      'richs',
      'rich\'s',
      'whip'
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'קצפת צמחית להקצפה / פרווה (ריץ׳ / השף הלבן)',
    foodNameEn: 'Plant-Based Parve Whipping Cream',
    verdictHe: 'אור ירוק! קצפת צמחית מותרת לניר (0% לקטוז, ללא חלב וללא גלוטן). 🟢',
    explanationHe: 'קצפת צמחית להקצפה (כגון ריץ׳ או קצפת צמחית השף הלבן) הינה מוצר פרווה ללא חלב וללא לקטוז כלל. היא מבוססת על שומן צמחי, מים, סוכר ומייצבים שאינם מתסיסים את חיידקי ה-SIBO במעי הדק (ללא פרוקטנים, ללא לקטוז וללא פוליאולים). מותרת ובטוחה לניר כקינוח או לציפוי עוגות ללא גלוטן! מומלץ לצרוך במתינות סבירה (עד 50-60 גרם / 2-3 כפות) בגלל אחוז השומן.',
    fodmapTriggers: ['0 לקטוז (פרווה לחלוטין)', '0 גלוטן / ללא פרוקטנים'],
    maxSafePortionHe: '2-4 כפות (עד 50-60 גרם)',
    safeSubstitutions: [
      '🥥 קרם קוקוס טבעי 100% להקצפה (Aroy-D)',
      '🥛 קצפת צמחית ריץ׳ / השף הלבן פרווה',
      '🍓 תותים טריים עם קצפת צמחית'
    ],
    cookingTips: ['להקציף קר ישירות מהמקרר לקבלת מרקם יציב ומושלם'],
    riskScore: 1,
  },
  // --- אבקת קקאו 100% טהור (עלית / השחר העולה / מיימונס) - GREEN לניר ---
  {
    keywords: [
      'אבקת קקאו',
      'קקאו',
      'קקאו טהור',
      'קקאו עלית',
      'קקאו השחר',
      'קקאו הולנדי',
      'אבקת קקאו לאפייה',
      'קקאו שופרסל',
      'קקאו מיימונס',
      'cocoa',
      'cocoa powder',
      'cacao'
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'אבקת קקאו 100% טהור (עלית / השחר העולה / מיימונס)',
    foodNameEn: '100% Pure Cocoa Powder',
    verdictHe: 'אור ירוק! אבקת קקאו טהור מותרת ובטוחה לניר. 🟢🍫',
    explanationHe: 'אבקת קקאו 100% טהור (ללא תוספת סוכר או חלב) הינה דלת FODMAP ודלת תסיסה בכמויות שימוש רגילות (עד 2 כפיות גדושות / 10-15 גרם). היא עשירה בפוליפנולים נוגדי חמצון המיטיבים עם רירית המעי ואינה מכילה לקטוז או פרוקטנים. מעולה להכנת משקה שוקו חם עם חלב שקדים/ללא לקטוז, או לאפייה ביתית ללא גלוטן.',
    fodmapTriggers: ['0 לקטוז (ללא מוצקי חלב)', 'דל FODMAP'],
    maxSafePortionHe: '1-2 כפיות גדושות (10-15 גרם) לארוחה',
    safeSubstitutions: [
      '🍫 שוקו חם מאבקת קקאו טהור + חלב שקדים ללא סוכר',
      '🍫 שוקולד מריר 85%+ איכותי (קובייה אחת)',
      '🍓 תותים בציפוי קקאו ומעט מייפל טהור'
    ],
    cookingTips: [
      'להמיס את אבקת הקקאו במעט מים רותחים לפני הוספת חלב שקדים או חלב דל לקטוז',
      'להמתיק עם 2-3 טיפות סטיביה טהורה או מעט סירופ מייפל 100%'
    ],
    riskScore: 1,
  },
  // --- מיץ תפוזים סחוט טרי (פרי מור / פרי ניב / פריגת) - YELLOW לניר ---
  {
    keywords: [
      'מיץ תפוזים',
      'מיץ תפוזים סחוט',
      'מיץ תפוזים טבעי',
      'תפוזים סחוט',
      'פרי מור תפוזים',
      'פרי ניב תפוזים',
      'פריגת תפוזים סחוט',
      'מיץ הדרים סחוט',
      'מיץ קלמנטינות סחוט',
      'orange juice',
      'fresh orange juice'
    ],
    statusPhase1: 'YELLOW',
    statusPhase2: 'YELLOW',
    foodNameHe: 'מיץ תפוזים 100% סחוט טרי (פרי מור / פרי ניב / פריגת)',
    foodNameEn: 'Fresh Squeezed Orange Juice',
    verdictHe: 'אור צהוב — כמות מוגבלת בלבד (עד 100 מ"ל / חצי כוס). 🟡🍊',
    explanationHe: 'תפוז שלם מכיל סיבים תזונתיים ויחס פרוקטוז-גלוקוז מאוזן (ולכן תפוז שלם הוא אור ירוק). לעומת זאת, כוס מיץ תפוזים סחוט (250 מ"ל) מרוכזת מ-3-4 תפוזים ללא הסיבים, ומכילה כמות גדולה של פרוקטוז חופשי שנספג מהר ועלול להתסיס את חיידקי ה-SIBO במעי הדק. מותר לניר לשתות אך ורק כמות קטנה ומדודה של עד חצי כוס (100 מ"ל), ועדיף בהרבה לאכול תפוז שלם וטרי.',
    fodmapTriggers: ['עודף פרוקטוז מרוכז ללא סיבים (Excess Fructose)'],
    maxSafePortionHe: 'עד חצי כוס (100 מ"ל) - לא לשתות כוס שלמה בבת אחת!',
    safeSubstitutions: [
      '🍊 תפוז או קלמנטינה שלמה טרייה (ירוק ובטוח — הסיבים מאטים את הספיגה)',
      '🍋 מים צוננים עם פלחי תפוז ולימון טריים ונענע',
      '🍵 תה ג׳ינג׳ר טבעי עם פלח תפוז'
    ],
    cookingTips: [
      'למהול חצי כוס מיץ תפוזים עם מי סודה קרים להפחתת עומס הפרוקטוז',
      'להעדיף תמיד אכילת פרי הדר שלם'
    ],
    riskScore: 3,
  },
  // --- חלב דל לקטוז / ללא לקטוז (Lactose-Free & Low Lactose Milk) ---
  {
    keywords: [
      'דל לקטוז',
      'ללא לקטוז',
      'חלב דל לקטוז',
      'חלב ללא לקטוז',
      'יטבתה דל לקטוז',
      'תנובה דל לקטוז',
      'טרה דל לקטוז',
      'משקה דל לקטוז',
      '0% לקטוז'
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'חלב פרה דל לקטוז / ללא לקטוז (Lactose-Free Milk)',
    foodNameEn: 'Lactose-Free Milk',
    verdictHe: 'אור ירוק! מותר ובטוח לניר (הלקטוז פורק מראש לאנזימים פשוטים).',
    explanationHe: 'בחלב דל לקטוז / ללא לקטוז, אנזים הלקטאז מפרק מראש את הלקטוז לגלוקוז וגלקטוז, שנספגים ישירות במעי הדק ללא תסיסה חיידקית. בטוח לחלוטין לניר לשתייה עם קפה, להכנת שייקים מותרים או לדייסות דלות FODMAP.',
    fodmapTriggers: ['0 לקטוז (הלקטוז מפורק לחלוטין)'],
    maxSafePortionHe: 'עד כוס אחת (200-250 מ״ל) לארוחה',
    safeSubstitutions: [
      '🥛 חלב שקדים טהור ללא סוכר וללא תוספי גומי',
      '🥥 יוגורט קוקוס טבעי ללא סוכר',
      '🧀 גבינת פרמזן מיושנת (Aged Parmesan — 0% לקטוז)'
    ],
    cookingTips: ['לוודא שאין תוספת סוכרים או חומרי עיבוי כמו אינולין ברשימת הרכיבים'],
    riskScore: 1,
  },
  // --- קפה שחור טורקי טהור (עלית / שטראוס / לנדוור) - 100% GREEN לניר ---
  {
    keywords: [
      'קפה שחור',
      'קפה טורקי',
      'קפה עלית',
      'קפה שטראוס',
      'קפה טחון',
      'קפה שחור עם הל',
      'קפה שחור עלית',
      'קפה שחור שטראוס',
      'קפה טורקי עלית',
      'קפה בוץ',
      'אספרסו קצר',
      'אספרסו כפול',
      'קפה שחור ללא סוכר',
      'קפה נמס עלית'
    ],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'קפה שחור טורקי טהור (עלית / שטראוס)',
    foodNameEn: 'Pure Black Turkish Coffee',
    verdictHe: 'אור ירוק! קפה שחור טהור מותר ובטוח לחלוטין לניר. 🟢☕',
    explanationHe: '100% פולי קפה קלויים וטחונים טהורים אינם מכילים סוכרים, פחמימות או FODMAPs, ולכן אינם גורמים לשום תסיסה חיידקית במעי הדק. בנוסף, קפאין טבעי בקפה שחור מעורר ומאיץ את תנועתיות המעי הדק (מנגנון ה-MMC), המסייע בניקוי שאריות מזון וחיידקים מדרכי העיכול. יש לשתות ללא חלב פרה וללא סוכר שולחני.',
    fodmapTriggers: ['0 FODMAPs — ללא רכיבי תסיסה'],
    maxSafePortionHe: '1-2 כוסות ביום (ללא סוכר וחלב)',
    safeSubstitutions: [
      '☕ קפה שחור טרי / אספרסו קצר',
      '🥛 קפה שחור עם משקה שקדים 100% ללא סוכר',
      '🍵 חליטת ג׳ינג׳ר טבעית (מאיצה את מנגנון ה-MMC)',
      '🌿 תה ירוק עדין / תה מנטה טבעי'
    ],
    cookingTips: [
      'להכין במים רותחים ללא תוספת סוכר',
      'להימנע מתוספת חלב פרה (לקטוז מתסיס)',
      'במידת הצורך ניתן להמתיק עם 2-3 טיפות סטיביה טהורה'
    ],
    riskScore: 1,
  },
  // --- קפה ומשקאות (Coffee, Tea & Beverages) ---
  {
    keywords: ['קפה', 'אספרסו', 'לאטה', 'נס קפה', 'קפוצינו', 'הפוך', 'קפה עם חלב', 'שוקו', 'תה שחור', 'משקה', 'קולה', 'מיץ'],
    statusPhase1: 'YELLOW',
    statusPhase2: 'GREEN',
    foodNameHe: 'קפה ומשקאות חמים / קרים',
    foodNameEn: 'Coffee, Tea & Beverages',
    verdictHe: 'אור צהוב! קפה שחור מותר, אך חלב רגיל או ממתיקים אסורים.',
    explanationHe: 'פולי קפה טהורים אינם מכילים FODMAPs. יחד עם זאת, קפאין עלול להגביר חומציות ותנועתיות יתר אצל חלק מהמטופלים. הסכנה העיקרית בקפה היא תוספת חלב פרה רגיל (לקטוז מתסיס) או ממתיקים מלאכותיים כוהליים. מומלץ לשתות אספרסו/אמריקנו שחור או עם חלב שקדים טהור ללא סוכר.',
    fodmapTriggers: ['לקטוז מחלב ניגר (אם הוסף חלב)', 'סוכרים מוספים'],
    maxSafePortionHe: '1-2 כוסות קפה שחור ביום / עם חלב שקדים ללא סוכר',
    safeSubstitutions: [
      '☕ קפה אספרסו שחור נקי (ללא חלב פרה)',
      '🥛 קפה עם חלב שקדים טהור ללא סוכר וללא תוספי גומי',
      '🫚 תה ג׳ינג׳ר טרי חם (מאיץ מעולה לתנועתיות המעי הדק MMC)',
      '🍵 תה ירוק עדין או תה מנטה/נענע טבעי'
    ],
    cookingTips: [
      'להימנע מקפה על בטן ריקה לחלוטין אם יש רגישות בקיבה',
      'לבדוק שחלב השקדים נקי מקרגינן (Carrageenan) וגומי גלאן'
    ],
    riskScore: 2,
  },
  // --- בירה ומשקאות מאלט (Beer & Malt Beverages) - 100% RED לניר ---
  {
    keywords: [
      'בירה',
      'בירה שחורה',
      'נשר מאלט',
      'מאלט',
      'מאלט סטאר',
      'גולדסטאר',
      'היינקן',
      'קרלסברג',
      'מכבי',
      'טובורג',
      'קורונה',
      'פאולנר',
      'ויינשטפן',
      'סטלה ארטואה',
      'גינס',
      'בירת חיטה',
      'בירת לאגר',
      'סיידר תפוחים אלכוהולי',
      'שנדי',
      'לתת שעורה'
    ],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'בירה ומשקאות מאלט / לתת (בירה לבנה, שחורה, לאגר וחיטה)',
    foodNameEn: 'Beer & Malt Beverages',
    verdictHe: 'אור אדום בוהק! בירה ומשקאות מאלט אסורים לחלוטין לניר ב-SIBO. 🛑🍺',
    explanationHe: 'בירה מיוצרת מהתססה פעילה של דגנים עתירי פרוקטנים וגלקטנים (לתת שעורה או חיטה) בשילוב שמרים חיים. שאריות הפחמימות והסוכרים הלא-מותססים מגיעים ישירות למעי הדק ומזינים במהירות שיא את חיידקי ה-SIBO, מה שמוביל לייצור מאסיבי של גזים (מימן/מתאן), נפיחות בטנית מיידית וכאבי בטן עזים. בנוסף, הגיזוז (CO2) מרחיב את דפנות המעי ומשתק את מנגנון הניקוי החשוב MMC. בירה שחורה (מאלט) מסוכנת כפליים בשל תוספת סוכר פשוט מרוכז.',
    fodmapTriggers: ['פרוקטנים וגלקטנים מלתת שעורה וחיטה', 'שמרים מתסיסים', 'גזים ו-CO2 מוגזים', 'סוכרים פשוטים (בבירה שחורה/מאלט)'],
    maxSafePortionHe: '0 מ"ל (אסור לחלוטין)',
    safeSubstitutions: [
      '🍷 כוס יין אדום או לבן יבש בלבד (Dry Wine — עד 120 מ"ל, מכיל פחות מ-1 גרם סוכר שיורי)',
      '🍸 ג׳ין או וודקה איכותית נקייה עם מי סודה ופלח לימון/נענע טרייה (0 FODMAP, ללא סוכר)',
      '🍋 מי סודה צוננת עם לימון סחוט טרי, שורש ג׳ינג׳ר מגורר ועלי נענע'
    ],
    cookingTips: [
      'להימנע לחלוטין מבירה (כולל בירה ללא אלכוהול - שמכילה עדיין לתת שעורה ופרוקטנים)',
      'להימנע מבישול עם בירה (הפרוקטנים מהלתת נשארים בתבשיל גם לאחר אידוי האלכוהול)'
    ],
    riskScore: 5,
  },
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
    safeSubstitutions: [
      '🌾 פריכיות אורז מלא או אורז לבן (במידה מתונה)',
      '🍞 לחם מחמצת כוסמין 100% אמיתי שעבר תפיחה איטית של 24 שעות (בדיקה אישית בלבד)',
      '🥖 קרקרים מבוססי קמח שקדים או זרעי צ׳יה ללא גלוטן',
      '🥬 עטיפות עלי חסה פריכים כבסיס לכריך'
    ],
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
    safeSubstitutions: [
      '🧄 שמן זית מושרה בשום (Garlic-Infused Oil) — הפרוקטן אינו מסיס בשמן ומותר לחלוטין!',
      '🌱 החלק הירוק בלבד של בצל ירוק (0 פרוקטנים)',
      '🌿 עירית קצוצה טרייה',
      '🧂 תבלין הינג (Asafoetida) שמעניק ארומת שום ללא FODMAPs'
    ],
    cookingTips: [
      'במסעדות: יש לבקש במפורש מנה שהוכנה במחבת נקייה ללא שום ובצל כלל',
      'להשתמש בעשבי תיבול טריים כמו פטרוזיליה, כוסברה, בזיליקום ורוזמרין להעשרת הטעם'
    ],
    riskScore: 5,
  },
  // --- קטניות וחומוס (Legumes) ---
  {
    keywords: ['חומוס', 'עדשים', 'שעועית', 'פול', 'אפונה', 'פלאפל', 'סויה', 'טופו רך', 'שעועית מש', 'תורמוס'],
    statusPhase1: 'RED',
    statusPhase2: 'YELLOW',
    foodNameHe: 'קטניות (חומוס, עדשים, שעועית)',
    foodNameEn: 'Legumes & Pulses',
    verdictHe: 'אור אדום! קטניות מתסיסות ביותר ואסורות בשלב 1.',
    explanationHe: 'קטניות עשירות ב-GOS (גלקטו-אוליגוסכרידים) ופחמימות פרה-ביוטיות שאינן ניתנות לעיכול ע"י האדם אלא מותססות ע"י חיידקי המעי. ממרח חומוס קנוי כולל בנוסף גם שום.',
    fodmapTriggers: ['גלקטנים (GOS)', 'פרוקטנים (Fructans)'],
    maxSafePortionHe: '0 גרם בשלב 1 / עד 45 גרם עדשים משומרות שטופות בשלב 2',
    safeSubstitutions: [
      '🥒 ממרח קישואים קלויים בשמן זית ושמן שום (במרקם וטעם חומוס ללא קטניות!)',
      '🥕 ממרח גזר אפוי וטחון עם שמן זית וכמון',
      '🍗 חזה עוף צלוי רך וקל לעיכול',
      '🍳 ביצים קשות או חביתה',
      '🍲 טופו מוצק (Firm Tofu) מסונן היטב'
    ],
    cookingTips: ['אם מכינים ממרח: להכין ממרח קישואים או גזר קלוי בשמן זית ללא קטניות'],
    riskScore: 5,
  },
  // --- מוצרי חלב פרה רגיל ולקטוז (Dairy & Lactose) ---
  {
    keywords: ['חלב פרה', 'חלב רגיל', 'חלב תנובה', 'יוגורט', 'קוטג׳', 'גבינה לבנה', 'גבינה צהובה רגילה', 'שמנת', 'גלידה', 'מוצרלה רכה', 'ריזוטו שמנת'],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'מוצרי חלב פרה ניגר וגבינות רכות',
    foodNameEn: 'Dairy & Lactose Products',
    verdictHe: 'אור אדום! מכיל לקטוז שמתסיס את חיידקי ה-SIBO.',
    explanationHe: 'חלב פרה רגיל עשיר בלקטוז. במצב של SIBO רירית המעי הדק מודלקת, ספיגת הלקטוז ירודה והחיידקים מתסיסים אותו במהירות. מומלץ לעבור לחלב דל לקטוז או חלב שקדים טהור.',
    fodmapTriggers: ['לקטוז (Lactose)'],
    maxSafePortionHe: '0 מ״ל חלב רגיל / גבינות קשות עד 40 גרם',
    safeSubstitutions: [
      '🥛 חלב דל לקטוז / ללא לקטוז (0% לקטוז)',
      '🥛 חלב שקדים טהור ללא סוכר וללא תוספי גומי (Almond Milk)',
      '🧀 גבינת פרמזן מיושנת (Aged Parmesan) — כמעט 0% לקטוז!',
      '🧈 חמאה מזוקקת (גהי / Ghee) נקייה ממוצקי חלב ולקטוז',
      '🥥 יוגורט קוקוס טבעי ללא סוכר'
    ],
    cookingTips: ['לוודא שתווית חלב השקדים נקייה מקרגינן (Carrageenan) וגומי גלאן (Gellan Gum)'],
    riskScore: 4,
  },
  // --- ממתקים, שוקולד וסוכרים (Sweets & Desserts) ---
  {
    keywords: ['שוקולד', 'עוגה', 'עוגיות', 'ממתק', 'סוכר', 'דבש', 'סילאן', 'ריבה', 'חלבה', 'גלידה', 'קינוח', 'קרמל', 'ופל'],
    statusPhase1: 'RED',
    statusPhase2: 'RED',
    foodNameHe: 'מתוקים, קינוחים וסוכרים מרוכזים',
    foodNameEn: 'Sweets, Desserts & Concentrated Sugars',
    verdictHe: 'אור אדום! סוכרים פשוטים מזינים ישירות את חיידקי ה-SIBO.',
    explanationHe: 'סוכרים מרוכזים, דבש (פרוקטוז חופשי), סילאן וממתיקים מלאכותיים כוהליים עוברים תסיסה מהירה במעי הדק. בשלב 1 יש להימנע ממתוקים מסחריים.',
    fodmapTriggers: ['פרוקטוז חופשי (Excess Fructose)', 'סוכרוז מרוכז', 'פוליאולים'],
    maxSafePortionHe: '0 גרם קינוחים מסחריים / עד כפית אחת סירופ מייפל טהור',
    safeSubstitutions: [
      '🍓 תותים טריים עם מעט סירופ מייפל טהור 100%',
      '🍫 שוקולד מריר 85%+ איכותי (קובייה אחת מדודה)',
      '🫐 אוכמניות כחולות טריות (עד כוס אחת)',
      '🥞 עוגיות קמח שקדים וביצים תוצרת בית ללא סוכר'
    ],
    cookingTips: ['אם רוצים להמתיק: להשתמש בכמות זעירה של מייפל טהור 100% (אינו מכיל פרוקטוז חופשי)'],
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
    safeSubstitutions: [
      '🐟 דגי ים טריים עשירים באומגה 3 (סלמון, דניס, לברק)',
      '🍗 חזה עוף טרי צלוי',
      '🥚 ביצי חופש מבושלות או חביתה בשמן זית'
    ],
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
    safeSubstitutions: [
      '🥕 גזר מבושל ורך',
      '🥒 מלפפון קלוף טרי',
      '🥗 עלי חסה רעננים',
      '🥒 קישוא מאודה בשמן זית'
    ],
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
    safeSubstitutions: [
      '🍓 תות שדה טרי',
      '🫐 אוכמניות כחולות טריות',
      '🥝 קיווי ירוק',
      '🍊 תפוז טרי'
    ],
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
    safeSubstitutions: [
      '🍓 תות שדה טרי (עד 5-6 יחידות)',
      '🍊 תפוז או קלמנטינה טרייה',
      '🫐 אוכמניות כחולות טריות (עד 1 כוס)',
      '🍈 מלון קנטלופ (מלון כתום - עד 3/4 כוס)'
    ],
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
    safeSubstitutions: [
      '🫒 שמן זית כתית מעולה בכבישה קרה',
      '🧄 שמן זית מושרה שום (Garlic-Infused Oil)',
      '🧈 חמאת גהי (Ghee) מזוקקת',
      '🥥 שמן קוקוס אורגני'
    ],
    cookingTips: ['שמן זית מושרה בשום מעניק טעם שום אמיתי ללא שום נזק ל-SIBO!'],
    riskScore: 1,
  },
  // --- תה קר, פיוז תה ומשקאות מסחריים (Iced Tea & Soft Drinks) ---
  {
    keywords: ['פיוז תה', 'פיוזתה', 'fuze', 'fuzetea', 'fuce tea', 'fuce', 'תה קר', 'נסטי', 'nestea', 'iced tea', 'תה קר אפרסק', 'תה קר לימון', 'thé', 'thés', 'thé glacé'],
    statusPhase1: 'YELLOW',
    statusPhase2: 'YELLOW',
    foodNameHe: 'תה קר / פיוז תה (Fuze Tea)',
    foodNameEn: 'Iced Tea / Fuze Tea',
    verdictHe: 'אור צהוב — מוגבל / זהירות בגלל סוכר ורכז פרי',
    explanationHe: 'תה קר מסחרי (כמו פיוז תה או נסטי) מבוסס על מים ותמצית תה, אך מוסיפים לו כמויות משמעותיות של סוכר, סירופ תירס עתיר פרוקטוז (HFCS) או רכזי פירות (כגון רכז אפרסק/לימון). ב-SIBO, עודף פרוקטוז נספג באיטיות ומתסיס את חיידקי המעי הדק. מותר בכמות מדודה וקטנה (עד חצי כוס), או עדיף להחליף בתה קר ירוק/צמחים ביתי ללא סוכר.',
    fodmapTriggers: ['עודף פרוקטוז (Excess Fructose)', 'סוכר מוסף / רכז פרי'],
    maxSafePortionHe: 'חצי כוס עד כוס קטנה (100-150 מ"ל)',
    safeSubstitutions: [
      '🍵 תה ירוק קר ביתי עם נענע ולימון (ללא סוכר)',
      '🫚 חליטת ג׳ינג׳ר קרה מרעננת',
      '🍋 מים צוננים עם פלחי לימון וקרח',
      '🌿 תה צמחים / קמומיל קר'
    ],
    cookingTips: ['להכין תה קר בבית מחליטת תה ירוק או נענע ולהגיש עם קרח ופלח לימון ללא סוכר'],
    riskScore: 3,
  },
  // --- תה ירוק וחליטות צמחים ללא סוכר (Natural Teas & Infusions) ---
  {
    keywords: ['תה ירוק', 'תה נענע', 'תה מנטה', 'חליטת נענע', 'חליטת מנטה', 'חליטת ג׳ינג׳ר', 'חליטת ג\'ינג\'ר', 'חליטת קמומיל', 'תה שחור', 'תה ללא סוכר'],
    statusPhase1: 'GREEN',
    statusPhase2: 'GREEN',
    foodNameHe: 'תה ירוק / שחור / חליטת נענע וג׳ינג׳ר (ללא סוכר)',
    foodNameEn: 'Green Tea / Peppermint / Ginger Infusion',
    verdictHe: 'אור ירוק! מותר, בטוח ומרגיע את מערכת העיכול.',
    explanationHe: 'תה ירוק, תה שחור רגיל, עלי נענע/מנטה וג׳ינג׳ר טרי נקיים מ-FODMAPs. מנטה וג׳ינג׳ר אף מרגיעים את שרירי מערכת העיכול ומפחיתים גזים ועוויתות.',
    fodmapTriggers: ['ללא FODMAP'],
    maxSafePortionHe: 'חופשי (2-4 כוסות ביום)',
    safeSubstitutions: [
      '🍵 תה ירוק טהור עשיר בנוגדי חמצון',
      '🌿 חליטת עלי נענע טריים',
      '🫚 חליטת שורש ג׳ינג׳ר טרי פרוס',
      '🌼 תה קמומיל מרגיע'
    ],
    cookingTips: ['לחלוט עלי נענע או שורש ג׳ינג׳ר במים רותחים 5-10 דקות'],
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
    safeSubstitutions: [
      '🍚 אורז בסמטי לבן מבושל היטב',
      '🥔 תפוח אדמה אפוי בשמן זית ומלח ים',
      '🌾 קינואה מבושלת קלה לעיכול'
    ],
    cookingTips: ['לבשל היטב עד שהאורז/תפוח האדמה רכים וקלים לעיכול'],
    riskScore: 2,
  },
];

/**
 * Detect conversational questions, meal preparation advice, and category recommendations (e.g. salads, allowed vegetables, breakfast ideas)
 */
export function detectConversationalAdvisoryQuery(query: string, phase: SiboPhase): FoodAnalysisResult | null {
  const norm = normalizeHebrew(query);
  const isPhase1 = phase === 'phase1_strict';

  // 1. Salad questions (e.g., "אני רוצה להכין סלט איזה ירקות אני יכול להשתמש", "איזה ירקות מותרים לסלט", "מה לשים בסלט", "סלט ירקות לסיבו", "איך להכין סלט")
  const isSaladQuery =
    norm.includes('סלט') ||
    (norm.includes('ירק') && (norm.includes('להכין') || norm.includes('להשתמש') || norm.includes('איזה ירקות') || norm.includes('מותרים לסלט') || norm.includes('אפשר לשים') || norm.includes('באיזה')));

  if (isSaladQuery) {
    return {
      status: 'GREEN',
      foodName: 'סלט ירקות עשיר ובטוח ל-SIBO 🥗',
      englishName: 'SIBO-Safe Fresh Salad & Allowed Vegetables',
      shortVerdict: 'אור ירוק! ניתן ומומלץ להכין סלט עשיר, מרענן ומשביע מירקות ירוקים דלי תסיסה!',
      detailedExplanation: 'הירקות המותרים לסלט ללא הגבלה (0 תסיסה): מלפפון ירוק טרי (קלוף/שטוף היטב), חסה ערבית/רומית/אייסברג, עלי ארוגולה, עלי רוקט, תרד בייבי, עשבי תיבול (פטרוזיליה, שמיר, כוסברה, נענע, בזיליקום), ועלי בצל ירוק (החלק הירוק בלבד!).\n\n' +
        'ירקות צהובים מדודים בבטחה: עגבנייה (עד 1/2 עגבנייה בינונית או 4 שרי), פלפל אדום/ירוק (עד 1/3 פלפל), גזר מגורר (עד 75 גרם), צנוניות (2-3 יח\'), זיתים (5-6 יח\').\n\n' +
        'רוטב מושלם לסיבו (0% תסיסה): 2 כפות שמן זית כתית מעולה, מיץ מ-1/2 לימון סחוט טרי, מלח הימלאיה, פלפל שחור, ושמן זית מושרה בשום (Garlic Oil - מעניק ארומת שום מושלמת ללא שום נפיחות!).\n\n' +
        'תוספות חלבון משביעות: ביצה קשה חתוכה, טונה בשמן זית, רצועות חזה עוף צלויות קרות, או 30 גרם גבינת פרמז\'ן / פטה עיזים.\n\n' +
        'מה אסור לשים בסלט (אדום): בצל חי מכל סוג, שום כתוש, פטריות, כרובית, ברוקולי חי, קטניות, תירס ורטבים תעשייתיים מוכנים.',
      fodmapTriggers: ['ירקות דלי FODMAP ללא תסיסה', 'שמן זית כתית מעולה', 'מיץ לימון סחוט'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'קערת סלט גדולה ועשירה המבוססת על ירקות ירוקים מותרים',
      safeSubstitutions: [
        '🥗 סלט ירוק עשיר: מלפפון, חסה, ארוגולה, שמיר, עלי בצל ירוק ולימון',
        '🍳 סלט ניסואז בטוח: חסה, מלפפון, טונה, ביצה קשה וזיתים',
        '🍗 סלט קיסר מותאם: חסה רומית, רצועות עוף צלויות, שמן זית ופרמז\'ן',
        '🫒 רוטב שמן זית כתית מעולה + לימון + שמן שום מושרה (0 תסיסה)'
      ],
      cookingTips: [
        'לחתוך את הירקות טריים בסמוך לארוחה לספיגה מיטבית של ויטמינים',
        'להשתמש בשמן זית מושרה בשום (Garlic Oil) לקבלת טעם שום אמיתי ללא תסיסה',
        'להוסיף חלבון (ביצה קשה / טונה / עוף) כדי להפוך את הסלט לארוחה מאוזנת ומשביעה',
        'להימנע לחלוטין מרוטבי סלט תעשייתיים המכילים סירופ תירס, סוכר או אבקות תיבול'
      ],
      medicalReferences: [
        'Dr. Allison Siebecker - SIBO Specific Food Guide (SSFG)',
        'Monash University Low FODMAP Certified Research',
        'Dr. Nirala Jacobi - Bi-Phasic Diet Protocol'
      ],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  // 2. Soup & Broth questions (e.g., "אני רוצה להכין מרק", "איך להכין מרק", "מרק עוף", "מרק ירקות", "איזה מרק מותר")
  const isSoupQuery =
    norm.includes('מרק') ||
    norm.includes('ציר') ||
    (norm.includes('לבשל') && norm.includes('מרק'));

  if (isSoupQuery) {
    return {
      status: 'GREEN',
      foodName: 'מרק עוף וירקות בטוח ל-SIBO 🍲',
      englishName: 'SIBO-Safe Chicken & Vegetable Soup',
      shortVerdict: 'אור ירוק! מרק ביתי עשיר, מזין וקל לעיכול — מושלם ל-SIBO!',
      detailedExplanation: 'מדריך להכנת מרק מושלם ל-SIBO:\n\n' +
        '🟢 מצרכים מותרים למרק (אור ירוק):\n' +
        '• עוף טרי / כרעיים / חזה עוף / שפונדרה בקר / הודו\n' +
        '• ירקות מותרים: גזר מבושל, קישוא / זוקיני חתוך, שורש פטרוזיליה בכמות קטנה, דלעת (בשלב 2)\n' +
        '• עשבי תיבול טריים: שמיר, פטרוזיליה, כוסברה, טימין, עלי דפנה\n' +
        '• תיבול עשיר: מלח ים / הימלאיה, פלפל שחור, כורכום, ג\'ינג\'ר טרי מגורר\n' +
        '• שמן זית מושרה בשום (Garlic-Infused Oil) — מעניק למרק ארומת שום משגעת ללא שום תסיסה!\n\n' +
        '🔴 מה אסור להכניס למרק (אור אדום):\n' +
        '• בצל חי (לבן/סגול), כרישה, שאלוט ושום כתוש (הטריגרים הקשים ביותר ב-SIBO!)\n' +
        '• אבקת מרק קנויה מסחרית (מכילה אבקת שום/בצל, סוכר, מונוסודיום גלוטמט וגלוטן)\n' +
        '• קטניות (עדשים, שעועית, חומוס, אפונה, גריסים)\n' +
        '• פטריות, כרובית, ברוקולי\n' +
        '• סלרי בכמות גדולה (מותר עד 1/4 גבעול דק בלבד).\n\n' +
        '💡 סוד השפים ל-SIBO:\n' +
        'מטגנים שיני שום שלמות ב-2 כפות שמן זית בסיר כ-3 דקות עד להזהבה ומוציאים את שיני השום מהסיר לפני הוספת המים! השמן סופג את טעם השום המושלם ללא פרוקטנים (הפרוקטן אינו מסיס בשמן).',
      fodmapTriggers: ['מרק דל FODMAP ללא בצל וללא אבקות מרק'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'קערת מרק גדולה ועשירה עם עוף וירקות מותרים',
      safeSubstitutions: [
        '🍲 מרק עוף צח עם גזר, קישוא, שמיר ושמן שום',
        '🥩 מרק בקר עשיר עם עשבי תיבול ושורש פטרוזיליה',
        '🥣 מרק כתום עדין: גזר, דלעת מדודה, ג\'ינג\'ר וחלב קוקוס טבעי (בשלב 2)',
        '🧄 שמן זית מושרה שום להעשרת הטעם'
      ],
      cookingTips: [
        'להכין ציר מרק ביתי אמיתי מעצמות ועוף ללא שום אבקות מרק תעשייתיות',
        'להוסיף כורכום וג\'ינג\'ר טרי שמסייעים להפחתת דלקתיות ושיפור תנועתיות המעי'
      ],
      medicalReferences: [
        'Dr. Allison Siebecker - SIBO Specific Food Guide',
        'Dr. Nirala Jacobi - Bi-Phasic Diet Protocols'
      ],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  // 3. Meats, Poultry & Fish (בשר, עוף, דגים ותבשילים)
  const isMeatFishQuery =
    (norm.includes('עוף') || norm.includes('חזה עוף') || norm.includes('בשר') || norm.includes('סטייק') || norm.includes('סלמון') || norm.includes('דג') || norm.includes('דגים') || norm.includes('קציצות') || norm.includes('פרגיות') || norm.includes('הודו') || norm.includes('בקר')) &&
    (norm.includes('להכין') || norm.includes('לבשל') || norm.includes('איך') || norm.includes('איזה') || norm.includes('מותר') || norm.includes('לתבל') || norm.includes('אני רוצה'));

  if (isMeatFishQuery) {
    return {
      status: 'GREEN',
      foodName: 'בשר, עוף ודגים ל-SIBO 🍗',
      englishName: 'SIBO-Safe Meats, Poultry & Fresh Fish',
      shortVerdict: 'אור ירוק! חלבונים טהורים מותרים, משביעים ודלי תסיסה לחלוטין!',
      detailedExplanation: 'מדריך מנות עיקריות בטוחות ל-SIBO:\n\n' +
        '🟢 חלבונים מותרים (0 FODMAP, בטוחים לחלוטין):\n' +
        '• חזה עוף טרי, כרעיים, פולקע, שוקיים, פרגיות נקיות\n' +
        '• בשר בקר טרי: אנטרקוט, סינטה, פילה, בקר טחון נקי (ללא בצל/לחם)\n' +
        '• דגי ים טריים: סלמון, דניס, לברק, מוסר, טונה בשמן זית/מים\n' +
        '• בשר הודו טרי\n\n' +
        '🧂 תיבול מומלץ ובטוח:\n' +
        '• שמן זית כתית מעולה, שמן זית מושרה בשום (Garlic Oil)\n' +
        '• עשבי תיבול: פטרוזיליה, שמיר, כוסברה, רוזמרין, טימין, בזיליקום, עלי דפנה\n' +
        '• תבלינים טהורים: מלח ים, פלפל שחור, פפריקה מתוקה/חריפה, כמון, כורכום, ג\'ינג\'ר טרי\n' +
        '• עלי בצל ירוק (החלק הירוק העליון בלבד)\n\n' +
        '🔴 ממה להימנע (אור אדום):\n' +
        '• תיבול בבצל קצוץ, אבקת בצל, שום חי או אבקת שום\n' +
        '• רטבים קנויים (טריאקי, ברביקיו, צ\'ילי מתוק, רוטב סויה עתיר חיטה, מרינדות מוכנות)\n' +
        '• קציצות המכילות פירורי לחם או בצל (להחליף בקמח שקדים וגזר מגורר דק).',
      fodmapTriggers: ['0 FODMAP בחלבון טהור'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'מנה רגילה ומשביעה (150-250 גרם לארוחה)',
      safeSubstitutions: [
        '🍗 חזה עוף צלוי בשמן זית, פפריקה, כמון ועשבי תיבול',
        '🐟 פילה סלמון עסיסי בתנור עם לימון ושמיר',
        '🥩 סטייק אנטרקוט במחבת עם שמן שום ורוזמרין',
        '🧆 קציצות בקר אפויות עם קישוא מגורר ושמן שום ללא בצל'
      ],
      cookingTips: [
        'להכין מרינדה ביתית משמן זית, שמן שום, לימון, פפריקה וכמון במקום רטבים קנויים',
        'במסעדות: לבקש נתח בשר או דג צלוי במחבת נקייה עם שמן זית ומלח בלבד'
      ],
      medicalReferences: ['Dr. Siebecker SIBO Guide', 'Monash University Low FODMAP Diet'],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  // 4. Eggs, Omelettes & Shakshuka (ביצים, חביתות ושקשוקה)
  const isEggQuery =
    (norm.includes('ביצ') || norm.includes('חבית') || norm.includes('שקשוקה') || norm.includes('מקושקשת')) &&
    (norm.includes('להכין') || norm.includes('לבשל') || norm.includes('איך') || norm.includes('איזה') || norm.includes('מותר') || norm.includes('אפשר') || norm.includes('אני רוצה') || norm.length <= 15);

  if (isEggQuery) {
    return {
      status: 'GREEN',
      foodName: 'ביצים, חביתות ושקשוקה ל-SIBO 🍳',
      englishName: 'SIBO-Safe Eggs, Omelettes & Shakshuka',
      shortVerdict: 'אור ירוק! ביצים הן חלבון מושלם, קל לעיכול ונטול FODMAP לחלוטין!',
      detailedExplanation: 'מדריך להכנת מנות ביצים ל-SIBO:\n\n' +
        '🟢 רעיונות מנצחים ובטוחים:\n' +
        '• חביתת עשבי תיבול: 2 ביצים טרופות עם פטרוזיליה, שמיר, עלי בצל ירוק (ירוק בלבד), מלח ופלפל, מטוגנות ב-1 כף שמן זית / חמאת גהי.\n' +
        '• שקשוקה בטוחה ל-SIBO: רוטב מ-2 עגבניות טריות קצוצות מבושלות בשמן זית ושמן שום, כמון, פפריקה מתוקה ומלח (ללא בצל וללא שום חי!), עם 2 ביצים מעל.\n' +
        '• ביצים קשות: 2 ביצים קשות עם שמן זית כתית מעולה, מלח הימלאיה ועלי רוקט/מלפפון.\n' +
        '• ביצת עין / מקושקשת: בשמן זית או גהי לצד סלט ירקות ירוק.\n\n' +
        '🔴 ממה להימנע:\n' +
        '• טיגון בבצל או שום רגיל.\n' +
        '• הוספת חלב פרה רגיל או גבינות רכות לחביתה (מותר להוסיף 20-30 גרם פרמז\'ן מיושן או גבינת פטה עיזים).',
      fodmapTriggers: ['0 FODMAP בביצים'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: '2-3 ביצים לארוחה',
      safeSubstitutions: [
        '🍳 חביתת ירק עשירה בשמן זית ועשבי תיבול',
        '🍅 שקשוקה ביתית בשמן שום ללא בצל',
        '🥚 זוג ביצים קשות עם שמן זית ומלח'
      ],
      cookingTips: ['ביצים ושמן זית הם הפתרון המהיר והמשביע ביותר בהתקף רעב'],
      medicalReferences: ['Dr. Siebecker SIBO Specific Food Guide'],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  // 5. Bread, Pasta & Doughs (לחם, פסטה, מאפים ותחליפים)
  const isBreadPastaQuery =
    (norm.includes('פסטה') || norm.includes('לחם') || norm.includes('פיתה') || norm.includes('פיצה') || norm.includes('בצק') || norm.includes('נודלס') || norm.includes('קרקר')) &&
    (norm.includes('להכין') || norm.includes('איזה') || norm.includes('מותר') || norm.includes('אפשר') || norm.includes('לאכול') || norm.includes('אני רוצה'));

  if (isBreadPastaQuery) {
    return {
      status: 'YELLOW',
      foodName: 'מדריך לחמים, פסטות ותחליפי בצק ל-SIBO 🥖',
      englishName: 'SIBO Bread & Pasta Guidelines',
      shortVerdict: 'אור צהוב — יש להשתמש בתחליפים דלי פרוקטנים וללא גלוטן מותסס!',
      detailedExplanation: 'הנחיות ללחם, פסטה ובצקים ב-SIBO:\n\n' +
        '🟢 תחליפים בטוחים ומאושרים (אור ירוק):\n' +
        '• נודלס זוקיני (Zoodles) — רצועות קישוא מוקפצות בשמן שום ועגבניות טריות\n' +
        '• דפי אורז קריספיים ממולאים ברצועות עוף וירקות מותרים\n' +
        '• פריכיות אורז 100% (לבן או מלא) — עד 2-3 פריכיות לארוחה\n' +
        '• קרקרים מקמח שקדים וזרעי צ\'יה (ללא חיטה וללא סוכר)\n' +
        '• פסטה מאורז חום או קינואה בכמות מדודה (עד 1/2 כוס מבושלת בשלב 2)\n' +
        '• לחם מחמצת כוסמין 100% אמיתי בהתססה איטית ממושכת (בשלב 2 בלבד, פרוסה 1)\n\n' +
        '🔴 מאפים אסורים ב-SIBO (אור אדום):\n' +
        '• לחם לבן, לחם אחיד, פיתות, חלות, באגטים, לחמניות רגילות\n' +
        '• פסטה רגילה מחיטת דורום, פיצה רגילה, בצק עלים, בורקסים\n' +
        '• מאפים ללא גלוטן מסחריים המכילים קמח סויה, אינולין, סיבים פרה-ביוטיים או אבקת חלב.',
      fodmapTriggers: ['פרוקטנים מחיטה ושעורה', 'עמילן מרוכז'],
      phase1Compatibility: false,
      phase2Compatibility: true,
      maxSafePortion: 'לפי התחליף: זודלס חופשי / פריכיות 2-3 יח\' / פסטת אורז 1/2 כוס (שלב 2)',
      safeSubstitutions: [
        '🥒 נודלס קישואים (Zoodles) עם שמן זית ופרמז\'ן',
        '🍚 פריכיות אורז עם טחינה או חמאת שקדים',
        '🥟 דפי אורז אפויים או ממולאים',
        '🍞 לחם מחמצת כוסמין 100% (בשלב 2)'
      ],
      cookingTips: ['להכין זודלס במכשיר ספירלייזר ולהקפיץ 2 דקות בלבד במחבת כדי שיישאר פריך'],
      medicalReferences: ['Monash Low FODMAP Diet', 'Dr. Jacobi Bi-Phasic Diet'],
      riskScore: 3,
      timestamp: Date.now(),
    };
  }

  // 6. Cheeses & Dairy (גבינות ומוצרי חלב)
  const isDairyGuideQuery =
    (norm.includes('גבינ') || norm.includes('חלב') || norm.includes('יוגורט') || norm.includes('קוטג') || norm.includes('פרמזן')) &&
    (norm.includes('איזה') || norm.includes('מותר') || norm.includes('אפשר') || norm.includes('לאכול') || norm.includes('רשימ') || norm.includes('אני רוצה'));

  if (isDairyGuideQuery) {
    return {
      status: 'GREEN',
      foodName: 'מדריך גבינות ומוצרי חלב ל-SIBO 🧀',
      englishName: 'SIBO Safe Cheeses & Dairy Guide',
      shortVerdict: 'אור ירוק לגבינות קשות מיושנות וחלב דל לקטוז / שקדים!',
      detailedExplanation: 'מדריך מוצרי חלב וגבינות בטוחות לניר:\n\n' +
        '🟢 גבינות ומוצרי חלב מותרים (אור ירוק - כמעט 0% לקטוז):\n' +
        '• גבינת פרמז\'ן מיושנת (Aged Parmesan) — תהליך היישון מפרק כמעט 100% מהלקטוז! (עד 40 גרם)\n' +
        '• גבינת פטה עיזים / כבשים איכותית — דלת לקטוז באופן טבעי (עד 30-40 גרם)\n' +
        '• גבינת צ\'דר מיושנת, מנצ\'גו, פקורינו או גאודה מיושנת (עד 40 גרם)\n' +
        '• חמאת גהי (Ghee / חמאה מזוקקת) — נקייה ממוצקי חלב ומלקטוז\n' +
        '• חלב דל לקטוז או 0% לקטוז (חלב תנובה דל לקטוז)\n' +
        '• חלב שקדים טהור ללא סוכר וללא תוספי גומי\n' +
        '• יוגורט קוקוס טבעי ללא סוכר מוסף\n' +
        '• קצפת צמחית / פרווה (כמו ריץ\' או השף הלבן פרווה)\n\n' +
        '🔴 מוצרי חלב אסורים (אור אדום - עתירי לקטוז מתסיס):\n' +
        '• חלב פרה רגיל (ניגר), לבן, רוויון, שוקו\n' +
        '• קוטג\' רגיל, גבינה לבנה 5%/9%, גבינת שמנת, ריקוטה, מסקרפונה\n' +
        '• גלידות שמנת חלביות, יוגורט פרה רגיל, קינוחי חלב מסחריים.',
      fodmapTriggers: ['לקטוז (Lactose) בחלב ניגר'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'גבינות קשות: עד 40 גרם / חלב דל לקטוז: עד 1 כוס',
      safeSubstitutions: [
        '🧀 פרמז\'ן מיושן מגורר מעל סלט או ביצים',
        '🥛 חלב דל לקטוז או חלב שקדים טהור',
        '🧈 חמאת גהי מזוקקת',
        '🥥 יוגורט קוקוס טבעי'
      ],
      cookingTips: ['להעדיף גבינות קשות עם כיתוב "מיושנת 12 חודשים ומעלה" המכילות אפס לקטוז'],
      medicalReferences: ['Dr. Siebecker SIBO Guide', 'Monash FODMAP Certified'],
      riskScore: 2,
      timestamp: Date.now(),
    };
  }

  // 7. Desserts, Sweets & Chocolate (מתוקים, קינוחים ושוקולד)
  const isDessertQuery =
    (norm.includes('קינוח') || norm.includes('מתוק') || norm.includes('שוקולד') || norm.includes('עוג') || norm.includes('גלידה') || norm.includes('קקאו')) &&
    (norm.includes('איזה') || norm.includes('מותר') || norm.includes('אפשר') || norm.includes('להכין') || norm.includes('לאכול') || norm.includes('אני רוצה'));

  if (isDessertQuery) {
    return {
      status: 'GREEN',
      foodName: 'קינוחים ומתוקים בטוחים ל-SIBO 🍫',
      englishName: 'SIBO Safe Treats & Desserts',
      shortVerdict: 'אור ירוק לקינוחים דלי פרוקטוז וללא סוכר מעובד!',
      detailedExplanation: 'קינוחים ומתוקים מותרים לניר:\n\n' +
        '🟢 מתוקים בטוחים ומפנקים:\n' +
        '• שוקו שקדים חם / קר: 1 כפית אבקת קקאו 100% טהור (עלית) + 1 כוס חלב שקדים ללא סוכר + 1 כפית סירופ מייפל טהור 100%.\n' +
        '• שוקולד מריר איכותי 85% מוצקי קקאו ומעלה (1-2 קוביות מדודות).\n' +
        '• תותים טריים חתוכים (עד 5-6 תותים) עם מעט מייפל טהור או קצפת צמחית.\n' +
        '• כוס אוכמניות כחולות טריות עם יוגורט קוקוס ללא סוכר.\n' +
        '• פנקייק SIBO ביתי: 1 ביצה + 2 כפות קמח שקדים + מעט קינמון ומייפל טהור.\n\n' +
        '🔴 מתוקים אסורים ב-SIBO:\n' +
        '• שוקולד חלב רגיל, שוקולד לבן, ממתקים, ופלים, עוגות ועוגיות מסחריות\n' +
        '• דבש, סילאן, אגבה, סירופ תירס עתיר פרוקטוז (HFCS)\n' +
        '• ממתיקים כוהליים: סורביטול, מניטול, קסיליטול, מלטיטול (מתסיסים את המעי הדק בעוצמה!).',
      fodmapTriggers: ['פרוקטוז חופשי', 'פוליאולים'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'מנת קינוח מדודה קטנה בסיום ארוחה',
      safeSubstitutions: [
        '🍫 שוקולד מריר 85%+ איכותי',
        '☕ שוקו קקאו טהור עם חלב שקדים ומייפל טהור',
        '🍓 תותים טריים עם קצפת צמחית',
        '🥞 פנקייק מקמח שקדים וביצים'
      ],
      cookingTips: ['ההמתקה היחידה המאושרת ב-SIBO היא סירופ מייפל טהור 100% (אינו מכיל פרוקטוז חופשי)'],
      medicalReferences: ['Dr. Siebecker SIBO Guide'],
      riskScore: 2,
      timestamp: Date.now(),
    };
  }

  // 8. Allowed Vegetables General Guide (e.g. "איזה ירקות מותר", "ירקות מותרים", "ירקות לסיבו", "רשימת ירקות")
  const isVegGuideQuery =
    (norm.includes('ירקות') || norm.includes('ירק')) &&
    (norm.includes('מותר') || norm.includes('מותרים') || norm.includes('אפשר') || norm.includes('רשימ') || norm.includes('איזה'));

  if (isVegGuideQuery) {
    return {
      status: 'GREEN',
      foodName: 'מדריך הירקות המותרים ל-SIBO 🥦',
      englishName: 'SIBO Safe Vegetables Clinical Guide',
      shortVerdict: 'אור ירוק! מגוון עשיר של ירקות דלי FODMAP מותרים ובטוחים לניר!',
      detailedExplanation: 'מדריך ירקות מלא ומאושר ל-SIBO:\n\n' +
        '🟢 ירקות ירוקים חופשיים (ללא הגבלה): מלפפון (קלוף/טרי), כל סוגי החסות, ארוגולה, עלי רוקט, תרד בייבי, עשבי תיבול (פטרוזיליה, שמיר, כוסברה, נענע, בזיליקום), עלי בצל ירוק (ירוק בלבד), נבטי אלפלפא.\n\n' +
        '🟡 ירקות צהובים מדודים (בכמות קטנה): קישוא/זוקיני מבושל (עד 1/2 כוס), גזר מבושל/טרי (עד 75 גרם), עגבנייה (עד 1/2 עגבנייה או 4 שרי), פלפל אדום/ירוק (עד 1/3 פלפל), חציל קלוי (עד 1/2 כוס), דלעת מבושלת (עד 1/2 כוס), צנונית (2-3 יח\').\n\n' +
        '🔴 ירקות אסורים בתכלית (אדום): שום, בצל, כרישה, שאלוט, כרובית, ברוקולי, כרוב ניצנים, פטריות מכל הסוגים, ארטישוק, אספרגוס, שומר טרי, קטניות.',
      fodmapTriggers: ['ירקות דלי FODMAP ללא תסיסה'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'לפי הפירוט: ירקות ירוקים חופשי, צהובים בכמות מדודה',
      safeSubstitutions: [
        '🥒 מלפפון טרי וחסה פריכה',
        '🥕 גזר מבושל היטב בשמן זית',
        '🍆 קישוא / חציל קלוי במחבת עם שמן זית ושמן שום',
        '🌿 עשבי תיבול טריים ועלי בצל ירוק'
      ],
      cookingTips: [
        'בישול, אידוי או אפייה של ירקות מרככים את הסיבים ומקלים מאוד על העיכול',
        'להשתמש בשמן זית מושרה שום (Garlic Oil) לקבלת ארומת שום ללא פרוקטנים'
      ],
      medicalReferences: [
        'Dr. Allison Siebecker - SIBO Specific Food Guide',
        'Monash University Low FODMAP Diet'
      ],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  // 3. Breakfast / Meal Ideas / Hunger SOS Questions (e.g. "מה אפשר לאכול", "מה לאכול לארוחת בוקר/ערב", "מה אפשר להכין לאכול", "מה לנשנש", "רעיונות לארוחה")
  const isMealIdeasQuery =
    norm.includes('מה אפשר לאכול') ||
    norm.includes('מה מותר לאכול') ||
    norm.includes('מה לאכול') ||
    norm.includes('מה אפשר להכין') ||
    norm.includes('מה להכין') ||
    norm.includes('מה אפשר לבשל') ||
    norm.includes('מה לבשל') ||
    norm.includes('להכין לאכול') ||
    norm.includes('ארוחת בוקר') ||
    norm.includes('ארוחת ערב') ||
    norm.includes('ארוחת צהריים') ||
    norm.includes('רעיונות לארוח') ||
    norm.includes('מתכונ') ||
    norm.includes('רעיונות לאוכל') ||
    norm.includes('אוכל לסיבו') ||
    norm.includes('נשנוש') ||
    norm.includes('לנשנש') ||
    norm.includes('חטיף') ||
    norm.includes('רעבה') ||
    norm.includes('רעב');

  if (isMealIdeasQuery) {
    return {
      status: 'GREEN',
      foodName: 'תפריט והמלצות לארוחות בריאות ל-SIBO 🍽️',
      englishName: 'SIBO Safe Meal Ideas & Nutrition Guide',
      shortVerdict: 'אור ירוק! שפע ארוחות טעימות, משביעות וקלות לעיכול לניר!',
      detailedExplanation: 'רעיונות לארוחות מושלמות ובטוחות ל-SIBO:\n\n' +
        '🍳 ארוחת בוקר מהירה: חביתת 2 ביצים עם עשבי תיבול בשמן זית + מלפפון וגבינת פרמז\'ן/פטה, או 2 ביצים קשות עם שמן זית ומלח, או יוגורט קוקוס ללא סוכר עם 4-5 תותים ואגוזי מלך מדודים.\n\n' +
        '🍗 ארוחת צהריים משביעה: חזה עוף צלוי בשמן זית ופפריקה + קישואים מוקפצים בשמן שום + 1/2 כוס אורז בסמטי לבן (בשלב 1), או פילה סלמון בתנור עם לימון ועשבי תיבול + גזר אפוי וסלט חסה.\n\n' +
        '🥗 ארוחת ערב קלה: קערת סלט עשיר (חסה, ארוגולה, מלפפון, טונה בשמן זית, ביצה קשה ולימון), או מרק עוף צח (ללא בצל/שום) עם חלקי עוף, גזר וקישוא.\n\n' +
        '🍓 נשנוש בטוח בין ארוחות (במרווח 3.5 שעות): פריכיות אורז עם כף חמאת שקדים טהורה, או כוס תותים/אוכמניות, או חופן אגוזי מלך (עד 30 גרם).',
      fodmapTriggers: ['ארוחות דלות FODMAP ומאוזנות'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'ארוחה רגילה ומשביעה (להקפיד על שובע נעים ללא עומס)',
      safeSubstitutions: [
        '🍳 חביתת ירק עשירה בשמן זית + מלפפון',
        '🍗 חזה עוף צלוי עם גזר ואורז בסמטי מדוד',
        '🐟 פילה סלמון עסיסי עם סלט ירוק',
        '🥗 סלט טונה וביצה קשה עם שמן זית ולימון'
      ],
      cookingTips: [
        'לשמור על מרווח של 3.5-4 שעות בין ארוחה לארוחה כדי לאפשר למנגנון הניקוי של המעי (MMC) לפעול',
        'להקפיד על שתיית מים או תה ג\'ינג\'ר טרי בין הארוחות'
      ],
      medicalReferences: [
        'Dr. Allison Siebecker - SIBO Specific Food Guide',
        'Dr. Nirala Jacobi - Bi-Phasic SIBO Meal Protocols'
      ],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  // 4. Fruit Guide (e.g. "איזה פירות מותר", "פירות מותרים")
  const isFruitGuideQuery =
    (norm.includes('פירות') || norm.includes('פרי')) &&
    (norm.includes('מותר') || norm.includes('מותרים') || norm.includes('אפשר') || norm.includes('רשימ') || norm.includes('איזה'));

  if (isFruitGuideQuery) {
    return {
      status: 'GREEN',
      foodName: 'מדריך הפירות המותרים ל-SIBO 🍓',
      englishName: 'SIBO Safe Fruits Clinical Guide',
      shortVerdict: 'אור ירוק! פירות נבחרים דלי פרוקטוז וסורביטול מותרים בכמות מדודה!',
      detailedExplanation: 'פירות מותרים ובטוחים (אור ירוק): תות שדה טרי (עד 5-6 יח\'), אוכמניות כחולות טריות (עד 1/4 כוס), קיווי טרי (1 יח\' - מסייע גם לפריסטלטיקה ועיכול!), פטל טרי (עד 1/3 כוס), תפוז או קלמנטינה שלמה (1 יח\'), מלון קנטלופ (עד 1/2 כוס), בננה ירוקה/בוסר (1 יח\').\n\n' +
        'פירות אסורים (אור אדום): תפוח, אגס, מנגו, ענבים, אבטיח, דובדבנים, שזיף, אפרסק, פירות יבשים, בננה צהובה בשלה מאוד.',
      fodmapTriggers: ['פירות דלי פרוקטוז'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: 'מנת פרי אחת בכל פעם (עד 1 כוס פירות יער או 1 פרי בינוני)',
      safeSubstitutions: [
        '🍓 תותים טריים',
        '🫐 אוכמניות כחולות',
        '🥝 קיווי טרי',
        '🍊 תפוז / קלמנטינה טרייה'
      ],
      cookingTips: ['לאכול פרי יחד עם ארוחה או כחלק מקינוח מדוד ולא לאכול כמויות גדולות בבת אחת'],
      medicalReferences: ['Monash University Low FODMAP Diet', 'Dr. Allison Siebecker SIBO Guide'],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  // 5. Drinks Guide (e.g. "מה מותר לשתות", "שתייה מותרת", "משקאות לסיבו")
  const isDrinkGuideQuery =
    norm.includes('לשתות') ||
    norm.includes('שתייה') ||
    norm.includes('משקאות') ||
    norm.includes('מה לשתות');

  if (isDrinkGuideQuery) {
    return {
      status: 'GREEN',
      foodName: 'מדריך השתייה והמשקאות ל-SIBO 🫖',
      englishName: 'SIBO Safe Beverages Clinical Guide',
      shortVerdict: 'אור ירוק! משקאות מרגיעים ומאיצי תנועתיות מותרים ובטוחים לניר!',
      detailedExplanation: 'משקאות מומלצים ובטוחים (אור ירוק): מים צוננים עם פלח לימון סחוט או עלי נענע, חליטת שורש ג\'ינג\'ר טרי פרוס במים רותחים (מאיץ MMC מעולה!), תה ירוק/שחור ללא סוכר, חליטת נענע/קמומיל, קפה שחור/אספרסו ללא חלב פרה, קפה עם חלב שקדים טהור ללא סוכר, סודה טבעית.\n\n' +
        'משקאות אסורים (אור אדום): משקאות מוגזים ממותקים, מיצי פירות סחוטים מסחריים (מיץ תפוחים/ענבים), משקאות דיאט עם ממתיקים כוהליים, בירה רגילה/שחורה, חלב פרה רגיל.',
      fodmapTriggers: ['משקאות דלי FODMAP'],
      phase1Compatibility: true,
      phase2Compatibility: true,
      maxSafePortion: '2-3 ליטר מים וחליטות ביום',
      safeSubstitutions: [
        '🫚 חליטת ג\'ינג\'ר טרי חמה',
        '🍵 תה ירוק עם נענע ולימון',
        '☕ קפה שחור או עם חלב שקדים טהור',
        '🍋 סודה צוננת עם לימון'
      ],
      cookingTips: ['לשתות חליטת ג\'ינג\'ר טרי כחצי שעה לפני הארוחה או שעתיים לאחריה לשיפור ריקון המעי'],
      medicalReferences: ['Dr. Siebecker SIBO Guide', 'Monash University Low FODMAP Diet'],
      riskScore: 1,
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * Find clinical SIBO analysis for any given query or food item
 */
export function analyzeFoodClinically(query: string, phase: SiboPhase = 'phase1_strict'): FoodAnalysisResult {
  const isPhase1 = phase === 'phase1_strict';

  // 0. Check for conversational queries, questions, salad & meal recommendations
  const advisoryResult = detectConversationalAdvisoryQuery(query, phase);
  if (advisoryResult) {
    return advisoryResult;
  }

  // Clean raw prompt string if coming from barcode
  let cleanName = query.trim();
  if (cleanName.includes('שם המוצר:')) {
    const match = cleanName.match(/שם המוצר:\s*([^:\n\r()]+)/);
    if (match && match[1].trim()) {
      cleanName = match[1].trim();
    }
  }

  // Check if ingredients list is provided (from barcode or label photo OCR)
  const ingredientsMatch = query.match(/(?:רכיבים:|ingredients:)\s*([^\n\r]+)/i);
  if (ingredientsMatch && ingredientsMatch[1].trim().length > 3 && !ingredientsMatch[1].includes('ללא פירוט רכיבים')) {
    return analyzeIngredientsList(ingredientsMatch[1].trim(), cleanName, phase);
  }

  // 1. Direct search in SIBO_FOOD_DATABASE with Hebrew fuzzy normalization
  const dbMatch = SIBO_FOOD_DATABASE.find((item) => {
    return (
      fuzzyHebrewMatch(item.nameHe, cleanName) ||
      fuzzyHebrewMatch(item.nameEn, cleanName) ||
      fuzzyHebrewMatch(item.nameHe, query) ||
      fuzzyHebrewMatch(item.nameEn, query)
    );
  });

  if (dbMatch) {
    const status = isPhase1 ? dbMatch.statusPhase1 : dbMatch.statusPhase2;
    const isGreen = status === 'GREEN';
    const isYellow = status === 'YELLOW';

    // Get smart contextual substitutions tailored to this exact food category
    const smartSubs =
      dbMatch.alternativesHe && dbMatch.alternativesHe.length > 0
        ? dbMatch.alternativesHe
        : getSmartCategoricalSubstitutions(dbMatch.nameHe);

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
      safeSubstitutions: smartSubs,
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

  // 2. Keyword & semantic matching in CLINICAL_SIBO_RULES (Precision-ranked)
  // Check exact token coverage: if a rule has specific modifiers (e.g. 'שמנת בצל'), 
  // the query MUST contain those modifiers!
  const normQuery = normalizeHebrew(query);
  const normClean = normalizeHebrew(cleanName);

  for (const rule of CLINICAL_SIBO_RULES) {
    const matchedKeyword = rule.keywords.find((kw) => {
      const normKw = normalizeHebrew(kw);
      if (!normKw) return false;

      // 1. Exact match
      if (normKw === normQuery || normKw === normClean) return true;

      // 2. Query contains the entire keyword (e.g. user typed "איפה יש תפוצ'יפס שמנת בצל" -> matches "תפוצ'יפס שמנת בצל")
      if (normQuery.includes(normKw) || normClean.includes(normKw)) return true;

      // 3. If keyword is multi-word, ALL keyword words must exist in query
      const kwTokens = normKw.split(' ').filter(t => t.length > 0);
      if (kwTokens.length > 1) {
        const allKwInQuery = kwTokens.every(t => normQuery.includes(t) || normClean.includes(t));
        if (allKwInQuery) return true;
      }

      // 4. If keyword is single word (e.g. "קוואקר"), query must contain that token
      if (kwTokens.length === 1 && (normQuery.includes(kwTokens[0]) || normClean.includes(kwTokens[0]))) {
        return true;
      }

      return false;
    });
    if (matchedKeyword) {
      const status = isPhase1 ? rule.statusPhase1 : rule.statusPhase2;
      return {
        status,
        foodName: cleanName.length > 0 && cleanName !== rule.foodNameHe ? `${cleanName} (${rule.foodNameHe})` : rule.foodNameHe,
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

  // 3. Fallback for Unknown / Generic Queries (Friendly Guidance for Nir)
  const smartSubs = getSmartCategoricalSubstitutions(cleanName);
  const isGeneric =
    !cleanName ||
    cleanName.includes('מאכל שצולם') ||
    cleanName.includes('מאכל') ||
    cleanName.includes('מוצר ארוז') ||
    cleanName.includes('לא מזוהה') ||
    cleanName.includes('ברקוד') ||
    cleanName.includes('יצרן ישראלי') ||
    cleanName.startsWith('מוצר ');
  const isDrink = /תה|משקה|מיץ|קולה|סודה|ספרייט|פאנטה|משקאות|drink|tea|beverage|fuzetea|fuze/i.test(cleanName + query);

  return {
    status: 'RED',
    foodName: isGeneric ? (isDrink ? 'משקה לא מזוהה' : 'מוצר לא מזוהה') : cleanName,
    englishName: isDrink ? 'Unidentified Beverage' : 'Unidentified Food Item',
    shortVerdict: 'מוצר לא מזוהה, אם מדובר במוצר ארוז, סרקי שוב את הברקוד או את רשימת הרכיבים, אם מדובר במשהו שהכנת לבד או הוכן במסעדה, אנא הקלידי במה מדובר.',
    detailedExplanation: 'מוצר לא מזוהה, אם מדובר במוצר ארוז, סרקי שוב את הברקוד או את רשימת הרכיבים, אם מדובר במשהו שהכנת לבד או הוכן במסעדה, אנא הקלידי במה מדובר.',
    fodmapTriggers: ['נדרש פירוט רכיבים / תיאור מנה לזיהוי קליני מדויק'],
    phase1Compatibility: false,
    phase2Compatibility: false,
    maxSafePortion: 'נא לסרוק ברקוד/רכיבים או להקליד את שם המנה',
    safeSubstitutions: smartSubs,
    cookingTips: [
      'אם מדובר במוצר ארוז: סרקי שוב את הברקוד או צלמי את רשימת הרכיבים בגב האריזה',
      'אם מדובר במנה ביתית או במסעדה: הקלידי את המרכיבים המרכזיים בחיפוש המהיר'
    ],
    medicalReferences: [
      'Dr. Allison Siebecker - SIBO Food Guide',
      'Monash University FODMAP Certification Standards'
    ],
    isPackagedProduct: true,
    riskScore: 3,
    timestamp: Date.now(),
  };
}
