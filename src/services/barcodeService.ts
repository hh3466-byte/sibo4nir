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
 * Fetch product information and full ingredient list from Open Food Facts
 */
export async function fetchProductByBarcode(barcode: string): Promise<BarcodeProductInfo> {
  const cleanBarcode = barcode.trim().replace(/[^0-9]/g, '');

  if (!cleanBarcode) {
    throw new Error('מספר ברקוד אינו תקין');
  }

  try {
    // 1. Try Israeli & World Open Food Facts database
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`, {
      headers: {
        'User-Agent': 'SIBOSafeApp/1.0 (https://sibo4nir-1.onrender.com; sibosafe@nir.app)',
      },
    });

    if (!response.ok) {
      throw new Error('שגיאה בגישה למאגר הברקודים');
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return {
        barcode: cleanBarcode,
        productName: '',
        found: false,
      };
    }

    const p = data.product;
    const productName =
      p.product_name_he ||
      p.product_name ||
      p.generic_name_he ||
      p.generic_name ||
      p.brands ||
      'מוצר מזון ארוז';

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
  } catch (error: any) {
    console.warn('[BarcodeService] Error fetching barcode data:', error);
    throw error;
  }
}
