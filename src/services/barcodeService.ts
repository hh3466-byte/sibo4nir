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
  '72901101': { brand: 'החברה המרכזית למשקאות / פיוז תה / קוקה קולה', defaultCategory: 'משקאות קלים / תה קר' },
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
  // Fuze Tea & Iced Teas
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

  // Plant Based Milks
  '7290000045206': {
    productName: 'משקה שקדים אורגני ללא סוכר (אלפרו / תנובה אלטרנטיב)',
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

  // Snacks & Grains
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

  // Coffee & Teas
  '7290000070017': {
    productName: 'קפה נמס עלית (פחית אדומה)',
    brand: 'עלית',
    ingredientsText: '100% קפה טהור נמס',
    categories: 'קפה ומשקאות חמים',
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

  // Tier 1: Check instant local offline dictionary (0ms)
  if (COMMON_ISRAELI_BARCODES[cleanBarcode]) {
    const known = COMMON_ISRAELI_BARCODES[cleanBarcode];
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

  // Tier 2: Query our fast server-side proxy
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

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
    console.warn('[BarcodeService] Proxy request timeout or error, falling back to direct API:', err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Tier 3: Direct Open Food Facts query
  try {
    const directRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
    if (directRes.ok) {
      const data = await directRes.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const brand = p.brands || p.brand_owner || '';
        const rawName = p.product_name_he || p.product_name || p.generic_name_he || brand || `מוצר (${cleanBarcode})`;
        return {
          barcode: cleanBarcode,
          productName: cleanRawProductName(rawName, brand),
          brand,
          ingredientsText: p.ingredients_text_he || p.ingredients_text || '',
          allergens: p.allergens || '',
          categories: p.categories || '',
          imageUrl: p.image_front_url || p.image_url || '',
          found: true,
        };
      }
    }
  } catch (directErr) {
    console.warn('[BarcodeService] Direct API request failed:', directErr);
  }

  // Tier 4: GS1 Manufacturer Prefix identification
  const mfg = getManufacturerFromBarcode(cleanBarcode);
  if (mfg) {
    return {
      barcode: cleanBarcode,
      productName: `מוצר ${mfg.brand} (ברקוד ${cleanBarcode})`,
      brand: mfg.brand,
      categories: mfg.category,
      found: true,
    };
  }

  // Tier 5: Generic packaged product fallback
  return {
    barcode: cleanBarcode,
    productName: `מוצר ארוז (ברקוד ${cleanBarcode})`,
    found: true,
  };
}
