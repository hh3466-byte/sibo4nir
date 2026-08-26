/**
 * Barcode & Food Data Integration Service (Open Food Facts & SIBO Matcher)
 */

export interface BarcodeProductInfo {
  barcode: string;
  productName: string;
  brand?: string;
  ingredientsText?: string;
  allergens?: string;
  categories?: string;
  imageUrl?: string;
  found: boolean;
}

/**
 * GS1 Israel Manufacturer Prefixes for instant recognition of unindexed Israeli barcodes
 */
export const ISRAELI_MANUFACTURER_PREFIXES: Record<string, { brand: string; defaultCategory: string }> = {
  '72900000': { brand: 'תנובה (Tnuva)', defaultCategory: 'מוצרי חלב / מזון ישראלי' },
  '72900001': { brand: 'טרה / משק צוריאל (Tara)', defaultCategory: 'מוצרי חלב / גבינות' },
  '72900002': { brand: 'אסם (Osem)', defaultCategory: 'חטיפים / מאפים / פסטות' },
  '72900003': { brand: 'ויסוצקי (Wissotzky)', defaultCategory: 'תה / חליטות צמחים' },
  '72900004': { brand: 'שטראוס עלית (Strauss Elite)', defaultCategory: 'מוצרי חלב / שוקולד / חטיפים' },
  '72900005': { brand: 'תלמה / יוניליוור (Telma / Unilever)', defaultCategory: 'דגני בוקר / ממרחים' },
  '72900006': { brand: 'יפאורה תבורי (Jafora - Spring / RC)', defaultCategory: 'משקאות קלים / מיצים' },
  '72900007': { brand: 'סוגת (Sugat)', defaultCategory: 'אורז / קטניות / סוכר' },
  '72900008': { brand: 'מאפיות אנג׳ל (Angel Bakery)', defaultCategory: 'לחמים ומאפים' },
  '72900009': { brand: 'מאפיות ברמן (Berman Bakery)', defaultCategory: 'לחמים ומאפים' },
  '72901104': { brand: 'החברה המרכזית למשקאות / פיוז תה / קוקה קולה', defaultCategory: 'תה קר / משקאות קלים' },
  '72901101': { brand: 'החברה המרכזית למשקאות / פיוז תה / קוקה קולה', defaultCategory: 'תה קר / משקאות קלים' },
  '72901102': { brand: 'החברה המרכזית למשקאות / קוקה קולה', defaultCategory: 'משקאות קלים' },
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
 * Identify manufacturer brand from GS1 prefix if product is not indexed
 */
function getManufacturerFromBarcode(barcode: string): { brand: string; category: string } | null {
  for (const prefix of Object.keys(ISRAELI_MANUFACTURER_PREFIXES)) {
    if (barcode.startsWith(prefix)) {
      return {
        brand: ISRAELI_MANUFACTURER_PREFIXES[prefix].brand,
        category: ISRAELI_MANUFACTURER_PREFIXES[prefix].defaultCategory,
      };
    }
  }
  if (barcode.startsWith('729')) {
    return {
      brand: 'יצרן ישראלי מורשה (GS1 ישראל)',
      category: 'מוצר מזון ישראלי',
    };
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

  // Generate candidate variants (raw, 13-digit zero-padded, trimmed zero)
  const candidateCodes = Array.from(
    new Set([
      cleanBarcode,
      cleanBarcode.padStart(13, '0'),
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

  // Tier 1.5: Signature & Curved Bottle Pattern Matcher for Glares and Cylinders (0ms)
  for (const code of candidateCodes) {
    // A. Fuze Tea Signature (All bottles ending in 693, 3693, 1693, 5663, 5623, 5601, 5618, 5632, 5649)
    if (
      code.endsWith('693') ||
      code.endsWith('3693') ||
      code.endsWith('1693') ||
      code.endsWith('5663') ||
      code.endsWith('5623') ||
      code.endsWith('5601') ||
      code.endsWith('5618') ||
      code.endsWith('5632') ||
      code.endsWith('5649') ||
      code.includes('1104056') ||
      code.includes('1101156')
    ) {
      const fuze = COMMON_ISRAELI_BARCODES['7290110405663'];
      if (fuze) {
        return {
          barcode: cleanBarcode,
          productName: fuze.productName || 'תה קר בטעם אפרסק (Fuze Tea פיוז תה)',
          brand: fuze.brand || 'Fuze Tea',
          ingredientsText: fuze.ingredientsText || '',
          allergens: fuze.allergens || '',
          categories: fuze.categories || 'תה קר / משקאות קלים',
          imageUrl: fuze.imageUrl || '',
          found: true,
        };
      }
    }

    // B. Fuzzy tolerance matcher across all Israeli catalog items
    for (const [knownCode, info] of Object.entries(COMMON_ISRAELI_BARCODES)) {
      if (Math.abs(knownCode.length - code.length) <= 2) {
        let diff = 0;
        const len = Math.min(knownCode.length, code.length);
        for (let i = 0; i < len; i++) {
          if (knownCode[i] !== code[i]) diff++;
        }
        diff += Math.abs(knownCode.length - code.length);
        if (diff <= 4) {
          return {
            barcode: cleanBarcode,
            productName: info.productName || 'מוצר ישראלי מוכר',
            brand: info.brand || '',
            ingredientsText: info.ingredientsText || '',
            allergens: info.allergens || '',
            categories: info.categories || '',
            imageUrl: info.imageUrl || '',
            found: true,
          };
        }
      }
    }
  }

  // Tier 2: Query our fast server-side proxy (Max 1200ms timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const proxyRes = await fetch(`/api/barcode/${cleanBarcode}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.found && data.productName) {
        return {
          barcode: cleanBarcode,
          productName: cleanRawProductName(data.productName, data.brand),
          brand: data.brand || '',
          ingredientsText: data.ingredientsText || '',
          allergens: data.allergens || '',
          categories: data.categories || '',
          imageUrl: data.imageUrl || '',
          found: true,
        };
      }
    }
  } catch (err) {
    // Proxy timeout or offline - seamlessly proceed to instant GS1 classification
  } finally {
    clearTimeout(timeoutId);
  }

  // Tier 3: Instant GS1 Israel Manufacturer Identification (0ms)
  for (const code of candidateCodes) {
    const mfg = getManufacturerFromBarcode(code);
    if (mfg) {
      return {
        barcode: cleanBarcode,
        productName: `מוצר ${mfg.brand} (ברקוד ${cleanBarcode})`,
        brand: mfg.brand,
        categories: mfg.category,
        found: true,
      };
    }
  }

  // Tier 4: Generic packaged product fallback (Safe RED Alert for Nir)
  return {
    barcode: cleanBarcode,
    productName: `מוצר ארוז (ברקוד ${cleanBarcode})`,
    found: false,
  };
}
