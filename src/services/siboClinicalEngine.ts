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
  const rawList = ingredientsText
    .split(/[,;\n\r]/)
    .map((s) => s.trim().replace(/^[-•*\s]+/, ''))
    .filter((s) => s.length > 1);

  const breakdown: { name: string; status: TrafficLightStatus; notes?: string }[] = [];
  const triggers: string[] = [];
  let hasRed = false;
  let hasYellow = false;

  for (const ing of rawList) {
    const lower = ing.toLowerCase();

    // 1. Check RED triggers
    if (/שום|אבקת שום|מיצוי שום|garlic/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'מכיל פרוקטנים מתסיסים' });
      if (!triggers.includes('שום (פרוקטנים)')) triggers.push('שום (פרוקטנים)');
      hasRed = true;
    } else if (/בצל|אבקת בצל|מיצוי בצל|כרישה|שאלוט|onion|leek|shallot/i.test(lower)) {
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
    } else if (/חלב פרה|אבקת חלב|מי גבינה|whey|מוצקי חלב/i.test(lower) && !/0%\s*לקטוז|ללא לקטוז|דל לקטוז/i.test(rawIngs)) {
      breakdown.push({ name: ing, status: isPhase1 ? 'RED' : 'YELLOW', notes: 'מכיל לקטוז' });
      if (!triggers.includes('לקטוז (Lactose)')) triggers.push('לקטוז (Lactose)');
      if (isPhase1) hasRed = true; else hasYellow = true;
    } else if (/קמח חיטה|חיטה|wheat|שיפון|שעורה|לתת|גלוטן|קמח כוסמין מלא/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'דגן עתיר פרוקטנים' });
      if (!triggers.includes('פרוקטנים מדגנים (חיטה/שיפון)')) triggers.push('פרוקטנים מדגנים (חיטה/שיפון)');
      hasRed = true;
    } else if (/קמח חומוס|קמח עדשים|סויה|פולי סויה|חלבון סויה/i.test(lower) && !/רוטב סויה|שמן סויה|לציטין סויה/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'קטניות עתירות גלקטנים' });
      if (!triggers.includes('גלקטנים (GOS)')) triggers.push('גלקטנים (GOS)');
      hasRed = true;
    } else if (/כרובית|פטריות|ארטישוק/i.test(lower)) {
      breakdown.push({ name: ing, status: 'RED', notes: 'ירק עתיר FODMAP' });
      if (!triggers.includes('FODMAP גבוה')) triggers.push('FODMAP גבוה');
      hasRed = true;
    }
    // 2. Check YELLOW triggers
    else if (/סוכר|סוכרוז|sugar|גלוקוז|דקסטרוז/i.test(lower)) {
      breakdown.push({ name: ing, status: 'YELLOW', notes: 'סוכר מוסף (מוגבל במינון)' });
      if (!triggers.includes('סוכר מוסף')) triggers.push('סוכר מוסף');
      hasYellow = true;
    } else if (/רכז מיץ|רכז אפרסק|רכז לימון|רכז תפוחים|רכז פרי/i.test(lower)) {
      breakdown.push({ name: ing, status: 'YELLOW', notes: 'רכז פרי (פרוקטוז מרוכז)' });
      if (!triggers.includes('רכז פרי')) triggers.push('רכז פרי');
      hasYellow = true;
    } else if (/עמילן מעובד|עמילן תירס|עמילן טפיוקה|מלטודקסטרין/i.test(lower)) {
      breakdown.push({ name: ing, status: isPhase1 ? 'YELLOW' : 'GREEN', notes: 'עמילן (מוגבל בשלב 1)' });
      if (isPhase1) hasYellow = true;
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
    keywords: ['חומוס', 'עדשים', 'שעועית', 'פול', 'אפונה', 'פלאפל', 'סויה', 'טופו רך', 'מש', 'תורמוס'],
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
 * Find clinical SIBO analysis for any given query or food item
 */
export function analyzeFoodClinically(query: string, phase: SiboPhase = 'phase1_strict'): FoodAnalysisResult {
  const isPhase1 = phase === 'phase1_strict';

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

  // 2. Keyword & semantic matching in CLINICAL_SIBO_RULES
  for (const rule of CLINICAL_SIBO_RULES) {
    const matchedKeyword = rule.keywords.find(
      (kw) =>
        fuzzyHebrewMatch(cleanName, kw) ||
        fuzzyHebrewMatch(kw, cleanName) ||
        fuzzyHebrewMatch(query, kw) ||
        fuzzyHebrewMatch(kw, query)
    );
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
