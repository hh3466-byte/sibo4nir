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
 * Known common Israeli barcodes dictionary for instant offline zero-latency lookup
 */
const COMMON_ISRAELI_BARCODES: Record<string, Partial<BarcodeProductInfo>> = {
  // Yotvata / Tnuva / Tara Lactose Free milks
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
    productName: 'קוטג׳ תנובה 5% (רגיל)',
    brand: 'תנובה',
    ingredientsText: 'חלב מפוסטר, שמנת, מלח, חומרי טעם',
    allergens: 'מכיל לקטוז וחלב',
    categories: 'גבינות רכות',
  },
  '7290000045084': {
    productName: 'קוטג׳ שטראוס ללא לקטוז (0% לקטוז)',
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
};

/**
 * Fetch product information and full ingredient list with resilient timeout
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

  // 1. Check local fast-lookup dictionary
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

  // 2. Query Open Food Facts with a 3.5-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SIBOSafeApp/1.0 (https://sibo4nir-1.onrender.com; sibosafe@nir.app)',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const productName =
          p.product_name_he ||
          p.product_name ||
          p.generic_name_he ||
          p.generic_name ||
          p.brands ||
          `מוצר ארוז (${cleanBarcode})`;

        const ingredientsText =
          p.ingredients_text_he ||
          p.ingredients_text ||
          p.ingredients_text_en ||
          p.ingredients_text_with_allergens_he ||
          '';

        const brand = p.brands || p.brand_owner || '';
        const allergens = p.allergens || p.allergens_tags?.join(', ') || '';
        const categories = p.categories || '';
        const imageUrl = p.image_front_url || p.image_url || '';

        return {
          barcode: cleanBarcode,
          productName,
          brand,
          ingredientsText,
          allergens,
          categories,
          imageUrl,
          found: true,
        };
      }
    }
  } catch (err) {
    console.warn('[BarcodeService] API request timeout or error, falling back to barcode identifier:', err);
  } finally {
    clearTimeout(timeoutId);
  }

  // 3. Fallback when product is not indexed in Open Food Facts
  return {
    barcode: cleanBarcode,
    productName: `מוצר ארוז (ברקוד ${cleanBarcode})`,
    found: false,
  };
}
