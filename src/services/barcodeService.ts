/**
 * Barcode & Food Data Integration Service (Open Food Facts & SIBO Matcher)
 */

import { ISRAELI_SUPERMARKET_CATALOG } from '../data/israeliSupermarketDatabase';
import { BarcodeProductInfo } from '../types';
export type { BarcodeProductInfo };

/**
 * GS1 Israel Manufacturer Prefixes for instant recognition of unindexed Israeli barcodes
 */
export const ISRAELI_MANUFACTURER_PREFIXES: Record<string, { brand: string; defaultCategory: string }> = {
  '72900084': { brand: 'הרדוף אורגני (Harduf Organic) / תנובה', defaultCategory: 'קוואקר, שיבולת שועל, דגנים ומזון אורגני' },
  '72900054': { brand: 'תבואות (Tevuot)', defaultCategory: 'קוואקר, דגנים וקטניות אורגניות' },
  '72900192': { brand: 'שופרסל גרין (Shufersal Green)', defaultCategory: 'מזון אורגני ובריאות ללא גלוטן' },
  '72900045': { brand: 'מיה תעשיות מזון (Maya)', defaultCategory: 'קטניות, שיבולת שועל, אורז ותבלינים' },
  '72900142': { brand: 'בר-אל (Bar-El Gluten Free)', defaultCategory: 'מוצרים מוסמכים ללא גלוטן ולצליאק' },
  '72900115': { brand: 'גרין לייט (Green Lite Gluten Free)', defaultCategory: 'מאפים, לחמים וקוואקר ללא גלוטן' },
  '72900086': { brand: 'שקד תבור (Shaked Tavor)', defaultCategory: 'אגוזים, פירות יבשים וממרחים' },
  '72900067': { brand: 'שקדיה (Shkedia)', defaultCategory: 'ממרחים, טחינה ושקדים' },
  '72900128': { brand: 'נטורפוד (Nature Food)', defaultCategory: 'מזון בריאות וללא גלוטן' },
  '72900108': { brand: 'מאסטר שף (Master Chef)', defaultCategory: 'רטבים, אטריות אורז ומוצרי מזון' },
  '72900111': { brand: 'סנפרוסט (Sunfrost)', defaultCategory: 'ירקות ופירות קפואים' },
  '72900112': { brand: 'מעדנות (Maadanot)', defaultCategory: 'בצקים ומאפים קפואים' },
  '72900113': { brand: 'מאמא עוף (Mama Of)', defaultCategory: 'מוצרי עוף והודו' },
  '72900114': { brand: 'טירת צבי (Tirat Zvi)', defaultCategory: 'מוצרי בשר ופסטרמה' },
  '72900116': { brand: 'זוגלובק (Zoglowek)', defaultCategory: 'מוצרי בשר, נקניקים ותחליפים' },
  '72900117': { brand: 'עוף טוב (Of Tov)', defaultCategory: 'מוצרי עוף והודו' },
  '72900118': { brand: 'עץ הזית (Etz Hazayit)', defaultCategory: 'שמני מאכל וטונה' },
  '72900119': { brand: 'שמן תעשיות (Shemen)', defaultCategory: 'שמני מאכל ושמן זית' },
  '72900120': { brand: 'סוגת (Sugat)', defaultCategory: 'אורז, קוואקר וקטניות' },
  '72900121': { brand: 'יד מרדכי (Yad Mordechai)', defaultCategory: 'שמן זית, דבש ורטבים' },
  '72900122': { brand: 'אחוה (Achva)', defaultCategory: 'טחינה, חלבה ומאפים' },
  '72900123': { brand: 'כרמית (Carmit)', defaultCategory: 'ממתקים, שוקולד וסוכריות' },
  '72900124': { brand: 'ויליפוד (Willy Food)', defaultCategory: 'שימורים, שמנים ומוצרי יבוא' },
  '72900125': { brand: 'דיפלומט (Diplomat)', defaultCategory: 'מותגים בינלאומיים מיובאים' },
  '72900126': { brand: 'שסטוביץ (Schestowitz)', defaultCategory: 'פסטה ברילה ומותגי מזון' },
  '72900127': { brand: 'ליימן שליסל (Leiman Schlussel)', defaultCategory: 'ממתקים וחטיפים' },
  '72900000': { brand: 'תנובה (Tnuva)', defaultCategory: 'מוצרי חלב / מזון ישראלי' },
  '729000018': { brand: 'טמפו משקאות (גולדסטאר / מכבי / היינקן)', defaultCategory: 'בירה ומשקאות אלכוהוליים' },
  '729000027': { brand: 'מבשלות בירה ישראל / IBBL (קרלסברג / טובורג)', defaultCategory: 'בירה ומשקאות אלכוהוליים' },
  '72900018': { brand: 'טמפו משקאות (Tempo)', defaultCategory: 'בירה ומשקאות' },
  '72900027': { brand: 'מבשלות בירה ישראל (IBBL)', defaultCategory: 'בירה ומשקאות' },
  '72900001': { brand: 'טרה / משק צוריאל (Tara)', defaultCategory: 'מוצרי חלב / גבינות' },
  '72900002': { brand: 'אסם (Osem)', defaultCategory: 'חטיפים / מאפים / פסטות' },
  '72900003': { brand: 'ויסוצקי (Wissotzky)', defaultCategory: 'תה / חליטות צמחים' },
  '729000049': { brand: 'פרי מור (Pri Mor / גניר)', defaultCategory: 'מיצים סחוטים ומשקאות פרי' },
  '72900004': { brand: 'שטראוס עלית (Strauss Elite)', defaultCategory: 'מוצרי חלב / שוקולד / חטיפים' },
  '729001309': { brand: 'פרי ניב (Pri Niv)', defaultCategory: 'מיצים ומשקאות סחוטים' },
  '72900130': { brand: 'פרי ניב (Pri Niv)', defaultCategory: 'מיצים ומשקאות' },
  '729000009': { brand: 'ריץ׳ (Rich\'s) / קצפת צמחית פרווה', defaultCategory: 'קצפות ותחליפי חלב' },
  '72900005': { brand: 'תלמה / יוניליוור (Telma / Unilever)', defaultCategory: 'דגני בוקר / ממרחים' },
  '72900006': { brand: 'יפאורה תבורי (Jafora - Spring / RC)', defaultCategory: 'משקאות קלים / מיצים' },
  '72900007': { brand: 'סוגת (Sugat)', defaultCategory: 'אורז / קטניות / סוכר' },
  '72900008': { brand: 'מאפיות אנג׳ל (Angel Bakery)', defaultCategory: 'לחמים ומאפים' },
  '72900009': { brand: 'מאפיות ברמן (Berman Bakery)', defaultCategory: 'לחמים ומאפים' },
  '72901104': { brand: 'החברה המרכזית למשקאות / פיוז תה / קוקה קולה', defaultCategory: 'תה קר / משקאות קלים' },
  '72901101': { brand: 'החברה המרכזית למשקאות / פיוז תה / קוקה קולה', defaultCategory: 'תה קר / משקאות קלים' },
  '72901102': { brand: 'החברה המרכזית למשקאות / קוקה קולה', defaultCategory: 'משקאות קלים' },
  '72901193': { brand: 'עלית / שטראוס קפה וממתקים', defaultCategory: 'קפה שחור וטורקי / ממתקים' },
  '7290119': { brand: 'עלית / שטראוס קפה וממתקים', defaultCategory: 'קפה שחור וטורקי / ממתקים' },
  '7290118': { brand: 'עלית / שטראוס', defaultCategory: 'מוצרי מזון ומשקאות' },
  '72901103': { brand: 'פריגת (Prigat)', defaultCategory: 'מיצים ומשקאות פרי' },
  '72900110': { brand: 'פריגת (Prigat)', defaultCategory: 'מיצים ומשקאות פרי' },
  '72900013': { brand: 'טבעול (Tivall)', defaultCategory: 'תחליפי בשר / קפואים' },
  '72900021': { brand: 'אחוה (Achva)', defaultCategory: 'טחינה / חלבה' },
  '72900030': { brand: 'מחלבות גד (Gad Dairy)', defaultCategory: 'גבינות מיוחדות ואיטלקיות' },
  '72900041': { brand: 'כרמית (Carmit)', defaultCategory: 'ממתקים / שוקולד ללא גלוטן' },
  '72900052': { brand: 'עץ הזית (Etz Hazayit)', defaultCategory: 'שמני מאכל / שמן זית' },
  '72900063': { brand: 'יד מרדכי (Yad Mordechai)', defaultCategory: 'דבש / שמן זית / רטבים' },
  '72900074': { brand: 'זוגלובק (Zoglowek)', defaultCategory: 'בשר / נקניקים' },
  '72900085': { brand: 'טירת צבי (Tirat Zvi)', defaultCategory: 'מוצרי בשר ופסטרמה' },
  '72900096': { brand: 'עוף טוב (Of Tov)', defaultCategory: 'מוצרי עוף והודו' },
  '72900132': { brand: 'שופרסל (Shufersal Private Label)', defaultCategory: 'מותג פרטי שופרסל' },
  '72900143': { brand: 'רמי לוי (Rami Levy Private Label)', defaultCategory: 'מותג פרטי רמי לוי' },
};

/**
 * Rich offline dictionary of popular Israeli supermarket barcodes
 */
export const COMMON_ISRAELI_BARCODES: Record<string, Partial<BarcodeProductInfo>> = {
  ...ISRAELI_SUPERMARKET_CATALOG,
  // Fuze Tea & Iced Teas (1.5L, 500ml, cans, barcodes & optical scan variants)
  '7293110003693': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '7190110106693': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '6294114103823': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '230416103693': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '0230416103693': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '233116101693': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '0233116101693': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110405663': {
    productName: 'תה קר בטעם אפרסק 1.5 ליטר (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110405618': {
    productName: 'תה קר בטעם מנגו-אננס 1.5 ליטר (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea',
    ingredientsText: 'מים, סוכר, פרוקטוז, תמצית תה שחור, רכז מיץ מנגו ואננס',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110405601': {
    productName: 'תה קר בטעם לימון 1.5 ליטר (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea',
    ingredientsText: 'מים, סוכר, פרוקטוז, תמצית תה שחור, רכז מיץ לימון',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110405632': {
    productName: 'תה קר ZERO ללא סוכר בטעם אפרסק 1.5 ליטר (Fuze Tea Zero)',
    brand: 'Fuze Tea',
    ingredientsText: 'מים, תמצית תה שחור, מווסתי חומציות, ממתיקים (אספרטיים, אססולפאם K, סוכרלוז)',
    categories: 'תה קר ללא סוכר / משקאות דיאט',
  },
  '7290110405649': {
    productName: 'תה קר בטעם אפרסק פחית 330 מ״ל (Fuze Tea)',
    brand: 'Fuze Tea',
    ingredientsText: 'מים, סוכר, פרוקטוז, תמצית תה שחור, רכז מיץ אפרסק',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110115623': {
    productName: 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea / החברה המרכזית למשקאות',
    ingredientsText: 'מים, סוכר, פרוקטוז, מווסתי חומציות (חומצת לימון, נתרן ציטרט), תמצית תה שחור (0.1%), רכז מיץ אפרסק (0.1%), חומרי טעם וריח טבעיים, מעכב חמצון (חומצה אסקורבית)',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110115616': {
    productName: 'תה קר בטעם מנגו-אננס (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea',
    ingredientsText: 'מים, סוכר, פרוקטוז, תמצית תה שחור, רכז מיץ מנגו ואננס',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110115609': {
    productName: 'תה קר בטעם לימון (Fuze Tea פיוז תה)',
    brand: 'Fuze Tea',
    ingredientsText: 'מים, סוכר, פרוקטוז, תמצית תה שחור, רכז מיץ לימון',
    categories: 'תה קר / משקאות קלים',
  },
  '7290110115630': {
    productName: 'תה קר ZERO ללא סוכר בטעם אפרסק (Fuze Tea Zero)',
    brand: 'Fuze Tea',
    ingredientsText: 'מים, תמצית תה שחור, מווסתי חומציות, ממתיקים (אספרטיים, אססולפאם K, סוכרלוז)',
    categories: 'תה קר ללא סוכר / משקאות דיאט',
  },
  '7290000155050': {
    productName: 'תה קר נסטי אפרסק (Nestea)',
    brand: 'Nestea / אסם',
    ingredientsText: 'מים, סוכר, פרוקטוז, תמצית תה, חומצת לימון',
    categories: 'תה קר',
  },

  // Dairy & Lactose Free
  '7290000045053': {
    productName: 'חלב יטבתה דל לקטוז (0% לקטוז)',
    brand: 'יטבתה',
    ingredientsText: 'חלב פרה מפוסטר דל לקטוז, אנזים לקטאז, ויטמין D',
    categories: 'מוצרי חלב ללא לקטוז',
  },
  '7290000045060': {
    productName: 'חלב תנובה דל לקטוז (0% לקטוז)',
    brand: 'תנובה',
    ingredientsText: 'חלב בקר מפוסטר דל לקטוז, לקטאז',
    categories: 'מוצרי חלב ללא לקטוז',
  },
  '7290000045077': {
    productName: 'גבינת קוטג׳ תנובה 5% (רגיל)',
    brand: 'תנובה',
    ingredientsText: 'חלב מפוסטר, שמנת, מלח, חומרי טעם',
    allergens: 'מכיל לקטוז וחלב',
    categories: 'גבינות רכות',
  },
  '7290000045084': {
    productName: 'גבינת קוטג׳ שטראוס ללא לקטוז (0% לקטוז)',
    brand: 'שטראוס',
    ingredientsText: 'חלב מפוסטר ללא לקטוז, שמנת, אנזים לקטאז, מלח',
    categories: 'מוצרי חלב ללא לקטוז',
  },
  '7290000045091': {
    productName: 'גבינה צהובה עמק 28%',
    brand: 'תנובה',
    ingredientsText: 'חלב בקר מפוסטר, מלח, אנזים, חומר משמר',
    categories: 'גבינות קשות',
  },
  '7290000045107': {
    productName: 'גבינת פרמזן גד מגוררת',
    brand: 'מחלבות גד',
    ingredientsText: 'חלב בקר מפוסטר, מלח, אנזים (0% לקטוז)',
    categories: 'גבינות קשות מיושנות',
  },
  '7290000045114': {
    productName: 'יוגורט דנונה ביו 3% לבן טבעי',
    brand: 'שטראוס דנונה',
    ingredientsText: 'חלב מפוסטר, חיידקי יוגורט (ביו)',
    categories: 'יוגורטים',
  },
  '7290000045121': {
    productName: 'יוגורט GO עשיר בחלבון ללא לקטוז',
    brand: 'תנובה GO',
    ingredientsText: 'חלב מפוסטר דל לקטוז, חלבוני חלב, אנזים לקטאז',
    categories: 'יוגורטים עתירי חלבון',
  },
  '7290000045138': {
    productName: 'גבינת מוצרלה גד בייבי',
    brand: 'מחלבות גד',
    ingredientsText: 'חלב בקר מפוסטר, מלח, אנזים',
    categories: 'גבינות חצי קשות',
  },
  '7290000045145': {
    productName: 'גבינת פטה עיזים גד 16%',
    brand: 'מחלבות גד',
    ingredientsText: 'חלב עיזים מפוסטר, מלח, אנזים',
    categories: 'גבינות עיזים',
  },
  '7290000045152': {
    productName: 'גבינה לבנה תנובה 5%',
    brand: 'תנובה',
    ingredientsText: 'חלב מפוסטר, שמנת, מלח',
    allergens: 'מכיל לקטוז',
    categories: 'גבינות רכות',
  },

  // Plant Based Milks
  '7290000045206': {
    productName: 'משקה שקדים אורגני ללא סוכר (תנובה Alternative)',
    brand: 'תנובה Alternative',
    ingredientsText: 'מים, שקדים (2.5%), מלח ים, מייצבים',
    categories: 'תחליפי חלב',
  },
  '7290000045213': {
    productName: 'משקה סויה תנובה ללא סוכר',
    brand: 'תנובה Alternative',
    ingredientsText: 'פולי סויה, מים, ויטמינים',
    categories: 'תחליפי חלב',
  },
  '7290000045220': {
    productName: 'משקה שיבולת שועל תנובה Alternative',
    brand: 'תנובה Alternative',
    ingredientsText: 'מים, שיבולת שועל, שמן חמניות, מלח',
    categories: 'תחליפי חלב',
  },

  // Tuna & Canned Foods
  '7290000050019': {
    productName: 'טונה סטארקיסט בשמן זית כתית מעולה',
    brand: 'סטארקיסט Starkist',
    ingredientsText: 'נתחי טונה בהירה, שמן זית כתית מעולה, מלח',
    categories: 'שימורי דגים',
  },
  '7290000050026': {
    productName: 'טונה סטארקיסט במים',
    brand: 'סטארקיסט Starkist',
    ingredientsText: 'נתחי טונה בהירה, מים, מלח',
    categories: 'שימורי דגים',
  },
  '7290000050033': {
    productName: 'טונה פילטונה בשמן קנולה',
    brand: 'פילטונה',
    ingredientsText: 'טונה בהירה, שמן קנולה, מלח',
    categories: 'שימורי דגים',
  },
  '7290000050040': {
    productName: 'רסק עגבניות 28-30 BRIX פרי ניר / יכין',
    brand: 'יכין / פרי ניר',
    ingredientsText: '100% עגבניות',
    categories: 'רסקים ושימורים',
  },
  '7290000050057': {
    productName: 'זיתים ירוקים מנזנילו ללא חרצנים (בית השיטה)',
    brand: 'בית השיטה',
    ingredientsText: 'זיתים ירוקים, מים, מלח, חומצת לימון',
    categories: 'חמוצים ושימורים',
  },

  // Snacks, Grains & Rice
  '7290000060018': {
    productName: 'במבה אסם קלאסית (בוטנים)',
    brand: 'אסם',
    ingredientsText: 'בוטנים (49%), גריסי תירס, שמן חמניות, מלח',
    categories: 'חטיפים מלוחים',
  },
  '7290000060025': {
    productName: 'בסלי גריל אסם',
    brand: 'אסם',
    ingredientsText: 'קמח חיטה (מכיל גלוטן), שמן צמחי, תבלינים, אבקת בצל, אבקת שום',
    allergens: 'גלוטן, שום, בצל',
    categories: 'חטיפים מלוחים',
  },
  '7290000060032': {
    productName: 'תפוצ׳יפס קלאסי מלח (עלית)',
    brand: 'עלית',
    ingredientsText: 'תפוחי אדמה, שמנים צמחיים, מלח',
    categories: 'חטיפים מלוחים',
  },
  '7290000060049': {
    productName: 'פריכיות אורז חום מלא (אנרג׳י / מאסטר שף)',
    brand: 'אנרג׳י Energy',
    ingredientsText: '100% אורז מלא, מלח ים',
    categories: 'קרקרים ופריכיות',
  },
  '7290000060056': {
    productName: 'שוקולד מריר 85% פרימיום (עלית / לינדט)',
    brand: 'עלית Splendid',
    ingredientsText: 'עיסת קקאו, סוכר, חמאת קקאו, אבקת קקאו',
    categories: 'ממתקים ושוקולד',
  },
  '7290000060063': {
    productName: 'אורז בסמטי קלאסי סוגת 1 ק״ג',
    brand: 'סוגת',
    ingredientsText: '100% אורז בסמטי לבן מובחר',
    categories: 'אורז ודגנים',
  },
  '7290000060070': {
    productName: 'אורז יסמין תאילנדי סוגת 1 ק״ג',
    brand: 'סוגת',
    ingredientsText: '100% אורז יסמין לבן',
    categories: 'אורז ודגנים',
  },
  '7290000060087': {
    productName: 'פסטה ברילה ללא גלוטן (תירס ואורז)',
    brand: 'Barilla Gluten Free',
    ingredientsText: 'קמח תירס לבן (60%), קמח תירס צהוב (29.5%), קמח אורז (10%), מים',
    categories: 'פסטה ללא גלוטן',
  },
  '7290000060094': {
    productName: 'פסטה ברילה ספגטי מס׳ 5 (חיטה רגילה)',
    brand: 'Barilla',
    ingredientsText: 'קמח סמולינה מחיטת דורום, מים (מכיל גלוטן)',
    allergens: 'גלוטן וחיטה',
    categories: 'פסטה רגילה',
  },
  '7290000060100': {
    productName: 'שיבולת שועל להכנה מהירה (קוואקר) סוגת / קוואקר',
    brand: 'Quaker / סוגת',
    ingredientsText: '100% פתיתי שיבולת שועל מלאה',
    categories: 'דגני בוקר וקוואקר',
  },
  '7290000060117': {
    productName: 'טחינה גולמית 100% שומשום מלא אחוה',
    brand: 'אחוה',
    ingredientsText: '100% זרעי שומשום מלא טהור קלוי',
    categories: 'ממרחים וטחינה',
  },
  '7290000060124': {
    productName: 'טחינה גולמית אל ארז',
    brand: 'אל ארז',
    ingredientsText: '100% שומשום טהור מובחר',
    categories: 'ממרחים וטחינה',
  },

  // Oils & Condiments
  '7290000065013': {
    productName: 'שמן זית כתית מעולה חמיצות 0.5% יד מרדכי',
    brand: 'יד מרדכי',
    ingredientsText: '100% שמן זית ישראלי כתית מעולה בכבישה קרה',
    categories: 'שמני מאכל',
  },
  '7290000065020': {
    productName: 'שמן זית כתית מעולה עץ הזית',
    brand: 'עץ הזית',
    ingredientsText: '100% שמן זית בכבישה קרה',
    categories: 'שמני מאכל',
  },
  '7290000065037': {
    productName: 'מיונז אמיתי הלמנס Hellmanns',
    brand: 'Hellmanns / יוניליוור',
    ingredientsText: 'שמן סויה/קנולה, מים, ביצים, חומץ, מלח, סוכר, חומצת לימון',
    categories: 'רטבים וממרחים',
  },

  // Soft Drinks, Juices & Sodas
  '7290000080016': {
    productName: 'קוקה קולה קלאסית 1.5 ליטר (Coca Cola)',
    brand: 'קוקה קולה / החברה המרכזית',
    ingredientsText: 'מים, סוכר, פחמן דו חמצני, צבע מאכל קרמל, חומצה זרחתית, תמציות טבעיות, קפאין',
    categories: 'משקאות קלים מוגזים',
  },
  '7290000080023': {
    productName: 'קוקה קולה זירו 1.5 ליטר (Coca Cola Zero)',
    brand: 'קוקה קולה',
    ingredientsText: 'מים, פחמן דו חמצני, צבע מאכל קרמל, מווסתי חומציות, ממתיקים (אספרטיים, אססולפאם K), קפאין',
    categories: 'משקאות דיאט ללא סוכר',
  },
  '7290000080030': {
    productName: 'ספרייט ZERO ללא סוכר (Sprite Zero)',
    brand: 'ספרייט',
    ingredientsText: 'מים, פחמן דו חמצני, חומצת לימון, ממתיקים (אספרטיים, אססולפאם K), תמצית לימון ליים',
    categories: 'משקאות דיאט ללא סוכר',
  },
  '7290000080047': {
    productName: 'סודה טמפו מים מוגזים 1.5 ליטר',
    brand: 'טמפו',
    ingredientsText: 'מים מטוהרים, פחמן דו חמצני (100% טבעי ללא סוכר)',
    categories: 'מים מוגזים וסודה',
  },
  '7290000080054': {
    productName: 'מיץ תפוזים סחוט טרי 100% פריגת',
    brand: 'פריגת',
    ingredientsText: '100% מיץ תפוזים סחוט טבעי (עשיר בפרוקטוז טבעי)',
    categories: 'מיצים סחוטים טבעיים',
  },

  // Coffee & Teas
  '7290000070017': {
    productName: 'קפה נמס עלית (פחית אדומה)',
    brand: 'עלית / שטראוס',
    ingredientsText: '100% קפה טהור נמס',
    categories: 'קפה ומשקאות חמים',
  },
  '7290000070055': {
    productName: 'קפה שחור טורקי עלית שטראוס 200/230 גרם (שקית אדומה)',
    brand: 'עלית / שטראוס קפה',
    ingredientsText: '100% קפה קלוי וטחון טהור מובחר',
    categories: 'קפה שחור וטורקי',
  },
  '7290000070062': {
    productName: 'קפה שחור טורקי עם הל עלית שטראוס 200/230 גרם (שקית ירוקה)',
    brand: 'עלית / שטראוס קפה',
    ingredientsText: '100% קפה קלוי וטחון טהור מובחר, הל טחון טבעי',
    categories: 'קפה שחור וטורקי',
  },
  '7290100850022': {
    productName: 'קפה טורקי עלית שטראוס (שקית אדומה 200/230 גרם)',
    brand: 'עלית / שטראוס קפה',
    ingredientsText: '100% קפה קלוי וטחון טהור מובחר',
    categories: 'קפה שחור וטורקי',
  },
  '7290100850039': {
    productName: 'קפה טורקי עם הל עלית שטראוס (שקית ירוקה 200/230 גרם)',
    brand: 'עלית / שטראוס קפה',
    ingredientsText: '100% קפה קלוי וטחון טהור מובחר, הל טהור',
    categories: 'קפה שחור וטורקי',
  },
  '7290000070109': {
    productName: 'קפה טורקי עלית קלאסי 100 גרם',
    brand: 'עלית / שטראוס',
    ingredientsText: '100% קפה קלוי וטחון',
    categories: 'קפה שחור וטורקי',
  },
  '7290000070208': {
    productName: 'קפה שחור עלית שקית חיסכון',
    brand: 'עלית / שטראוס',
    ingredientsText: '100% קפה קלוי וטחון טהור',
    categories: 'קפה שחור וטורקי',
  },
  '7290000070024': {
    productName: 'תה ירוק ויסוצקי קלאסי',
    brand: 'ויסוצקי',
    ingredientsText: '100% עלי תה ירוק מובחרים',
    categories: 'תה וחליטות',
  },
  '7290000070031': {
    productName: 'חליטת קמומיל וג׳ינג׳ר ויסוצקי',
    brand: 'ויסוצקי',
    ingredientsText: 'פרחי בבונג (קמומיל), שורש ג׳ינג׳ר, עשב לימון',
    categories: 'תה וחליטות',
  },
  '7290000070048': {
    productName: 'חליטת נענע ומנטה ויסוצקי',
    brand: 'ויסוצקי',
    ingredientsText: '100% עלי מנטה ונענע טהורים (מרגיע בטן SIBO)',
    categories: 'תה וחליטות',
  },
};

/**
 * Clean and normalize product names from messy international barcode DBs
 */
function cleanRawProductName(rawName: string, brand?: string): string {
  let name = (rawName || '').trim();
  if (/fuce\s*tea/i.test(name) || /fuze\s*tea/i.test(name) || /fuzetea/i.test(name)) {
    return 'תה קר פיוז תה (Fuze Tea)';
  }
  if (/nestea/i.test(name)) {
    return 'תה קר נסטי (Nestea)';
  }
  if (/coca\s*cola/i.test(name) || /coke/i.test(name)) {
    return 'קוקה קולה (Coca Cola)';
  }
  if (/bamba/i.test(name) || /במבה/i.test(name)) {
    return 'במבה אסם (בוטנים)';
  }
  return name;
}

/**
 * GS1 Global Country Prefixes for instant identification of imported food products worldwide
 */
export const GLOBAL_GS1_COUNTRY_PREFIXES: { match: (c: string) => boolean; country: string; defaultCategory: string }[] = [
  { match: (c) => /^(800|801|802|803|804|805|806|807|808|809|810|811|812|813|814|815|816|817|818|819|820|821|822|823|824|825|826|827|828|829|830|831|832|833|834|835|836|837|838|839)/.test(c), country: 'איטליה (Italy)', defaultCategory: 'מוצר איטלקי מיובא (שמן זית / פסטה / גבינות קשות / שימורי טונה)' },
  { match: (c) => /^(300|301|302|303|304|305|306|307|308|309|310|311|312|313|314|315|316|317|318|319|320|321|322|323|324|325|326|327|328|329|330|331|332|333|334|335|336|337|338|339|340|341|342|343|344|345|346|347|348|349|350|351|352|353|354|355|356|357|358|359|360|361|362|363|364|365|366|367|368|369|370|371|372|373|374|375|376|377|378|379)/.test(c), country: 'צרפת (France)', defaultCategory: 'מוצר צרפתי מיובא (גבינות / חרדל דיז׳ון / שוקולד)' },
  { match: (c) => /^(400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|418|419|420|421|422|423|424|425|426|427|428|429|430|431|432|433|434|435|436|437|438|439|440)/.test(c), country: 'גרמניה (Germany)', defaultCategory: 'מוצר גרמני מיובא (מוצרים ללא גלוטן / שיבולת שועל / תה צמחים)' },
  { match: (c) => /^(540|541|542|543|544|545|546|547|548|549)/.test(c), country: 'בלגיה ולוקסמבורג (Belgium)', defaultCategory: 'מוצר בלגי מיובא (משקאות אלפרו Alpro / שוקולד בלגי)' },
  { match: (c) => /^(760|761|762|763|764|765|766|767|768|769)/.test(c), country: 'שווייץ (Switzerland)', defaultCategory: 'מוצר שווייצרי מיובא (קפה נספרסו Nespresso / שוקולד לינדט Lindt)' },
  { match: (c) => /^(840|841|842|843|844|845|846|847|848|849)/.test(c), country: 'ספרד (Spain)', defaultCategory: 'מוצר ספרדי מיובא (שמן זית / זיתים / שימורי דגים)' },
  { match: (c) => /^(500|501|502|503|504|505|506|507|508|509)/.test(c), country: 'בריטניה (UK)', defaultCategory: 'מוצר בריטי מיובא (תה אנגלי / רטבים וממרחים)' },
  { match: (c) => /^(870|871|872|873|874|875|876|877|878|879)/.test(c), country: 'הולנד (Netherlands)', defaultCategory: 'מוצר הולנדי מיובא (גבינות גאודה / קקאו הולנדי)' },
  { match: (c) => /^(570|571|572|573|574|575|576|577|578|579)/.test(c), country: 'דנמרק (Denmark)', defaultCategory: 'מוצר דני מיובא (חמאת לורפאק Lurpak / גבינות ארלה Arla)' },
  { match: (c) => /^(730|731|732|733|734|735|736|737|738|739)/.test(c), country: 'שוודיה (Sweden)', defaultCategory: 'מוצר שוודי מיובא (משקאות שיבולת שועל Oatly)' },
  { match: (c) => /^(750)/.test(c), country: 'מקסיקו (Mexico)', defaultCategory: 'מוצר מקסיקני מיובא (בירה קורונה Corona)' },
  { match: (c) => /^(885)/.test(c), country: 'תאילנד (Thailand)', defaultCategory: 'מוצר תאילנדי מיובא (חלב קוקוס Aroy-D / אטריות אורז)' },
  { match: (c) => /^(890|891)/.test(c), country: 'הודו (India)', defaultCategory: 'מוצר הודי מיובא (אורז בסמטי Tilda / תבלינים)' },
  { match: (c) => /^(893)/.test(c), country: 'וייטנאם (Vietnam)', defaultCategory: 'מוצר וייטנאמי מיובא (דפי אורז טהורים / אטריות אורז)' },
  { match: (c) => /^(450|451|452|453|454|455|456|457|458|459|490|491|492|493|494|495|496|497|498|499)/.test(c), country: 'יפן (Japan)', defaultCategory: 'מוצר יפני מיובא (אצות נורי / תה ירוק מאצ׳ה)' },
  { match: (c) => /^(000|001|002|003|004|005|006|007|008|009|010|011|012|013|014|015|016|017|018|019|020|021|022|023|024|025|026|027|028|029|030|031|032|033|034|035|036|037|038|039|040|041|042|043|044|045|046|047|048|049|050|051|052|053|054|055|056|057|058|059|060|061|062|063|064|065|066|067|068|069|070|071|072|073|074|075|076|077|078|079|080|081|082|083|084|085|086|087|088|089|090|091|092|093|094|095|096|097|098|099|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135|136|137|138|139)/.test(c), country: 'ארצות הברית וקנדה (USA / Canada)', defaultCategory: 'מוצר אמריקאי מיובא (UPC)' },
  { match: (c) => /^(930|931|932|933|934|935|936|937|938|939)/.test(c), country: 'אוסטרליה (Australia)', defaultCategory: 'מוצר אוסטרלי מיובא' },
];

/**
 * Identify manufacturer brand from GS1 prefix if product is not indexed
 */
export function getManufacturerFromBarcode(barcode: string): { brand: string; category: string } | null {
  // 1. Check Specific Israeli Manufacturer Prefixes
  for (const prefix of Object.keys(ISRAELI_MANUFACTURER_PREFIXES)) {
    if (barcode.startsWith(prefix)) {
      return {
        brand: ISRAELI_MANUFACTURER_PREFIXES[prefix].brand,
        category: ISRAELI_MANUFACTURER_PREFIXES[prefix].defaultCategory,
      };
    }
  }

  // 2. Generic Israeli GS1 729
  if (barcode.startsWith('729')) {
    return {
      brand: 'יצרן ישראלי מורשה (GS1 ישראל)',
      category: 'מוצר מזון ישראלי',
    };
  }

  // 3. Global GS1 Country Prefixes for International & Imported Products
  for (const item of GLOBAL_GS1_COUNTRY_PREFIXES) {
    if (item.match(barcode)) {
      return {
        brand: `יבוא מחו״ל — ${item.country}`,
        category: item.defaultCategory,
      };
    }
  }

  return null;
}

/**
 * Get user-saved learned barcodes from local storage
 */
export function getCustomBarcodes(): Record<string, Partial<BarcodeProductInfo>> {
  try {
    const saved = localStorage.getItem('sibo_user_barcodes_v1');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {};
}

/**
 * Save a newly discovered barcode to local storage
 */
export function saveCustomBarcode(barcode: string, info: Partial<BarcodeProductInfo>) {
  try {
    const current = getCustomBarcodes();
    const clean = barcode.trim().replace(/[^0-9]/g, '');
    if (clean) {
      current[clean] = {
        ...info,
        barcode: clean,
      };
      // also save padded 13-digit variant
      if (clean.length === 12) {
        current['0' + clean] = { ...info, barcode: '0' + clean };
      }
      localStorage.setItem('sibo_user_barcodes_v1', JSON.stringify(current));
    }
  } catch (e) {}
}

/**
 * Fetch product information and full ingredient list with resilient multi-tier resolver
 */
export async function fetchProductByBarcode(barcode: string): Promise<BarcodeProductInfo> {
  const cleanBarcode = barcode.trim().replace(/[^0-9]/g, '');

  if (!cleanBarcode) {
    return {
      barcode: '',
      productName: '',
      found: false,
    };
  }

  // Generate candidate variants (raw, 13-digit, 12-digit UPC, 14-digit GTIN, trimmed zero)
  const candidateCodes = Array.from(
    new Set([
      cleanBarcode,
      cleanBarcode.padStart(13, '0'),
      cleanBarcode.padStart(12, '0'),
      cleanBarcode.padStart(14, '0'),
      cleanBarcode.replace(/^0+/, ''),
    ].filter(Boolean))
  );

  const customBarcodes = getCustomBarcodes();

  // Tier 1: Check user-learned barcodes and rich offline dictionary for ALL variants (0ms)
  for (const code of candidateCodes) {
    if (customBarcodes[code]) {
      const known = customBarcodes[code];
      return {
        barcode: cleanBarcode,
        productName: known.productName || 'מוצר שמור',
        brand: known.brand || '',
        ingredientsText: known.ingredientsText || '',
        allergens: known.allergens || '',
        categories: known.categories || '',
        imageUrl: known.imageUrl || '',
        found: true,
      };
    }

    if (COMMON_ISRAELI_BARCODES[code]) {
      const known = COMMON_ISRAELI_BARCODES[code];
      return {
        barcode: cleanBarcode,
        productName: known.productName || 'מוצר ישראלי מוכר',
        brand: known.brand || '',
        ingredientsText: known.ingredientsText || '',
        allergens: known.allergens || '',
        categories: known.categories || '',
        imageUrl: known.imageUrl || '',
        found: true,
      };
    }
  }

  // Tier 2: Query our fast server-side proxy (4500ms timeout for reliable cellular & Open Food Facts data)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const proxyRes = await fetch(`/api/barcode/${cleanBarcode}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.found && data.productName) {
        const resolvedProduct = {
          barcode: cleanBarcode,
          productName: cleanRawProductName(data.productName, data.brand),
          brand: data.brand || '',
          ingredientsText: data.ingredientsText || '',
          allergens: data.allergens || '',
          categories: data.categories || '',
          imageUrl: data.imageUrl || '',
          found: true,
        };
        // Auto-cache learned barcode permanently for instant future scans
        saveCustomBarcode(cleanBarcode, resolvedProduct);
        return resolvedProduct;
      }
    }
  } catch (err) {
    // Proxy timeout or offline - seamlessly proceed to instant GS1 classification
  } finally {
    clearTimeout(timeoutId);
  }

  // Tier 2.5: Direct browser fallback to Open Food Facts World (CORS enabled worldwide)
  try {
    const directOffRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`, {
      headers: { Accept: 'application/json' },
    });
    if (directOffRes.ok) {
      const offData = await directOffRes.json();
      if (offData && offData.status === 1 && offData.product) {
        const p = offData.product;
        const productName = p.product_name_he || p.product_name || p.product_name_en || p.generic_name || '';
        const brand = p.brands || p.brand || '';
        const ingredientsText = p.ingredients_text_he || p.ingredients_text || p.ingredients_text_en || '';
        const allergens = p.allergens_he || p.allergens || p.allergens_en || '';
        const categories = p.categories_he || p.categories || p.categories_en || '';
        const imageUrl = p.image_url || p.image_front_url || '';

        if (productName || ingredientsText) {
          const resolvedProduct = {
            barcode: cleanBarcode,
            productName: cleanRawProductName(productName, brand),
            brand,
            ingredientsText,
            allergens,
            categories,
            imageUrl,
            found: true,
          };
          saveCustomBarcode(cleanBarcode, resolvedProduct);
          return resolvedProduct;
        }
      }
    }
  } catch (directErr) {}

  // Tier 3: Instant GS1 Israel & Global Country Origin Intelligence (0ms)
  for (const code of candidateCodes) {
    const mfg = getManufacturerFromBarcode(code);
    if (mfg) {
      return {
        barcode: cleanBarcode,
        productName: `מוצר מחברת ${mfg.brand} (${mfg.category})`,
        brand: mfg.brand,
        categories: mfg.category,
        found: true,
      };
    }
  }

  // Tier 4: Generic packaged product fallback
  return {
    barcode: cleanBarcode,
    productName: `מוצר לא מזוהה (ברקוד ${cleanBarcode})`,
    found: false,
  };
}
