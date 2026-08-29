// Auto-generated 500+ Pure Supermarket SIBO shopping database (0 homemade items, 100% store products)
export interface SiboShopping500Item {
  id: string;
  category: 'meat_fish' | 'veggies_fruits' | 'dairy_oils' | 'grains_starches' | 'sauces' | 'spices' | 'sweets' | 'drinks' | 'pantry_baking' | 'custom';
  name: string;
  safeBrand?: string;
  warningNote?: string;
  unit?: string;
}

export const SIBO_CATEGORIES = [
  { id: 'veggies_fruits', label: 'ירקות ופירות בטוחים (0% תסיסה)', icon: '🥦', row: 1 },
  { id: 'sauces', label: 'רטבים וממרחים (50+ רטבים בטוחים)', icon: '🥫', row: 1 },
  { id: 'spices', label: 'תבלינים ועשבי תיבול (50+ תבלינים טהורים)', icon: '🧂', row: 1 },
  { id: 'sweets', label: 'מתוקים, שוקולד ופינוקים בטוחים', icon: '🍫', row: 1 },
  { id: 'meat_fish', label: 'בשר, עופות ודגים טריים ומשומרים', icon: '🥩', row: 2 },
  { id: 'dairy_oils', label: 'ביצים, גבינות קשות (0% לקטוז) ושמנים', icon: '🧀', row: 2 },
  { id: 'grains_starches', label: 'פחמימות, קמחים ודגנים ללא גלוטן', icon: '🍞', row: 2 },
  { id: 'drinks', label: 'חלבים צמחיים ומשקאות בטוחים', icon: '☕', row: 2 },
  { id: 'pantry_baking', label: 'מוצרי מזווה, אגוזים ואפייה', icon: '🥣', row: 2 },
] as const;

export const SIBO_SHOPPING_500_ITEMS: SiboShopping500Item[] = [
  {
    "id": "sibo_shop_1",
    "category": "sauces",
    "name": "רוטב סויה תמרי ללא גלוטן (Tamari GF)",
    "safeBrand": "San-J Tamari Gluten Free / קיקומן ללא גלוטן (פקק תכלת)",
    "warningNote": "זהירות: סויה רגילה מכילה חיטה/גלוטן ושום",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_2",
    "category": "sauces",
    "name": "רוטב סויה תמרי מופחת נתרן ללא גלוטן",
    "safeBrand": "San-J Reduced Sodium Tamari GF",
    "warningNote": "ללא גלוטן 0% שום",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_3",
    "category": "sauces",
    "name": "רוטב סויה תמרי אורגני",
    "safeBrand": "San-J Organic Tamari",
    "warningNote": "ללא הנדסה גנטית",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_4",
    "category": "sauces",
    "name": "חרדל דיז׳ון חלק קלאסי",
    "safeBrand": "Maille Dijon Originale (צנצנת זכוכית)",
    "warningNote": "לוודא: ללא תוספת סוכר, ללא אבקת בצל",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_5",
    "category": "sauces",
    "name": "חרדל דיז׳ון גרגירים עתיק",
    "safeBrand": "Maille Dijon à l'Ancienne",
    "warningNote": "לבדוק רכיבים: חרדל, חומץ, מים, מלח בלבד",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_6",
    "category": "sauces",
    "name": "חרדל דיז׳ון אורגני",
    "safeBrand": "Delouis Organic Dijon",
    "warningNote": "ללא חומרים משמרים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_7",
    "category": "sauces",
    "name": "חרדל חלק עדין אורגני",
    "safeBrand": "Biona Organic Mild Mustard",
    "warningNote": "ללא סוכר מוסף",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_8",
    "category": "sauces",
    "name": "חרדל צרפתי בטחינה מסורתית",
    "safeBrand": "Edmond Fallot Dijon Mustard",
    "warningNote": "איכות מסעדות צרפתיות",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_9",
    "category": "sauces",
    "name": "טחינה גולמית טהורה 100% שומשום",
    "safeBrand": "אל ארז / הר ברכה / היונה / ירושלים",
    "warningNote": "לוודא: 100% שומשום טהור ללא תוספים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_10",
    "category": "sauces",
    "name": "טחינה גולמית משומשום אתיופי מלא",
    "safeBrand": "הר ברכה משומשום מלא / אל ארז מלא",
    "warningNote": "עשירה בסידן וברזל",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_11",
    "category": "sauces",
    "name": "טחינה גולמית אורגנית",
    "safeBrand": "הרדוף אורגני טחינה",
    "warningNote": "100% שומשום אורגני",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_12",
    "category": "sauces",
    "name": "טחינה גולמית בטחינה מסורתית בריחיים של אבן",
    "safeBrand": "הר ברכה פרימיום",
    "warningNote": "קרמית ועשירה",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_13",
    "category": "sauces",
    "name": "טחינה שחורה משומשום שחור טהור 100%",
    "safeBrand": "חוות דרך התבלינים / שוק לוינסקי",
    "warningNote": "פצצת נוגדי חמצון",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_14",
    "category": "sauces",
    "name": "חמאת בוטנים 100% טבעית ללא סוכר",
    "safeBrand": "B&D / ראסטיס 100% בוטנים",
    "warningNote": "זהירות: חברות רגילות מוסיפות שמן דקלים וסוכר",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_15",
    "category": "sauces",
    "name": "חמאת בוטנים טבעית עם שברי בוטנים (Crunchy)",
    "safeBrand": "B&D קראנץ׳ טבעי",
    "warningNote": "ללא סוכר ושמנים מוקשים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_16",
    "category": "sauces",
    "name": "חמאת בוטנים אורגנית 100%",
    "safeBrand": "הרדוף / שופרסל גרין",
    "warningNote": "בוטנים אורגניים בלבד",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_17",
    "category": "sauces",
    "name": "חמאת שקדים טבעית 100%",
    "safeBrand": "שקדיה / B&D / ראסטיס",
    "warningNote": "ללא סוכר, ללא חומרים משמרים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_18",
    "category": "sauces",
    "name": "חמאת שקדים טבעית עם שברי שקדים קראנץ׳",
    "safeBrand": "שקדיה קראנץ׳",
    "warningNote": "ללא סוכר",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_19",
    "category": "sauces",
    "name": "חמאת שקדים אורגנית",
    "safeBrand": "הרדוף / תבואות",
    "warningNote": "שקדים אורגניים מולבנים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_20",
    "category": "sauces",
    "name": "חמאת אגוזי לוז 100% טבעית",
    "safeBrand": "ראסטיס / שקדיה לוז",
    "warningNote": "מעולה למריחה ולשוקולד",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_21",
    "category": "sauces",
    "name": "חמאת גרעיני חמנייה טבעית 100%",
    "safeBrand": "שקדיה חמנייה טבעית",
    "warningNote": "אלטרנטיבה מעולה ללא אגוזים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_22",
    "category": "sauces",
    "name": "חמאת זרעי דלעת טבעית 100%",
    "safeBrand": "שקדיה דלעת",
    "warningNote": "עשירה באבץ",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_23",
    "category": "sauces",
    "name": "חומץ תפוחים אורגני לא מסונן (עם \"אם החומץ\")",
    "safeBrand": "Bragg Organic Apple Cider Vinegar",
    "warningNote": "לוודא: לא מסונן, ללא תוספת סוכר וקרמל",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_24",
    "category": "sauces",
    "name": "חומץ תפוחים טבעי 5% חומציות",
    "safeBrand": "סנטיאגו / שופרסל גרין",
    "warningNote": "אידיאלי לוויניגרט וציר מרק",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_25",
    "category": "sauces",
    "name": "חומץ תפוחים איטלקי אורגני",
    "safeBrand": "Biona Organic Apple Cider",
    "warningNote": "לא מפוסטר",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_26",
    "category": "sauces",
    "name": "שמן זית כתית מעולה מושרה שום (Garlic Infused Oil)",
    "safeBrand": "Garlic Gold / Farchioni Garlic Oil / שמן שום מבוקבק",
    "warningNote": "הערה קלינית: שמן שום מותר ב-SIBO כי פרוקטנים אינם מסיסים בשמן!",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_27",
    "category": "sauces",
    "name": "שמן שומשום קלוי טהור 100%",
    "safeBrand": "Blue Dragon / Taste of Asia / San-J",
    "warningNote": "לוודא 100% שמן שומשום ללא שמנים צמחיים אחרים",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_28",
    "category": "sauces",
    "name": "שמן שומשום בהיר בכבישה קרה",
    "safeBrand": "שופרסל גרין / תבואות",
    "warningNote": "שמן עדין לרטבים",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_29",
    "category": "sauces",
    "name": "רוטב קוקוס אמינוס (Coconut Aminos)",
    "safeBrand": "Coconut Secret Coconut Aminos",
    "warningNote": "תחליף סויה טבעי 0% סויה וגלוטן",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_30",
    "category": "sauces",
    "name": "קרם קוקוס לבישול 100% טבעי ללא E412",
    "safeBrand": "Aroy-D (קרטון ירוק) / Chaokoh 100%",
    "warningNote": "לוודא: ללא חומרים מתחלבים (גומי גואר / E412)",
    "unit": "קרטון"
  },
  {
    "id": "sibo_shop_31",
    "category": "sauces",
    "name": "חלב קוקוס לבישול ללא חומרים מתחלבים",
    "safeBrand": "Aroy-D קרטון 250 מ\"ל",
    "warningNote": "לבדוק רכיבים: תמצית קוקוס ומים בלבד",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_32",
    "category": "sauces",
    "name": "חומץ בלסמי איטלקי איכותי ממודנה",
    "safeBrand": "Ponti / Monini Aceto Balsamico",
    "warningNote": "לוודא: מבוסס תירוש ענבים בלבד ללא סירופ סוכר וקרמל",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_33",
    "category": "sauces",
    "name": "חומץ בן יין אדום טהור",
    "safeBrand": "Maille / De Nigris Red Wine Vinegar",
    "warningNote": "ללא תוספות חומרי טעם",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_34",
    "category": "sauces",
    "name": "חומץ בן יין לבן טהור",
    "safeBrand": "Maille White Wine Vinegar",
    "warningNote": "טהור ללא סוכר",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_35",
    "category": "sauces",
    "name": "חומץ אורז טבעי (ללא תוספת סוכר)",
    "safeBrand": "Marukan / Mizkan Pure Rice Vinegar",
    "warningNote": "זהירות: חומץ סושי מוכן מכיל המון סוכר!",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_36",
    "category": "sauces",
    "name": "חומץ שרי ספרדי מיושן (Sherry Vinegar)",
    "safeBrand": "La Sevillana Jerez Sherry Vinegar",
    "warningNote": "טעם אגוזי עמוק לוויניגרט",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_37",
    "category": "sauces",
    "name": "חומץ שזיפי אוּמֶבּוֹשִׁי יפני (Umeboshi)",
    "safeBrand": "Clearspring Umeboshi Plum Vinegar",
    "warningNote": "מעולה לעיכול ודל פודמאפ",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_38",
    "category": "sauces",
    "name": "רוטב חריף טבסקו קלאסי (אדום)",
    "safeBrand": "Tabasco Original Red Pepper Sauce",
    "warningNote": "רכיבים בטוחים: פלפל טבסקו, חומץ ומלח בלבד",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_39",
    "category": "sauces",
    "name": "רוטב חריף טבסקו ירוק (חלפניו)",
    "safeBrand": "Tabasco Green Pepper Sauce",
    "warningNote": "חריפות מתונה ללא שום",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_40",
    "category": "sauces",
    "name": "רוטב חריף פרנקס רדהוט מקורי",
    "safeBrand": "Frank's RedHot Original Sauce",
    "warningNote": "לוודא גרסת Original (ללא שום/בצל)",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_41",
    "category": "sauces",
    "name": "רוטב דגים תאילנדי טהור (Fish Sauce)",
    "safeBrand": "Tiparos / Squid Brand / Megachef",
    "warningNote": "לבדוק: אנשובי, מלח ומים (סוכר עד 1% מותר)",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_42",
    "category": "sauces",
    "name": "מחית עגבניות פסאטה חלקה 100% עגבניות",
    "safeBrand": "Mutti Passata (בקבוק זכוכית)",
    "warningNote": "לוודא: עגבניות ומלח בלבד (0% שום ובצל)",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_43",
    "category": "sauces",
    "name": "מחית עגבניות פסאטה מרוכזת בבקבוק",
    "safeBrand": "Cirio Passata",
    "warningNote": "עגבניות ומלח בלבד",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_44",
    "category": "sauces",
    "name": "עגבניות מרוסקות 100% איטלקיות",
    "safeBrand": "Mutti Polpa 100% איטלקי",
    "warningNote": "ללא תוספת רטבים, ללא עשבי תיבול תעשייתיים",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_45",
    "category": "sauces",
    "name": "רסק עגבניות מרוכז כפול טהור",
    "safeBrand": "Mutti Doppio Concentrato",
    "warningNote": "100% עגבניות איטלקיות ללא סוכר",
    "unit": "שפופרת"
  },
  {
    "id": "sibo_shop_46",
    "category": "sauces",
    "name": "עגבניות שלמות מקולפות במיץ עגבניות",
    "safeBrand": "Mutti Pelati / Cirio",
    "warningNote": "עגבניות תמר איטלקיות טהורות",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_47",
    "category": "sauces",
    "name": "שמן אבוקדו מכבישה קרה 100% טהור",
    "safeBrand": "Chosen Foods 100% Pure Avocado Oil",
    "warningNote": "שמן יציב ובריא לטיגון ורטבים",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_48",
    "category": "sauces",
    "name": "שמן אגוזי מלך טהור לתיבול סלטים",
    "safeBrand": "La Tourangelle Walnut Oil",
    "warningNote": "אומגה 3 עשירה",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_49",
    "category": "sauces",
    "name": "שמן כמהין לבן איכותי על בסיס שמן זית",
    "safeBrand": "Urbani Tartufi White Truffle Oil",
    "warningNote": "לוודא שמן זית בטעם כמהין ללא אבקות בצל",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_50",
    "category": "sauces",
    "name": "שמן כמהין שחור פרימיום",
    "safeBrand": "Tartufi Morra Black Truffle Oil",
    "warningNote": "ארומה מעושנת עשירה",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_51",
    "category": "sauces",
    "name": "שמן זרעי ענבים טהור",
    "safeBrand": "Borges / שופרסל גרין",
    "warningNote": "שמן קל וניטרלי לרטבים",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_52",
    "category": "sauces",
    "name": "שמן קוקוס אורגני בכבישה קרה",
    "safeBrand": "Jarrow Formulas / B&D / שופרסל גרין",
    "warningNote": "0% לקטוז וגלוטן",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_53",
    "category": "sauces",
    "name": "שמן שקדים טהור בכבישה קרה",
    "safeBrand": "La Tourangelle Almond Oil",
    "warningNote": "ניחוח עדין למאפים וסלטים",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_54",
    "category": "sauces",
    "name": "מיץ לימון טבעי 100% סחוט ללא משמרים",
    "safeBrand": "לימונצ׳לו טבעי / סחוט טרי מהירקן",
    "warningNote": "לוודא: 100% מיץ לימון ללא חומצת לימון סינתטית",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_55",
    "category": "sauces",
    "name": "מיץ ליים טבעי 100%",
    "safeBrand": "Santa Cruz Organic Lime Juice",
    "warningNote": "ללא סוכר",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_56",
    "category": "sauces",
    "name": "רוטב חרדל צהוב קלאסי",
    "safeBrand": "French's Classic Yellow Mustard",
    "warningNote": "לבדוק רכיבים: זרעי חרדל, חומץ, מים, כורכום ומלח",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_57",
    "category": "sauces",
    "name": "מיונז הולנדי איכותי ללא שום ובצל",
    "safeBrand": "Hellmann's Real (הולנדי) / Calve",
    "warningNote": "לוודא: ללא שום, ללא אבקת בצל, ללא סירופ גלוקוז",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_58",
    "category": "sauces",
    "name": "מיונז שמן אבוקדו בריאותי",
    "safeBrand": "Primal Kitchen Mayo with Avocado Oil",
    "warningNote": "ללא שום ובצל, ללא שמן סויה",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_59",
    "category": "sauces",
    "name": "ממרח טפנד זיתי קלמטה טהור",
    "safeBrand": "משק לין / אנשי הזית טפנד קלמטה",
    "warningNote": "לוודא: זיתים, שמן זית ומלח בלבד (ללא שום!)",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_60",
    "category": "sauces",
    "name": "ממרח טפנד זיתים ירוקים טהור ללא שום",
    "safeBrand": "אנשי הזית",
    "warningNote": "זיתים, שמן זית ומלח בלבד",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_61",
    "category": "sauces",
    "name": "ממרח עגבניות מיובשות ללא שום",
    "safeBrand": "משק לין טפנד עגבניות",
    "warningNote": "עגבניות מיובשות ושמן זית בלבד",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_62",
    "category": "sauces",
    "name": "עגבניות מיובשות בשמן זית ללא שום",
    "safeBrand": "שופרסל פרימיום / זיתא",
    "warningNote": "זהירות: רוב המותגים מוסיפים שום לצנצנת!",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_63",
    "category": "sauces",
    "name": "רכז רימונים 100% טבעי ללא סוכר",
    "safeBrand": "Cortas / Al-Rabih 100% Pomegranate Molasses",
    "warningNote": "לוודא: 100% מיץ רימונים מרוכז ללא סוכר מוסף",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_64",
    "category": "sauces",
    "name": "רוטב ווסטרשייר ללא גלוטן וללא שום",
    "safeBrand": "The Wizard's Organic GF Worcestershire",
    "warningNote": "זהירות: ווסטרשייר רגיל מכיל בצל, שום וגלוטן",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_65",
    "category": "sauces",
    "name": "רוטב ברביקיו ללא שום ובצל",
    "safeBrand": "Fody Low FODMAP BBQ Sauce / Primal Kitchen",
    "warningNote": "רוטב ברביקיו מאושר ל-SIBO",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_66",
    "category": "sauces",
    "name": "קטשופ ללא שום ובצל",
    "safeBrand": "Fody Low FODMAP Ketchup / True Made Foods",
    "warningNote": "ללא סירופ תירס, ללא שום ובצל",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_67",
    "category": "sauces",
    "name": "רוטב סיראצ׳ה ללא שום (Garlic-Free Sriracha)",
    "safeBrand": "Yellowbird / Sky Valley Garlic Free",
    "warningNote": "רוטב חריף מתוק ללא שום",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_68",
    "category": "sauces",
    "name": "רוטב טריאקי ללא גלוטן וללא שום",
    "safeBrand": "San-J Gluten Free Teriyaki Garlic Free",
    "warningNote": "מתאים למוקפצים ולסלמון",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_69",
    "category": "sauces",
    "name": "רוטב ג׳ינג׳ר וסויה תמרי מרוכז",
    "safeBrand": "San-J Gluten Free Ginger Tamari",
    "warningNote": "ללא גלוטן 0% שום",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_70",
    "category": "sauces",
    "name": "שמן זית בטעם בזיליקום",
    "safeBrand": "Farchioni Basil Infused Olive Oil",
    "warningNote": "ארומת בזיליקום טבעית",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_71",
    "category": "sauces",
    "name": "שמן זית בטעם אורגנו",
    "safeBrand": "אנשי הזית שמן אורגנו",
    "warningNote": "לתיבול סלטים",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_72",
    "category": "sauces",
    "name": "שמן צ׳ילי חריף טהור",
    "safeBrand": "La Tourangelle Chili Oil",
    "warningNote": "100% שמן ושבבי צ׳ילי",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_73",
    "category": "sauces",
    "name": "רוטב פסטו בזיליקום קנוי ללא שום",
    "safeBrand": "Filippo Berio Vegan Garlic-Free Pesto",
    "warningNote": "לוודא גרסה ללא שום",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_74",
    "category": "sauces",
    "name": "רוטב צ׳ילי מתוק ללא שום (Sweet Chili Garlic-Free)",
    "safeBrand": "Thai Kitchen Sweet Chili Sauce",
    "warningNote": "ללא שום",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_75",
    "category": "sauces",
    "name": "צלפים במלח ים שטופים",
    "safeBrand": "Polli / שופרסל איטלקי",
    "warningNote": "לשטוף עודפי מלח לפני השימוש",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_76",
    "category": "spices",
    "name": "מלח ים אטלנטי גס טבעי",
    "safeBrand": "לה באלן / שופרסל גרין / סאל דה גראנד",
    "warningNote": "100% טבעי ללא חומרים נוגדי גושים (E535/E536)",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_77",
    "category": "spices",
    "name": "מלח הימלאיה ורוד דק/גס",
    "safeBrand": "תבואות / שופרסל גרין",
    "warningNote": "עשיר ב-84 מינרלים טבעיים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_78",
    "category": "spices",
    "name": "מלח ים דק טבעי ללא פלואור/יוד מלאכותי",
    "safeBrand": "מלח הארץ ים טבעי",
    "warningNote": "ללא כימיקלים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_79",
    "category": "spices",
    "name": "פתיתי מלח מאלדון מעושן פרימיום",
    "safeBrand": "Maldon Smoked Sea Salt Flakes",
    "warningNote": "קראנץ׳ מושלם מעל סטייקים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_80",
    "category": "spices",
    "name": "פתיתי מלח מאלדון טבעיים",
    "safeBrand": "Maldon Sea Salt",
    "warningNote": "פתיתי מלח פירמידה עדינים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_81",
    "category": "spices",
    "name": "מלח שחור הודי (Kala Namak)",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "מעניק ארומת ביצים עדינה לטופו ומוקפצים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_82",
    "category": "spices",
    "name": "פלפל שחור גרוס טהור 100%",
    "safeBrand": "תבליני טעם וריח / חוות דרך התבלינים",
    "warningNote": "לוודא: 100% פלפל שחור טהור (ללא תערובות מלח)",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_83",
    "category": "spices",
    "name": "גרגרי פלפל שחור שלמים במטחנה",
    "safeBrand": "Drogheria & Alimentari / מקורמיק",
    "warningNote": "לטחינה טרייה במקום",
    "unit": "מטחנה"
  },
  {
    "id": "sibo_shop_84",
    "category": "spices",
    "name": "פלפל לבן טחון טהור",
    "safeBrand": "תבליני מימון / טעם וריח",
    "warningNote": "מעולה לדגים ומרקים צחים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_85",
    "category": "spices",
    "name": "גרגרי פלפל ירוק מיובש שלמים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "פלפליות עדינה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_86",
    "category": "spices",
    "name": "גרגרי פלפל ארבע העונות במטחנה",
    "safeBrand": "Drogheria 4 Seasons",
    "warningNote": "תערובת פלפלים טהורה ללא מלח",
    "unit": "מטחנה"
  },
  {
    "id": "sibo_shop_87",
    "category": "spices",
    "name": "פלפל ורוד שלם (גרגרים)",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "טעם פירותי עדין לדגים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_88",
    "category": "spices",
    "name": "כורכום טהור 100% טחון",
    "safeBrand": "חוות דרך התבלינים / תבליני טעם וריח",
    "warningNote": "זהירות: מותגים זולים מוסיפים קמח וצבעי מאכל. לקנות 100% טהור!",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_89",
    "category": "spices",
    "name": "כורכום אורגני טהור",
    "safeBrand": "הרדוף / שופרסל גרין",
    "warningNote": "ללא הדברה",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_90",
    "category": "spices",
    "name": "שורש כורכום טרי",
    "safeBrand": "שופרסל גרין / ירקניה",
    "warningNote": "לגרר לתבשילים ומרקי ריפוי",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_91",
    "category": "spices",
    "name": "כמון מזרחי טהור טחון",
    "safeBrand": "תבליני טעם וריח / מימון טהור",
    "warningNote": "לוודא: 100% כמון ללא תוספת קמחים ושום",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_92",
    "category": "spices",
    "name": "זרעי כמון שלמים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "לקלייה קלה במחבת",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_93",
    "category": "spices",
    "name": "פפריקה מתוקה בשמן טהורה",
    "safeBrand": "תבליני טעם וריח פרימיום",
    "warningNote": "לוודא: ללא תוספת אבקת שום ובצל",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_94",
    "category": "spices",
    "name": "פפריקה מעושנת ספרדית טהורה",
    "safeBrand": "La Chinata Pimentón de la Vera",
    "warningNote": "טעם מעושן עמוק 100% פפריקה טהורה",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_95",
    "category": "spices",
    "name": "פפריקה חריפה טהורה",
    "safeBrand": "תבליני מימון / טעם וריח",
    "warningNote": "100% פלפלים חריפים יבשים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_96",
    "category": "spices",
    "name": "פפריקה מתוקה מרוקאית בשמן פרימיום",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "צבע עשיר ושמן טהור",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_97",
    "category": "spices",
    "name": "סומאק טבעי טהור ללא תוספות",
    "safeBrand": "חוות דרך התבלינים / שוק לוינסקי טהור",
    "warningNote": "זהירות: לוודא סומאק טבעי ללא חומצת לימון מלאכותית ומלח!",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_98",
    "category": "spices",
    "name": "עלי זעתר מיובשים טהורים (ללא שום)",
    "safeBrand": "תבליני פרג / דרך התבלינים",
    "warningNote": "לוודא תערובת מסורתית: עלי זעתר, שומשום קלוי, סומאק ומלח בלבד",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_99",
    "category": "spices",
    "name": "אורגנו מיובש ים תיכוני טהור",
    "safeBrand": "Drogheria / תבליני טעם וריח",
    "warningNote": "100% עלי אורגנו מיובשים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_100",
    "category": "spices",
    "name": "טימין (קורנית) מיובש טהור",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "מתאים לעופות, דגים ומרקים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_101",
    "category": "spices",
    "name": "רוזמרין מיובש טהור",
    "safeBrand": "תבליני מימון",
    "warningNote": "ארומטי ומחטא מעיים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_102",
    "category": "spices",
    "name": "גבעולי רוזמרין טריים",
    "safeBrand": "עשבי תיבול טריים מהמקרר",
    "warningNote": "לצליית בשרים וירקות שורש",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_103",
    "category": "spices",
    "name": "גבעולי טימין טריים",
    "safeBrand": "עשבי תיבול טריים",
    "warningNote": "עדין וארומטי",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_104",
    "category": "spices",
    "name": "גבעולי טימין לימוני טרי",
    "safeBrand": "משק תבלינים",
    "warningNote": "ניחוח הדרי מעולה לדגים",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_105",
    "category": "spices",
    "name": "שמיר יבש טחון טהור",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "טעם עשיר לדגים וקישואים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_106",
    "category": "spices",
    "name": "פטרוזיליה יבשה טהורה",
    "safeBrand": "תבליני מימון",
    "warningNote": "100% עלים מיובשים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_107",
    "category": "spices",
    "name": "זרעי כוסברה טחונים טהורים",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "מעולה לקציצות ולבישול הודי/אסייתי",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_108",
    "category": "spices",
    "name": "זרעי כוסברה שלמים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "לכבישה ותבשילי קדירה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_109",
    "category": "spices",
    "name": "זרעי שומר שלמים (במידה מדודה)",
    "safeBrand": "תבליני פרג טהור",
    "warningNote": "מרגיע גזים ועוויתות מעיים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_110",
    "category": "spices",
    "name": "זרעי אניס שלמים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "ארומטי לתה ולדגים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_111",
    "category": "spices",
    "name": "זרעי חרדל צהובים שלמים",
    "safeBrand": "תבליני מימון",
    "warningNote": "לכבישת מלפפונים חמוצים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_112",
    "category": "spices",
    "name": "זרעי חרדל שחורים שלמים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "למוקפצים ותבשילים הודיים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_113",
    "category": "spices",
    "name": "הל ירוק טחון טהור (Cardamom)",
    "safeBrand": "תבליני טעם וריח / חוות דרך התבלינים",
    "warningNote": "ארומה משובחת לקפה ולתבשילי בשר",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_114",
    "category": "spices",
    "name": "תרמילי הל ירוק שלמים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "לבישול עם אורז בסמטי",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_115",
    "category": "spices",
    "name": "ג׳ינג׳ר יבש טחון טהור",
    "safeBrand": "תבליני מימון / טעם וריח",
    "warningNote": "תומך בתנועתיות המעי (MMC)",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_116",
    "category": "spices",
    "name": "קינמון ציילוני טהור (Ceylon Cinnamon)",
    "safeBrand": "תבואות / Organic Ceylon / שופרסל גרין",
    "warningNote": "עדיף על קינמון קסיה, בטוח לכבד ולמעיים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_117",
    "category": "spices",
    "name": "מקלות קינמון ציילוני שלמים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "לחליטות תה ותבשילי בקר",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_118",
    "category": "spices",
    "name": "אגוז מוסקט שלם לגירור טרי",
    "safeBrand": "Drogheria / תבליני פרג",
    "warningNote": "לגרר מעט על תפוחי אדמה ומרקים",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_119",
    "category": "spices",
    "name": "מסמרי ציפורן שלמים (Cloves)",
    "safeBrand": "תבליני מימון",
    "warningNote": "מחטא טבעי עשיר ביוגנול",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_120",
    "category": "spices",
    "name": "ציפורן טחונה טהורה",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "לתיבול עדין",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_121",
    "category": "spices",
    "name": "זרעי כרוויה (קימל) טהורים",
    "safeBrand": "תבליני מימון",
    "warningNote": "מקל על עיכול פחמימות",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_122",
    "category": "spices",
    "name": "עלי דפנה יבשים שלמים (Bay Leaves)",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "לתבשילי קדירה, מרקים וציר עוף",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_123",
    "category": "spices",
    "name": "זרעי חילבה טחונים טהורים",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "איזון סוכר בדם",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_124",
    "category": "spices",
    "name": "גרגירי פלפל אנגלי שלמים (Allspice)",
    "safeBrand": "תבליני מימון",
    "warningNote": "לציר בקר ועוף",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_125",
    "category": "spices",
    "name": "פלפל אנגלי טחון טהור",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "לתיבול קציצות בקר",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_126",
    "category": "spices",
    "name": "זרעי שומשום לבן טבעי (לא קלוי)",
    "safeBrand": "שופרסל גרין / תבואות",
    "warningNote": "עשיר בסידן טבעי",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_127",
    "category": "spices",
    "name": "זרעי שומשום שחור טבעי",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "לקישוט סלמון וסושי",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_128",
    "category": "spices",
    "name": "חוטי זעפרן טהור (Saffron)",
    "safeBrand": "חוות דרך התבלינים / קשמיר טהור",
    "warningNote": "תבלין יוקרתי לאורז ודגים",
    "unit": "גרם"
  },
  {
    "id": "sibo_shop_129",
    "category": "spices",
    "name": "גרידת קליפת לימון מיובשת טבעית",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "ארומה לימונית עשירה",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_130",
    "category": "spices",
    "name": "גרידת קליפת תפוז מיובשת",
    "safeBrand": "דרך התבלינים",
    "warningNote": "לתיבול עוף ודגים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_131",
    "category": "spices",
    "name": "עלי מרווה מיובשים טהורים",
    "safeBrand": "תבליני מימון",
    "warningNote": "מחטא גרון ומערכת עיכול",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_132",
    "category": "spices",
    "name": "עלי מליסה מיובשים לחליטה",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "מרגיע שרירי מעיים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_133",
    "category": "spices",
    "name": "עלי נענע יבשים טהורים",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "לסלטים, יוגורט עיזים ותה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_134",
    "category": "spices",
    "name": "צ׳ילי חריף גרוס יבש (Chili Flakes)",
    "safeBrand": "Drogheria / מימון",
    "warningNote": "פתיתי צ׳ילי אדום טהור",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_135",
    "category": "spices",
    "name": "פלפל קאיין טהור טחון (Cayenne)",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "מעורר חילוף חומרים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_136",
    "category": "spices",
    "name": "קצח טבעי טהור (Nigella Sativa)",
    "safeBrand": "תבליני פרג טהור",
    "warningNote": "עשיר בתרכובות נוגדות דלקת",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_137",
    "category": "spices",
    "name": "תרמילי וניל מדגסקר שלמים",
    "safeBrand": "Nielsen-Massey / חוות התבלינים",
    "warningNote": "לגרד גרגירים למאפים ודייסות",
    "unit": "שפופרת"
  },
  {
    "id": "sibo_shop_138",
    "category": "spices",
    "name": "תמצית וניל טהורה 100% ללא סוכר",
    "safeBrand": "Nielsen-Massey Pure Vanilla Extract",
    "warningNote": "זהירות: תמציות זולות מכילות סירופ סוכר וונילין מלאכותי",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_139",
    "category": "spices",
    "name": "עשב לימון מיובש (Lemongrass)",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "לתבשילים אסייתיים ומרקים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_140",
    "category": "spices",
    "name": "מיורן מיובש טהור (Marjoram)",
    "safeBrand": "תבליני טעם וריח",
    "warningNote": "עשב תיבול עדין",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_141",
    "category": "spices",
    "name": "זרעי סלרי טחונים טהורים (Celery Seed)",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "לתיבול מרקים ללא בצל",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_142",
    "category": "spices",
    "name": "עלי קפיר ליים מיובשים (Kaffir Lime Leaves)",
    "safeBrand": "מזרח ומערב",
    "warningNote": "ארומה אסייתי למרקים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_143",
    "category": "spices",
    "name": "עלי צתרה מיובשים (Summer Savory)",
    "safeBrand": "חוות דרך התבלינים",
    "warningNote": "טעם עשבוני עדין לתבשילי קדירה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_144",
    "category": "sweets",
    "name": "שוקולד מריר 85% איכותי פרימיום",
    "safeBrand": "Lindt Excellence 85% Cocoa",
    "warningNote": "דל סוכר, עשיר בנוגדי חמצון — הפינוק המתוק הבטוח של ניר",
    "unit": "חפיסה"
  },
  {
    "id": "sibo_shop_145",
    "category": "sweets",
    "name": "שוקולד מריר 90% קקאו טהור",
    "safeBrand": "Lindt Excellence 90%",
    "warningNote": "כמעט ללא סוכר כלל (בטוח ל-SIBO)",
    "unit": "חפיסה"
  },
  {
    "id": "sibo_shop_146",
    "category": "sweets",
    "name": "שוקולד מריר 99% קקאו אבסולוטי",
    "safeBrand": "Lindt Excellence 99%",
    "warningNote": "ללא סוכר מוסף — 100% שומן קקאו ומוצקי קקאו",
    "unit": "חפיסה"
  },
  {
    "id": "sibo_shop_147",
    "category": "sweets",
    "name": "שוקולד מריר 70% אקוודור אורגני",
    "safeBrand": "Vivani 70% Organic",
    "warningNote": "בטוח עד 30 גרם (2 קוביות)",
    "unit": "חפיסה"
  },
  {
    "id": "sibo_shop_148",
    "category": "sweets",
    "name": "שוקולד מריר עם גבישי מלח ים 85%",
    "safeBrand": "Lindt Excellence Sea Salt 85%",
    "warningNote": "מעדן מתוק-מלוח דל סוכר",
    "unit": "חפיסה"
  },
  {
    "id": "sibo_shop_149",
    "category": "sweets",
    "name": "שוקולד מריר עם שבבי שקדים 85%",
    "safeBrand": "Lindt Almond Dark 85%",
    "warningNote": "קראנצ׳י ומשביע",
    "unit": "חפיסה"
  },
  {
    "id": "sibo_shop_150",
    "category": "sweets",
    "name": "שוקולד מריר עם פולי קקאו גרוסים 85%",
    "safeBrand": "Lindt Cocoa Nibs Dark 85%",
    "warningNote": "מרקם קראנצ׳י עשיר",
    "unit": "חפיסה"
  },
  {
    "id": "sibo_shop_151",
    "category": "sweets",
    "name": "פתיתי שוקולד מריר 85% לאפייה",
    "safeBrand": "Callebaut GF Dark Drops",
    "warningNote": "0% חלב וגלוטן",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_152",
    "category": "sweets",
    "name": "פולי קקאו גרוסים נא (Cacao Nibs)",
    "safeBrand": "Navitas Organics / תבואות",
    "warningNote": "שוקולד בצורתו הגולמית — 0% סוכר, עשיר במגנזיום",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_153",
    "category": "sweets",
    "name": "אבקת קקאו הולנדי טהורה 100% ללא סוכר",
    "safeBrand": "Callebaut / שופרסל גרין קקאו",
    "warningNote": "להכנת שוקו חם עם חלב שקדים ומייפל",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_154",
    "category": "sweets",
    "name": "אבקת חרוב טהורה 100% ללא סוכר",
    "safeBrand": "תבואות",
    "warningNote": "מתיקות טבעית עדינה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_155",
    "category": "sweets",
    "name": "חמאת קקאו טבעית למאפים",
    "safeBrand": "תבואות אורגני",
    "warningNote": "שומן טהור להכנת קינוחים",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_156",
    "category": "sweets",
    "name": "סירופ מייפל טהור 100% דרגת Grade A Amber",
    "safeBrand": "Maple Joe / Kirkland 100% Pure Maple",
    "warningNote": "זהירות: לא לקנות \"רוטב בטעם מייפל\" המכיל סירופ גלוקוז!",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_157",
    "category": "sweets",
    "name": "סירופ מייפל כהה עשיר (Grade A Dark)",
    "safeBrand": "Maple Joe Dark Amber",
    "warningNote": "טעם קרמלי עמוק ובטוח",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_158",
    "category": "sweets",
    "name": "סירופ מייפל אורגני טהור מקנדה",
    "safeBrand": "הרדוף / שופרסל גרין",
    "warningNote": "100% מייפל טהור",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_159",
    "category": "sweets",
    "name": "סוכר קוקוס אורגני טבעי (במידה מדודה)",
    "safeBrand": "תבואות אורגני",
    "warningNote": "אינדקס גליקמי נמוך — עד 1 כפית למנה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_160",
    "category": "sweets",
    "name": "שבבי קוקוס קלויים ללא סוכר",
    "safeBrand": "שקדיה / B&D",
    "warningNote": "נשנוש פריך ומתקתק",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_161",
    "category": "sweets",
    "name": "שבבי קוקוס לבנים טבעיים (Coconut Flakes)",
    "safeBrand": "שופרסל גרין",
    "warningNote": "לקישוט דייסות ופנקייקים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_162",
    "category": "sweets",
    "name": "מחית וניל טהורה 100% (Vanilla Bean Paste)",
    "safeBrand": "Nielsen-Massey Vanilla Paste",
    "warningNote": "גרגרי וניל טהורים לקינוחים",
    "unit": "שפופרת"
  },
  {
    "id": "sibo_shop_163",
    "category": "sweets",
    "name": "אבקת וניל בורבון טהורה 100% ללא סוכר",
    "safeBrand": "חוות דרך התבלינים / תבליני טעם וריח",
    "warningNote": "ארומה משובחת",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_164",
    "category": "sweets",
    "name": "ממרח אגוזי לוז וקקאו טבעי ללא סוכר",
    "safeBrand": "ראסטיס 100% לוז וקקאו",
    "warningNote": "0% שמן דקלים וסוכר לבן",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_165",
    "category": "sweets",
    "name": "ממרח שקדים וקקאו טבעי ללא סוכר",
    "safeBrand": "ראסטיס 100% שקדים וקקאו",
    "warningNote": "עשיר בחלבון ושומן בריא",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_166",
    "category": "sweets",
    "name": "תות שדה קפוא 100% טבעי לשייקים וארטיקים",
    "safeBrand": "סנפרוסט תות שדה",
    "warningNote": "ללא תוספת סוכר",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_167",
    "category": "sweets",
    "name": "פטל אדום קפוא 100% טבעי לריבות וקינוחים",
    "safeBrand": "סנפרוסט פטל אדום",
    "warningNote": "דל סוכר ועשיר בנוגדי חמצון",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_168",
    "category": "sweets",
    "name": "אוכמניות כחולות קפואות 100% טבעי",
    "safeBrand": "סנפרוסט אוכמניות",
    "warningNote": "לשייקים ופודינג",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_169",
    "category": "sweets",
    "name": "אננס קפוא 100% טבעי לסורבה",
    "safeBrand": "סנפרוסט אננס",
    "warningNote": "ללא סוכר מוסף",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_170",
    "category": "sweets",
    "name": "קמח שקדים דק מנופה לעוגות ופנקייקים",
    "safeBrand": "שקדיה פרימיום",
    "warningNote": "בסיס לכל אפייה בריאה ל-SIBO",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_171",
    "category": "sweets",
    "name": "שקיקי ג׳לטין טהור 100% בקר מאושר לקינוחים",
    "safeBrand": "Great Lakes Pure Gelatin / תבואות",
    "warningNote": "להכנת גומי וג׳לי בריאותי",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_172",
    "category": "sweets",
    "name": "תבניות סיליקון לארטיקים ביתיים (ארבעה שקעים)",
    "safeBrand": "ארקוסטיל / Fox Home",
    "warningNote": "תבניות נוחות להכנת ארטיק תות",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_173",
    "category": "sweets",
    "name": "תבניות סיליקון לסוכריות גומי קטנות",
    "safeBrand": "ארקוסטיל סיליקון",
    "warningNote": "להכנת גומי ג׳לטין ביתי",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_174",
    "category": "sweets",
    "name": "אבקת חלבון קולגן פפטידים ללא טעם",
    "safeBrand": "Vital Proteins Collagen Peptides",
    "warningNote": "נמס מיד בשוקו חם ומשקאות",
    "unit": "מכל"
  },
  {
    "id": "sibo_shop_175",
    "category": "sweets",
    "name": "חטיף שוקולד מריר 85% אישי",
    "safeBrand": "Lindt Sticks Dark 85%",
    "warningNote": "מנה מדודה לנסיעות",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_176",
    "category": "sweets",
    "name": "סוכריות מנטה טבעיות ללא סוכר וללא פוליאולים",
    "safeBrand": "Simply Peppermint Mints",
    "warningNote": "לבדוק רכיבים: ללא סורביטול ומלטיטול",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_177",
    "category": "sweets",
    "name": "פולי קפה ירוק לא קלוי",
    "safeBrand": "שופרסל גרין",
    "warningNote": "עשיר בחומצה כלורוגנית",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_178",
    "category": "veggies_fruits",
    "name": "מלפפונים ישראליים פריכים",
    "safeBrand": "טרי מהשוק / שופרסל גרין",
    "warningNote": "0% פרוקטנים — ירק הדגל של SIBO",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_179",
    "category": "veggies_fruits",
    "name": "מלפפוני בייבי קראנצ׳יים",
    "safeBrand": "משק חקלאי",
    "warningNote": "נשנוש בטוח ומרענן",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_180",
    "category": "veggies_fruits",
    "name": "מלפפונים הולנדים ארוכים",
    "safeBrand": "שופרסל גרין",
    "warningNote": "דקי קליפה ודלי חרצנים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_181",
    "category": "veggies_fruits",
    "name": "מלפפוני חממה דקים",
    "safeBrand": "משק חממות",
    "warningNote": "ללא מרירות",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_182",
    "category": "veggies_fruits",
    "name": "קישואים ירוקים בהירים",
    "safeBrand": "טרי מהשוק",
    "warningNote": "בטוח ללא הגבלה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_183",
    "category": "veggies_fruits",
    "name": "זוקיני ירוק כהה פרימיום",
    "safeBrand": "שופרסל גרין",
    "warningNote": "מושלם לזודלס (אטריות קישואים)",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_184",
    "category": "veggies_fruits",
    "name": "זוקיני צהוב",
    "safeBrand": "משק בוטיק",
    "warningNote": "צבע וטעם עדין",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_185",
    "category": "veggies_fruits",
    "name": "קישואים עגולים למילוי",
    "safeBrand": "שוק טרי",
    "warningNote": "למילוי בבשר בקר ואורז בסמטי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_186",
    "category": "veggies_fruits",
    "name": "קישואי בייבי עדינים",
    "safeBrand": "שוק איכרים",
    "warningNote": "לצלייה שלמה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_187",
    "category": "veggies_fruits",
    "name": "עלי בייבי תרד שטופים",
    "safeBrand": "אחלה / שופרסל גרין / שטראוס",
    "warningNote": "עשיר בברזל, בטוח 100%",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_188",
    "category": "veggies_fruits",
    "name": "עלי תרד ניו-זילנדי טרי",
    "safeBrand": "טרי מחקלאי",
    "warningNote": "מעולה לאידוי ומרקים",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_189",
    "category": "veggies_fruits",
    "name": "תרד תורכי טרי עבה",
    "safeBrand": "שוק טרי",
    "warningNote": "לתבשילי מחבת ופריטטה",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_190",
    "category": "veggies_fruits",
    "name": "תרד קפוא שלם עדין",
    "safeBrand": "סנפרוסט עדין",
    "warningNote": "לשקשוקות ירוקות",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_191",
    "category": "veggies_fruits",
    "name": "פלפל אדום מתוק (גמבה)",
    "safeBrand": "שופרסל טרי",
    "warningNote": "עשיר בוויטמין C, דל פודמאפ",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_192",
    "category": "veggies_fruits",
    "name": "פלפל צהוב מתוק",
    "safeBrand": "טרי מהשוק",
    "warningNote": "דל פודמאפ",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_193",
    "category": "veggies_fruits",
    "name": "פלפל כתום מתוק",
    "safeBrand": "שופרסל גרין",
    "warningNote": "דל פודמאפ",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_194",
    "category": "veggies_fruits",
    "name": "פלפל חריף ירוק (חלפניו / שיפקה טרי)",
    "safeBrand": "שוק טרי",
    "warningNote": "קפסאיצין טבעי",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_195",
    "category": "veggies_fruits",
    "name": "פלפל צ׳ילי אדום טרי",
    "safeBrand": "שוק טרי",
    "warningNote": "לתיבול מוקפצים",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_196",
    "category": "veggies_fruits",
    "name": "פלפל שושקה אדום מתוק",
    "safeBrand": "שופרסל פרימיום",
    "warningNote": "מתוק ודל פודמאפ",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_197",
    "category": "veggies_fruits",
    "name": "פלפלוני טינקרבל מתוקים",
    "safeBrand": "משק שרי",
    "warningNote": "נשנוש קראנצ׳י",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_198",
    "category": "veggies_fruits",
    "name": "פלפל חריף הבנרו (בזהירות טיפה)",
    "safeBrand": "שוק איכרים",
    "warningNote": "חריפות עזה",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_199",
    "category": "veggies_fruits",
    "name": "גזרים כתומים טריים ומוצקים",
    "safeBrand": "שופרסל גרין",
    "warningNote": "בטוח ללא הגבלה בכל שלב",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_200",
    "category": "veggies_fruits",
    "name": "גזרי בייבי שטופים וקלופים",
    "safeBrand": "מארז סגור",
    "warningNote": "נשנוש מהיר",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_201",
    "category": "veggies_fruits",
    "name": "גזר צבעוני (סגול/צהוב)",
    "safeBrand": "משק איכרים",
    "warningNote": "נוגדי חמצון מרובים",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_202",
    "category": "veggies_fruits",
    "name": "גזר ננסי טרי עם עלים",
    "safeBrand": "שוק איכרים",
    "warningNote": "לצלייה בתנור",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_203",
    "category": "veggies_fruits",
    "name": "גזר גמדי קפוא",
    "safeBrand": "סנפרוסט",
    "warningNote": "לאידוי מהיר",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_204",
    "category": "veggies_fruits",
    "name": "דלעת יפנית (קבוצ׳ה)",
    "safeBrand": "שוק איכרים / שופרסל גרין",
    "warningNote": "דלעת בטוחה ביותר ל-SIBO",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_205",
    "category": "veggies_fruits",
    "name": "דלורית טרייה",
    "safeBrand": "טרי מהשוק",
    "warningNote": "בטוח עד 45 גרם למנה",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_206",
    "category": "veggies_fruits",
    "name": "דלעת ערמונים",
    "safeBrand": "משק חקלאי",
    "warningNote": "עד 40 גרם למנה",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_207",
    "category": "veggies_fruits",
    "name": "דלעת טריפוליטאית כתומה",
    "safeBrand": "שוק טרי",
    "warningNote": "למרק צח",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_208",
    "category": "veggies_fruits",
    "name": "קוביות דלעת טרייה קלופה",
    "safeBrand": "שופרסל חתוך",
    "warningNote": "מוכן לבישול",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_209",
    "category": "veggies_fruits",
    "name": "לבבות חסה קיסר פריכים (רומיין)",
    "safeBrand": "שטראוס / מרינה / חסלט",
    "warningNote": "בטוח ללא הגבלה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_210",
    "category": "veggies_fruits",
    "name": "חסה רומית מיני (Little Gem)",
    "safeBrand": "חסלט",
    "warningNote": "פריכה ומתוקה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_211",
    "category": "veggies_fruits",
    "name": "חסה עגולה (אייסברג)",
    "safeBrand": "חסלט / שופרסל",
    "warningNote": "פריכה ומרעננת",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_212",
    "category": "veggies_fruits",
    "name": "חסה סלנובה ירוקה / אדומה",
    "safeBrand": "משק חקלאי",
    "warningNote": "עדינה ורעננה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_213",
    "category": "veggies_fruits",
    "name": "חסה ערבית מסורתית",
    "safeBrand": "שוק טרי",
    "warningNote": "0% תסיסה",
    "unit": "ראש"
  },
  {
    "id": "sibo_shop_214",
    "category": "veggies_fruits",
    "name": "חסה מסולסלת אדומה (לולו רוסו)",
    "safeBrand": "חסלט",
    "warningNote": "לסלטים עשירים",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_215",
    "category": "veggies_fruits",
    "name": "חסה משי (חמאה)",
    "safeBrand": "משק חקלאי",
    "warningNote": "עלים רכים ונמסים",
    "unit": "ראש"
  },
  {
    "id": "sibo_shop_216",
    "category": "veggies_fruits",
    "name": "עלי רוקט (ארוגולה) טריים",
    "safeBrand": "שופרסל גרין / חסלט",
    "warningNote": "טעם פלפלי עשיר בנוגדי חמצון",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_217",
    "category": "veggies_fruits",
    "name": "עלי מנגולד (סלק עלים)",
    "safeBrand": "טרי מהשוק",
    "warningNote": "לחתוך את העלים הירוקים",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_218",
    "category": "veggies_fruits",
    "name": "עלי קייל טריים",
    "safeBrand": "שופרסל גרין",
    "warningNote": "עשיר בסידן, לקצוץ דק",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_219",
    "category": "veggies_fruits",
    "name": "קייל סגול (Lacinato/Dinosaur)",
    "safeBrand": "משק אורגני",
    "warningNote": "עשיר במינרלים",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_220",
    "category": "veggies_fruits",
    "name": "עלי אנדיב (עולש) לבן/סגול",
    "safeBrand": "חוות תקוע",
    "warningNote": "מרירות עדינה התומכת בייצור מיצי מרה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_221",
    "category": "veggies_fruits",
    "name": "עלי טטסוי (Tatsoi)",
    "safeBrand": "משק חקלאי",
    "warningNote": "עלי חרדל עדינים למוקפץ",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_222",
    "category": "veggies_fruits",
    "name": "עלי בוק צ׳וי ירוקים (עד 75 גרם למנה)",
    "safeBrand": "שופרסל גרין / חוות תקוע",
    "warningNote": "להפריד עלים ולשלב במוקפצים",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_223",
    "category": "veggies_fruits",
    "name": "צנוניות אדומות פריכות",
    "safeBrand": "שוק טרי / חסלט",
    "warningNote": "קראנצ׳י ומרענן, 0% תסיסה",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_224",
    "category": "veggies_fruits",
    "name": "צנון לבן (דייקון)",
    "safeBrand": "שוק איכרים",
    "warningNote": "לסלטים אסייתיים",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_225",
    "category": "veggies_fruits",
    "name": "צנונית שחורה רפואית",
    "safeBrand": "שוק איכרים",
    "warningNote": "תומכת בכבד",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_226",
    "category": "veggies_fruits",
    "name": "צנונית אבטיח (Watermelon Radish)",
    "safeBrand": "משק בוטיק",
    "warningNote": "צבע מרהיב לסלט",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_227",
    "category": "veggies_fruits",
    "name": "עגבניות שרי אדומות",
    "safeBrand": "משק שרי / שופרסל גרין",
    "warningNote": "עד 4-5 יח׳ למנה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_228",
    "category": "veggies_fruits",
    "name": "עגבניות שרי תמר מתוקות",
    "safeBrand": "שופרסל גרין",
    "warningNote": "בטוח במידה מדודה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_229",
    "category": "veggies_fruits",
    "name": "עגבניות מגי טריות ומוצקות",
    "safeBrand": "שופרסל פרימיום",
    "warningNote": "עד חצי עגבניה למנה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_230",
    "category": "veggies_fruits",
    "name": "עגבניות שרי צהובות",
    "safeBrand": "שופרסל גרין",
    "warningNote": "פחות חומציות",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_231",
    "category": "veggies_fruits",
    "name": "עגבניות שוקולד חומות",
    "safeBrand": "משק שרי",
    "warningNote": "עשירות בליקופן",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_232",
    "category": "veggies_fruits",
    "name": "עגבניות שרי מנומרות (זברה)",
    "safeBrand": "משק איכרים",
    "warningNote": "דלות סוכר",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_233",
    "category": "veggies_fruits",
    "name": "חצילים בלאדי קטנים וקלים",
    "safeBrand": "שוק טרי",
    "warningNote": "בטוח עד 75 גרם למנה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_234",
    "category": "veggies_fruits",
    "name": "חציל יפני ארוך ודק",
    "safeBrand": "שוק איכרים",
    "warningNote": "מעט גרעינים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_235",
    "category": "veggies_fruits",
    "name": "חצילונים ננסיים",
    "safeBrand": "משק בוטיק",
    "warningNote": "לצלייה שלמה",
    "unit": "סלסילה"
  },
  {
    "id": "sibo_shop_236",
    "category": "veggies_fruits",
    "name": "בצל ירוק (החלק הירוק בלבד!)",
    "safeBrand": "חסלט / שופרסל",
    "warningNote": "אזהרה קריטית: להשתמש אך ורק בעלים הירוקים! לזרוק את הפקעת הלבנה (מלאה פרוקטנים)!",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_237",
    "category": "veggies_fruits",
    "name": "עירית טרייה דקה (Chives)",
    "safeBrand": "עשבי תיבול טריים",
    "warningNote": "תחליף שום/בצל ירוק בטוח לחלוטין",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_238",
    "category": "veggies_fruits",
    "name": "עירית שום (Garlic Chives עלי עירית ירוקים)",
    "safeBrand": "עשבי תיבול שוק",
    "warningNote": "טעם שום עדין 0% פרוקטנים",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_239",
    "category": "veggies_fruits",
    "name": "פטרוזיליה טרייה",
    "safeBrand": "חסלט שטוף",
    "warningNote": "0% תסיסה, עשיר בוויטמין C",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_240",
    "category": "veggies_fruits",
    "name": "פטרוזיליה מסולסלת",
    "safeBrand": "חסלט",
    "warningNote": "לקישוט וסלטים",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_241",
    "category": "veggies_fruits",
    "name": "פטרוזיליה שורש טרי",
    "safeBrand": "שוק טרי",
    "warningNote": "למרק עוף צח",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_242",
    "category": "veggies_fruits",
    "name": "שמיר טרי",
    "safeBrand": "חסלט",
    "warningNote": "מרגיע קיבה",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_243",
    "category": "veggies_fruits",
    "name": "כוסברה טרייה",
    "safeBrand": "חסלט",
    "warningNote": "לסלטים ותבשילים",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_244",
    "category": "veggies_fruits",
    "name": "בזיליקום טרי ריחני",
    "safeBrand": "עשבי תיבול",
    "warningNote": "לפסטו ביתי",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_245",
    "category": "veggies_fruits",
    "name": "בזיליקום תאילנדי (סגול)",
    "safeBrand": "משק אסייתי",
    "warningNote": "למוקפצים",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_246",
    "category": "veggies_fruits",
    "name": "בזיליקום לימוני",
    "safeBrand": "משק בוטיק",
    "warningNote": "ארומה רעננה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_247",
    "category": "veggies_fruits",
    "name": "נענע טרייה",
    "safeBrand": "חסלט",
    "warningNote": "לתה וסלטים",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_248",
    "category": "veggies_fruits",
    "name": "עלי מנטה חריפה טרייה (Peppermint)",
    "safeBrand": "משק תבלינים",
    "warningNote": "מרגיע עוויתות מעיים",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_249",
    "category": "veggies_fruits",
    "name": "עלי טרגון טריים",
    "safeBrand": "עשבי תיבול מיוחדים",
    "warningNote": "לדגים ועופות",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_250",
    "category": "veggies_fruits",
    "name": "עלי אורגנו טריים",
    "safeBrand": "עשבי תיבול",
    "warningNote": "לסלטים יווניים",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_251",
    "category": "veggies_fruits",
    "name": "עלי מרווה טריים",
    "safeBrand": "עשבי תיבול",
    "warningNote": "לטעמי חמאת גהי",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_252",
    "category": "veggies_fruits",
    "name": "עלי לואיזה (לימון ורבנה) טריים",
    "safeBrand": "משק תבלינים",
    "warningNote": "לתה מרגיע עיכול",
    "unit": "צרור"
  },
  {
    "id": "sibo_shop_253",
    "category": "veggies_fruits",
    "name": "שורש ג׳ינג׳ר טרי ומוצק",
    "safeBrand": "שופרסל גרין",
    "warningNote": "תומך בתנועתיות המעיים ומנקה חיידקים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_254",
    "category": "veggies_fruits",
    "name": "שורש גלנגל טרי (Galangal)",
    "safeBrand": "מזרח ומערב / משק אסייתי",
    "warningNote": "למרק טום יאם בטוח",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_255",
    "category": "veggies_fruits",
    "name": "נבטי אלפלפה טריים",
    "safeBrand": "שופרסל גרין / משק",
    "warningNote": "0% פרוקטנים, בטוח לחלוטין",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_256",
    "category": "veggies_fruits",
    "name": "נבטי חמנייה עבים",
    "safeBrand": "משק",
    "warningNote": "קראנצ׳י ומשביע",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_257",
    "category": "veggies_fruits",
    "name": "נבטי ברוקולי (Sulforaphane)",
    "safeBrand": "משק בריאות",
    "warningNote": "עשיר בסולפוראפאן נוגד דלקת",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_258",
    "category": "veggies_fruits",
    "name": "נבטי צנונית חריפים",
    "safeBrand": "משק",
    "warningNote": "טעם פיקנטי מרענן",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_259",
    "category": "veggies_fruits",
    "name": "נבטי חרדל ירוקים",
    "safeBrand": "משק בוטיק",
    "warningNote": "עשירים בנוגדי חמצון",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_260",
    "category": "veggies_fruits",
    "name": "מיקרו-ירוקים כוסברה טרייה",
    "safeBrand": "משק עלים",
    "warningNote": "ריכוז ויטמינים גבוה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_261",
    "category": "veggies_fruits",
    "name": "נבטי אפונה ירוקה (מדוד)",
    "safeBrand": "משק חקלאי",
    "warningNote": "קראנצ׳י ורענן",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_262",
    "category": "veggies_fruits",
    "name": "פטריות אויסטר (יער) טריות",
    "safeBrand": "חוות תקוע / מרינה",
    "warningNote": "הפטריות היחידות שבטוחות 100% ל-SIBO!",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_263",
    "category": "veggies_fruits",
    "name": "פטריות מלך היער (King Oyster)",
    "safeBrand": "חוות תקוע",
    "warningNote": "מרקם בשרני בטוח",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_264",
    "category": "veggies_fruits",
    "name": "פטריות שימג׳י לבנות (עד 35 גרם למנה)",
    "safeBrand": "חוות תקוע",
    "warningNote": "בטוח בכמות מדודה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_265",
    "category": "veggies_fruits",
    "name": "פטריות שימג׳י חומות (מדוד)",
    "safeBrand": "חוות תקוע",
    "warningNote": "כמות מדודה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_266",
    "category": "veggies_fruits",
    "name": "במבה ירוקה (במיה טרייה)",
    "safeBrand": "שוק טרי",
    "warningNote": "בטוח עד 8 יח׳",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_267",
    "category": "veggies_fruits",
    "name": "במיה הודית ארוכה",
    "safeBrand": "שוק אסייתי",
    "warningNote": "לצלייה מהירה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_268",
    "category": "veggies_fruits",
    "name": "לוביה ירוקה טרייה (שעועית ארוכה)",
    "safeBrand": "שוק איכרים",
    "warningNote": "בטוח במידה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_269",
    "category": "veggies_fruits",
    "name": "שורש סלרי (רק לבישול בציר וסינון)",
    "safeBrand": "שופרסל",
    "warningNote": "לבשל במרק ולסנן",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_270",
    "category": "veggies_fruits",
    "name": "גבעולי סלרי אמריקאי (עד 1/4 גבעול למנה)",
    "safeBrand": "חסלט",
    "warningNote": "כמות מדודה בלבד",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_271",
    "category": "veggies_fruits",
    "name": "שעועית ירוקה עדינה קפואה",
    "safeBrand": "סנפרוסט עדין",
    "warningNote": "בטוח עד 75 גרם למנה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_272",
    "category": "veggies_fruits",
    "name": "שעועית צהובה עדינה קפואה",
    "safeBrand": "סנפרוסט",
    "warningNote": "בטוח עד 75 גרם",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_273",
    "category": "veggies_fruits",
    "name": "ברוקולי ראשים טריים (פרחים בלבד עד 45 גרם)",
    "safeBrand": "שופרסל גרין",
    "warningNote": "להימנע מהגבעולים העבים",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_274",
    "category": "veggies_fruits",
    "name": "כרוב ניצנים טרי (עד 2 יח׳ מבושלות)",
    "safeBrand": "שוק טרי",
    "warningNote": "כמות מדודה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_275",
    "category": "veggies_fruits",
    "name": "לבבות דקל בשימורים",
    "safeBrand": "שופרסל / וילי פוד",
    "warningNote": "רכיבים: לבבות דקל, מים ומלח בלבד",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_276",
    "category": "veggies_fruits",
    "name": "ערמוני מים בשימורים (Water Chestnuts)",
    "safeBrand": "Taste of Asia",
    "warningNote": "קראנצ׳י ודל פודמאפ למוקפץ",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_277",
    "category": "veggies_fruits",
    "name": "נצרי במבוק בשימורים (Bamboo Shoots)",
    "safeBrand": "Taste of Asia",
    "warningNote": "0% פרוקטנים למוקפצים",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_278",
    "category": "veggies_fruits",
    "name": "תות שדה טרי מתוק",
    "safeBrand": "משק תותים / שופרסל גרין",
    "warningNote": "פרי הדגל של SIBO — דל פודמאפ ובטוח עד 140 גרם (5-6 תותים)",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_279",
    "category": "veggies_fruits",
    "name": "אוכמניות כחולות טריות (Blueberries)",
    "safeBrand": "שופרסל גרין / ברי פלוס",
    "warningNote": "עשיר בנוגדי חמצון, בטוח עד 1 כוס",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_280",
    "category": "veggies_fruits",
    "name": "פטל אדום טרי (Raspberries)",
    "safeBrand": "ברי פלוס",
    "warningNote": "בטוח עד 45 גרם",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_281",
    "category": "veggies_fruits",
    "name": "פטל שחור טרי (Blackberries)",
    "safeBrand": "ברי פלוס",
    "warningNote": "עד 20 גרם (3-4 יח׳)",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_282",
    "category": "veggies_fruits",
    "name": "חמוציות טריות (שלמות ללא סוכר)",
    "safeBrand": "ברי פלוס",
    "warningNote": "לבשל עם מייפל טהור",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_283",
    "category": "veggies_fruits",
    "name": "בננה צהובה-ירוקה (לא בשלה מדי!)",
    "safeBrand": "שופרסל טרי",
    "warningNote": "דגש קליני: בננה ירוקה מכילה עמילן עמיד ובטוחה. בננה בשלה מנוקדת מלאה סוכרים חופשיים!",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_284",
    "category": "veggies_fruits",
    "name": "בננות בייבי קטנות מוצקות",
    "safeBrand": "שוק טרי",
    "warningNote": "1 בננה קטנה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_285",
    "category": "veggies_fruits",
    "name": "פלנטיין ירוק (בננה לבישול)",
    "safeBrand": "שוק לוינסקי",
    "warningNote": "עשיר בעמילן עמיד מזין",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_286",
    "category": "veggies_fruits",
    "name": "קיווי ירוק קשה-בינוני",
    "safeBrand": "שופרסל גרין",
    "warningNote": "עשיר באקטינידין המסייע לפירוק חלבונים ויציאות",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_287",
    "category": "veggies_fruits",
    "name": "קיווי זהוב (Golden Kiwi)",
    "safeBrand": "שופרסל פרימיום",
    "warningNote": "בטוח עד 2 יחידות ביום",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_288",
    "category": "veggies_fruits",
    "name": "אננס טרי שלם",
    "safeBrand": "שוק טרי",
    "warningNote": "עשיר בברומליין — אנזים עיכול טבעי (בטוח עד כוס קוביות)",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_289",
    "category": "veggies_fruits",
    "name": "מלון כתום (קנטלופ) טרי",
    "safeBrand": "שוק טרי",
    "warningNote": "בטוח עד 3/4 כוס קוביות",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_290",
    "category": "veggies_fruits",
    "name": "מלון ירוק (טל דבש / Honeydew)",
    "safeBrand": "שוק טרי",
    "warningNote": "עד חצי כוס קוביות",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_291",
    "category": "veggies_fruits",
    "name": "מלון גליה ישראלי",
    "safeBrand": "טרי מהשוק",
    "warningNote": "בטוח עד 1/2 כוס",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_292",
    "category": "veggies_fruits",
    "name": "פפאיה טרייה בשלה",
    "safeBrand": "שוק איכרים",
    "warningNote": "עשירה בפפאין לפירוק מזון",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_293",
    "category": "veggies_fruits",
    "name": "לימונים צהובים עסיסיים",
    "safeBrand": "טרי מהשוק",
    "warningNote": "בטוח ללא הגבלה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_294",
    "category": "veggies_fruits",
    "name": "ליים ירוק ארומטי",
    "safeBrand": "שוק טרי",
    "warningNote": "למוקפצים ותה",
    "unit": "רשת"
  },
  {
    "id": "sibo_shop_295",
    "category": "veggies_fruits",
    "name": "תפוז מתוק לקילוף (1 קטן ביום)",
    "safeBrand": "שופרסל טרי",
    "warningNote": "לא כמיץ סחוט — לאכול כפרי שלם",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_296",
    "category": "veggies_fruits",
    "name": "קלמנטינות טריות",
    "safeBrand": "שוק טרי",
    "warningNote": "1 יח׳ ביום",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_297",
    "category": "veggies_fruits",
    "name": "מנדרינות מתוקות",
    "safeBrand": "שוק טרי",
    "warningNote": "1 קטנה ביום",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_298",
    "category": "veggies_fruits",
    "name": "אשכולית אדומה (עד חצי אשכולית)",
    "safeBrand": "שוק טרי",
    "warningNote": "עשירה בנוגדי חמצון",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_299",
    "category": "veggies_fruits",
    "name": "ענבים ירוקים / אדומים (עד 6 ענבים למנה)",
    "safeBrand": "שופרסל גרין",
    "warningNote": "כמות מדודה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_300",
    "category": "veggies_fruits",
    "name": "ענבי אצבעות מתוקים (במידה מדודה)",
    "safeBrand": "שוק טרי",
    "warningNote": "עד 5 ענבים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_301",
    "category": "veggies_fruits",
    "name": "פסיפלורה טרייה",
    "safeBrand": "שוק טרי",
    "warningNote": "עד 2 יח׳",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_302",
    "category": "veggies_fruits",
    "name": "גויאבה טרייה מוצקה (עד 1 קטנה)",
    "safeBrand": "שוק עונתי",
    "warningNote": "ללא סוכרים מוספים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_303",
    "category": "veggies_fruits",
    "name": "גויאבה תותית קטנה",
    "safeBrand": "משק פירות",
    "warningNote": "דלת סוכר",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_304",
    "category": "veggies_fruits",
    "name": "פרי הדר פומלה קלופה (במידה מדודה)",
    "safeBrand": "שוק טרי",
    "warningNote": "פלחים בודדים",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_305",
    "category": "veggies_fruits",
    "name": "פומלית ירוקה (מדוד)",
    "safeBrand": "שוק טרי",
    "warningNote": "פלחים בודדים",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_306",
    "category": "veggies_fruits",
    "name": "קרמבולה טרייה פרוסה",
    "safeBrand": "שוק איכרים",
    "warningNote": "דל סוכר",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_307",
    "category": "veggies_fruits",
    "name": "פיטאיה אדומה/לבנה (Dragon Fruit)",
    "safeBrand": "שוק איכרים",
    "warningNote": "דלה בפרוקטוז חופשי",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_308",
    "category": "veggies_fruits",
    "name": "סברס קלוף ומוכן (עד 1 יח׳)",
    "safeBrand": "שוק טרי",
    "warningNote": "סיבים עדינים",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_309",
    "category": "veggies_fruits",
    "name": "רימון שלם (גרגירים עד 1 כף לקישוט)",
    "safeBrand": "שוק טרי",
    "warningNote": "לקישוט סלטים בלבד",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_310",
    "category": "veggies_fruits",
    "name": "אבוקדו האס בשל מוצק",
    "safeBrand": "שופרסל גרין / גרנות",
    "warningNote": "אזהרה קריטית: אבוקדו מותר ב-SIBO בכמות מדודה בלבד (עד 30 גרם = 1/8 אבוקדו למנה)!",
    "unit": "רשת"
  },
  {
    "id": "sibo_shop_311",
    "category": "veggies_fruits",
    "name": "אבוקדו פוקרטה עונתי",
    "safeBrand": "משק חקלאי",
    "warningNote": "כמות מדודה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_312",
    "category": "veggies_fruits",
    "name": "אבוקדו ריד קיצי",
    "safeBrand": "משק גרנות",
    "warningNote": "כמות מדודה עד 30 גרם",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_313",
    "category": "veggies_fruits",
    "name": "קומקוואט (תפוז סיני קטן)",
    "safeBrand": "משק הדרים",
    "warningNote": "עד 4 יח׳ עם הקליפה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_314",
    "category": "meat_fish",
    "name": "קוביות פרגית עוף נקייה",
    "safeBrand": "טרי מהקצב / משק ארצי / שופרסל גרין",
    "warningNote": "לוודא: ללא תיבול, ללא מרינדה מוכנה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_315",
    "category": "meat_fish",
    "name": "סטייק פרגית שלם ללא עצם",
    "safeBrand": "טרי מהקצב",
    "warningNote": "נקי וטרי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_316",
    "category": "meat_fish",
    "name": "שיפודי פרגית מוכנים לצלייה (ללא תיבול)",
    "safeBrand": "קצב מובחר",
    "warningNote": "נקי ללא מרינדה",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_317",
    "category": "meat_fish",
    "name": "חזה עוף שלם טרי",
    "safeBrand": "עוף טוב / שופרסל טרי / משק",
    "warningNote": "נקי ללא תוספות מים ומלח",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_318",
    "category": "meat_fish",
    "name": "שניצל עוף דק פרוס טרי",
    "safeBrand": "טרי מהקצב",
    "warningNote": "לציפוי בקמח שקדים או פנקו ללא גלוטן",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_319",
    "category": "meat_fish",
    "name": "שניצל עוף עבה בסגנון אמריקאי",
    "safeBrand": "טרי מהקצב",
    "warningNote": "לטחון פנקו ללא גלוטן",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_320",
    "category": "meat_fish",
    "name": "רצועות חזה עוף להקפצה",
    "safeBrand": "עוף טוב",
    "warningNote": "טרי ללא תוספים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_321",
    "category": "meat_fish",
    "name": "כרעיים עוף טריים",
    "safeBrand": "טרי מהקצב",
    "warningNote": "נקי ללא תיבול",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_322",
    "category": "meat_fish",
    "name": "שוקי עוף טריים (פולקע)",
    "safeBrand": "משק ארצי / שופרסל",
    "warningNote": "נקי ללא תיבול",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_323",
    "category": "meat_fish",
    "name": "ירכי עוף טריות ללא עור",
    "safeBrand": "עוף טוב",
    "warningNote": "רזה וקל לצלייה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_324",
    "category": "meat_fish",
    "name": "כנפי עוף טריות",
    "safeBrand": "עוף טוב / שופרסל",
    "warningNote": "מעולה לצלייה בתנור",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_325",
    "category": "meat_fish",
    "name": "עוף שלם טרי למרק/צלייה",
    "safeBrand": "משק חקלאי",
    "warningNote": "אידיאלי לציר מרק עוף מרפא",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_326",
    "category": "meat_fish",
    "name": "עוף אורגני שלם",
    "safeBrand": "הרדוף אורגני",
    "warningNote": "איכות ללא אנטיביוטיקה",
    "unit": "יח׳"
  },
  {
    "id": "sibo_shop_327",
    "category": "meat_fish",
    "name": "בשר עוף טחון טרי",
    "safeBrand": "טרי מהקצב",
    "warningNote": "לטחון במקום מחזה ופרגית",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_328",
    "category": "meat_fish",
    "name": "קורקבני עוף מנוקים",
    "safeBrand": "טרי מהקצב",
    "warningNote": "לתבשילי קדירה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_329",
    "category": "meat_fish",
    "name": "לבבות עוף טריים",
    "safeBrand": "טרי מהקצב",
    "warningNote": "עשירים ב-CoQ10",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_330",
    "category": "meat_fish",
    "name": "חזה אווז מעושן טבעי ללא סוכר",
    "safeBrand": "מעדני בשר פרימיום",
    "warningNote": "לוודא ללא שום וסוכר מוסף",
    "unit": "אריזה"
  },
  {
    "id": "sibo_shop_331",
    "category": "meat_fish",
    "name": "בשר בקר טחון טרי (צוואר/צלעות)",
    "safeBrand": "אטליז איכותי / שופרסל טרי",
    "warningNote": "לטחון מול העיניים ללא שום תוספי סויה ותבלינים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_332",
    "category": "meat_fish",
    "name": "בשר בקר טחון רזה (שייטל/כתף)",
    "safeBrand": "אטליז מובחר",
    "warningNote": "פחות מ-10% שומן",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_333",
    "category": "meat_fish",
    "name": "נתח סטייק אנטרקוט טרי מיושן",
    "safeBrand": "אטליז בוטיק / שופרסל פרימיום",
    "warningNote": "נתח שמן ועסיסי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_334",
    "category": "meat_fish",
    "name": "אנטרקוט עם עצם (Prime Rib)",
    "safeBrand": "קצב מובחר",
    "warningNote": "איכות מסעדות",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_335",
    "category": "meat_fish",
    "name": "נתח סטייק סינטה בקר טרי",
    "safeBrand": "אטליז איכותי",
    "warningNote": "רזה ועשיר בחלבון",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_336",
    "category": "meat_fish",
    "name": "מדליוני פילה בקר טרי",
    "safeBrand": "קצב מובחר",
    "warningNote": "רך ביותר",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_337",
    "category": "meat_fish",
    "name": "נתח פיקניה בקר עם שכבת שומן",
    "safeBrand": "אטליז ברזילאי",
    "warningNote": "לצלייה בתנור ובמחבת",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_338",
    "category": "meat_fish",
    "name": "נתח שייטל בקר פרוס דק",
    "safeBrand": "טרי מהקצב",
    "warningNote": "להקפצה מהירה ללא שמן מיותר",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_339",
    "category": "meat_fish",
    "name": "נתח אונטריב בקר לבישול ארוך",
    "safeBrand": "טרי מהקצב",
    "warningNote": "רך ונמס בפה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_340",
    "category": "meat_fish",
    "name": "נתח צלי כתף (מס׳ 5)",
    "safeBrand": "קצב מובחר",
    "warningNote": "לבישול איטי של שבת",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_341",
    "category": "meat_fish",
    "name": "קוביות בקר לגולאש/קדירה (מס׳ 5/8)",
    "safeBrand": "טרי מהקצב",
    "warningNote": "לבישול ארוך ורך",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_342",
    "category": "meat_fish",
    "name": "אסאדו בקר טרי (עם עצם / בלי עצם)",
    "safeBrand": "אטליז מובחר",
    "warningNote": "לבישול איטי ללא בצל",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_343",
    "category": "meat_fish",
    "name": "אוסובוקו עגל עם מח עצם",
    "safeBrand": "טרי מהקצב",
    "warningNote": "עשיר בג׳לטין וקולגן",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_344",
    "category": "meat_fish",
    "name": "חזה בקר (בריסקט) לעישון וצלייה",
    "safeBrand": "אטליז בוטיק",
    "warningNote": "לבישול ארוך ועסיסי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_345",
    "category": "meat_fish",
    "name": "צלעות טלה טריות",
    "safeBrand": "קצב טלה מובחר",
    "warningNote": "לתבל במלח ורוזמרין בלבד",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_346",
    "category": "meat_fish",
    "name": "בשר טלה טחון טרי",
    "safeBrand": "אטליז בוטיק",
    "warningNote": "לערבב עם בקר לקציצות",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_347",
    "category": "meat_fish",
    "name": "שוק טלה טרייה שלמה",
    "safeBrand": "אטליז מובחר",
    "warningNote": "לצלייה איטית חגיגית",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_348",
    "category": "meat_fish",
    "name": "כתף טלה לצלייה ארוכה",
    "safeBrand": "קצב מובחר",
    "warningNote": "עסיסי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_349",
    "category": "meat_fish",
    "name": "אוסובוקו טלה",
    "safeBrand": "טרי מהקצב",
    "warningNote": "מעולה לתבשילי קדירה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_350",
    "category": "meat_fish",
    "name": "שווארמה הודו נקבה נקייה (פרגית הודו)",
    "safeBrand": "טרי מהקצב",
    "warningNote": "עשיר בברזל, רך ועסיסי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_351",
    "category": "meat_fish",
    "name": "חזה הודו שלם טרי",
    "safeBrand": "עוף טוב / שופרסל",
    "warningNote": "לפסטרמה ביתית מושלמת",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_352",
    "category": "meat_fish",
    "name": "בשר הודו אדום טחון",
    "safeBrand": "טרי מהקצב",
    "warningNote": "חלבון רזה וקל לעיכול",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_353",
    "category": "meat_fish",
    "name": "שווארמה הודו פילדלפיה רצועות",
    "safeBrand": "טרי מהקצב",
    "warningNote": "להקפצה מהירה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_354",
    "category": "meat_fish",
    "name": "שוק הודו שלמה (פולקע הודו)",
    "safeBrand": "משק ארצי",
    "warningNote": "עשירה בקולגן ומינרלים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_355",
    "category": "meat_fish",
    "name": "כנפי הודו למרק",
    "safeBrand": "טרי מהקצב",
    "warningNote": "לציר ג׳לטין עשיר",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_356",
    "category": "meat_fish",
    "name": "פסטרמה הודו 100% טבעית ללא תוספים",
    "safeBrand": "טירת צבי 100% טבעי / יחיעם טבעי",
    "warningNote": "זהירות: פסטרמה רגילה מכילה שום, בצל, עמילן מעובד וסוכר!",
    "unit": "אריזה"
  },
  {
    "id": "sibo_shop_357",
    "category": "meat_fish",
    "name": "פילה סלמון נורבגי טרי (עם עור)",
    "safeBrand": "דגת הארץ / שופרסל פרימיום דגים",
    "warningNote": "עשיר באומגה 3 אנטי-דלקתית",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_358",
    "category": "meat_fish",
    "name": "פילה סלמון בר פראי (Wild Salmon)",
    "safeBrand": "דגת הים הקפוא",
    "warningNote": "פחות שומן, עשיר באסטקסנטין",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_359",
    "category": "meat_fish",
    "name": "סטייק סלמון טרי עם עצם",
    "safeBrand": "דייג מקומי",
    "warningNote": "לצלייה על הגריל",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_360",
    "category": "meat_fish",
    "name": "סלמון מעושן פרימיום ללא תוספת סוכר",
    "safeBrand": "מעדני מיקי / רמב״ם / Balik",
    "warningNote": "לוודא: סלמון ומלח בלבד (ללא סוכר מוסף)",
    "unit": "אריזה"
  },
  {
    "id": "sibo_shop_361",
    "category": "meat_fish",
    "name": "פילה דניס טרי מפולט",
    "safeBrand": "דגי תנובה / שופרסל טרי",
    "warningNote": "דג ים לבן קל מאוד לעיכול",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_362",
    "category": "meat_fish",
    "name": "דניס שלם טרי מנוקה",
    "safeBrand": "שוק דגים",
    "warningNote": "לאפייה במלח ים ורוזמרין",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_363",
    "category": "meat_fish",
    "name": "פילה לברק טרי מפולט",
    "safeBrand": "דגת הארץ / שוק דגים",
    "warningNote": "אידיאלי לאפייה קלה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_364",
    "category": "meat_fish",
    "name": "לברק שלם טרי",
    "safeBrand": "דייג מקומי",
    "warningNote": "דג ים עדין",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_365",
    "category": "meat_fish",
    "name": "פילה ברמונדי ישראלי טרי",
    "safeBrand": "ברמונדי ישראלי",
    "warningNote": "עסיסי ובטוח ל-SIBO",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_366",
    "category": "meat_fish",
    "name": "ברמונדי שלם טרי",
    "safeBrand": "ברמונדי מקומי",
    "warningNote": "לאפייה בתנור",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_367",
    "category": "meat_fish",
    "name": "פילה מוסר ים טרי",
    "safeBrand": "דייג מקומי",
    "warningNote": "דג ים משובח",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_368",
    "category": "meat_fish",
    "name": "פילה לוקוס ים טרי",
    "safeBrand": "דייג מובחר",
    "warningNote": "הדג המשובח ביותר לקדירות",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_369",
    "category": "meat_fish",
    "name": "פילה דג סול קפוא",
    "safeBrand": "דלידג / שופרסל",
    "warningNote": "דג רזה ועדין",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_370",
    "category": "meat_fish",
    "name": "פילה בקלה (קוד) קפוא",
    "safeBrand": "דלידג פרימיום",
    "warningNote": "מתאים לקציצות דגים ואפייה",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_371",
    "category": "meat_fish",
    "name": "פילה מליזה (הליבוט) קפוא",
    "safeBrand": "דלידג",
    "warningNote": "דג לבן בשרני",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_372",
    "category": "meat_fish",
    "name": "פילה פורל ורוד טרי (נחל דן)",
    "safeBrand": "דגי דן",
    "warningNote": "עשיר בשמני דגים בריאים",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_373",
    "category": "meat_fish",
    "name": "פילה מטיאס הולנדי כבוש במלח ושמן",
    "safeBrand": "מעדני מיקי / שוק",
    "warningNote": "עשיר באומגה 3",
    "unit": "אריזה"
  },
  {
    "id": "sibo_shop_374",
    "category": "meat_fish",
    "name": "טונה בהירה בשמן זית (שלישיית שימורים)",
    "safeBrand": "ריו מרה Rio Mare / פילטונה בשמן זית",
    "warningNote": "לוודא: נתחי טונה, שמן זית ומלח בלבד (ללא תמציות ירקות)",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_375",
    "category": "meat_fish",
    "name": "טונה במים (ללא שמן)",
    "safeBrand": "פילטונה במים / סטארקיסט במים",
    "warningNote": "חלבון רזה טהור",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_376",
    "category": "meat_fish",
    "name": "טונה בהירה בשמן זרעי חמניות טהור",
    "safeBrand": "ריו מרה",
    "warningNote": "טעם עדין",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_377",
    "category": "meat_fish",
    "name": "נתחי טונה פרימיום בצנצנת זכוכית בשמן זית",
    "safeBrand": "Ortiz Bonito del Norte Jar",
    "warningNote": "איכות מסעדות",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_378",
    "category": "meat_fish",
    "name": "סרדינים שלמים בשמן זית כתית מעולה",
    "safeBrand": "Ortiz / מטיאס / ריו מרה",
    "warningNote": "עשיר בסידן ואומגה 3",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_379",
    "category": "meat_fish",
    "name": "סרדינים ספרדיים ללא עור ועצמות בשמן זית",
    "safeBrand": "Ortiz Bonito del Norte",
    "warningNote": "איכות פרימיום",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_380",
    "category": "meat_fish",
    "name": "אנשובי איטלקי פרימיום בשמן זית",
    "safeBrand": "Ortiz / Rizzoli / Zarotti",
    "warningNote": "אנשובי, שמן זית ומלח בלבד",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_381",
    "category": "meat_fish",
    "name": "פילה טונה אדומה טרייה (סושי גרייד)",
    "safeBrand": "דייג מובחר",
    "warningNote": "לטטאקי מהיר וסושי דה-קונסטרוקציה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_382",
    "category": "meat_fish",
    "name": "פילה אינטיאס (שולה) טרי",
    "safeBrand": "דייג ים",
    "warningNote": "דג לבן בשרני",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_383",
    "category": "meat_fish",
    "name": "פילה פלמידה לבנה טרייה",
    "safeBrand": "שוק דגים",
    "warningNote": "נפלא לסביצ׳ה עם לימון ושמן שום",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_384",
    "category": "meat_fish",
    "name": "פילה מליטה (ברקודה) טרי",
    "safeBrand": "שוק דגים",
    "warningNote": "דג ים רזה",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_385",
    "category": "meat_fish",
    "name": "דג בורי טרי מפולט",
    "safeBrand": "שוק דגים",
    "warningNote": "עשיר בשומן בריא",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_386",
    "category": "meat_fish",
    "name": "פילה ברבוניה אדומה טרייה",
    "safeBrand": "שוק דגים",
    "warningNote": "לטיגון קל בשמן זית",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_387",
    "category": "meat_fish",
    "name": "פילה דג בס טרי",
    "safeBrand": "דגת הארץ",
    "warningNote": "דג ים עסיסי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_388",
    "category": "meat_fish",
    "name": "פילה פורל ים טרי",
    "safeBrand": "שוק דגים",
    "warningNote": "דג עשיר באומגה 3",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_389",
    "category": "meat_fish",
    "name": "סטייק טונה אדומה קפוא",
    "safeBrand": "דלידג פרימיום",
    "warningNote": "לצריבה מהירה",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_390",
    "category": "meat_fish",
    "name": "פילה סלמון מעושן חם",
    "safeBrand": "מעדני מיקי",
    "warningNote": "מעושן ללא סוכר",
    "unit": "אריזה"
  },
  {
    "id": "sibo_shop_391",
    "category": "meat_fish",
    "name": "פילה לברק קפוא בוואקום",
    "safeBrand": "דגת הארץ",
    "warningNote": "דג ים נקי",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_392",
    "category": "meat_fish",
    "name": "המבורגר בקר 100% טבעי לא מתובל",
    "safeBrand": "אטליז מובחר / שופרסל טרי",
    "warningNote": "בשר בקר טהור ללא גלוטן, שום ובצל",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_393",
    "category": "meat_fish",
    "name": "עצמות בקר/עגל לציר מרק עשיר בקולגן",
    "safeBrand": "אטליז מובחר",
    "warningNote": "לבשל 12 שעות עם חומץ תפוחים Bragg ורוזמרין",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_394",
    "category": "meat_fish",
    "name": "עצמות עוף למרק",
    "safeBrand": "טרי מהקצב",
    "warningNote": "ציר מרפא לרירית המעי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_395",
    "category": "meat_fish",
    "name": "גרונות הודו/עוף למרק",
    "safeBrand": "טרי מהקצב",
    "warningNote": "בסיס ג׳לטין טבעי לשיקום רירית המעי",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_396",
    "category": "meat_fish",
    "name": "כבד עוף טרי מוכשר",
    "safeBrand": "טרי מהקצב",
    "warningNote": "עשיר בוויטמין A וברזל",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_397",
    "category": "meat_fish",
    "name": "כבד בקר טרי",
    "safeBrand": "קצב מובחר",
    "warningNote": "עשיר במיוחד בוויטמיני B",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_398",
    "category": "meat_fish",
    "name": "לשון בקר טרייה",
    "safeBrand": "קצב איכותי",
    "warningNote": "רכה ועשירה בחלבון",
    "unit": "ק\"ג"
  },
  {
    "id": "sibo_shop_399",
    "category": "meat_fish",
    "name": "ביצי דגים / קוויאר סלמון טבעי",
    "safeBrand": "מעדניית דגים",
    "warningNote": "פצצת אומגה 3",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_400",
    "category": "dairy_oils",
    "name": "ביצי חופש אורגניות טריות (L / XL)",
    "safeBrand": "משק צביאלי / גליקסמן חופש / שופרסל גרין",
    "warningNote": "חלבון מושלם 0% תסיסה לכל ארוחה",
    "unit": "תבנית"
  },
  {
    "id": "sibo_shop_401",
    "category": "dairy_oils",
    "name": "ביצי חופש מועשרות באומגה 3",
    "safeBrand": "גליקסמן אומגה 3",
    "warningNote": "חלמון עשיר",
    "unit": "תבנית"
  },
  {
    "id": "sibo_shop_402",
    "category": "dairy_oils",
    "name": "ביצי שלו קטנות טריות",
    "safeBrand": "משק שלו",
    "warningNote": "מעדן קל לעיכול",
    "unit": "מארז"
  },
  {
    "id": "sibo_shop_403",
    "category": "dairy_oils",
    "name": "גבינת פרמזן רג׳יאנו איטלקית מקורית (Parmigiano Reggiano)",
    "safeBrand": "Zanetti / Parmareggio 24/36 חודש",
    "warningNote": "הערה קלינית: יישון מעל 24 חודש מפרק לחלוטין את הלקטוז ל-0%!",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_404",
    "category": "dairy_oils",
    "name": "גבינת פרמזן מגוררת דק 100% טהורה",
    "safeBrand": "Zanetti Grated Parmesan",
    "warningNote": "לוודא: ללא תוספת עמילן תירס למניעת הידבקות",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_405",
    "category": "dairy_oils",
    "name": "גבינת גרנה פדנו מיושנת 16+ חודש",
    "safeBrand": "Zanetti Grana Padano",
    "warningNote": "כמעט 0% לקטוז, עשירה בסידן",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_406",
    "category": "dairy_oils",
    "name": "גבינת גרנה פדנו מגוררת דק 100%",
    "safeBrand": "Zanetti Grana Padano Grated",
    "warningNote": "ללא לקטוז",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_407",
    "category": "dairy_oils",
    "name": "גבינת פקורינו רומאנו מחלב כבשים (מיושנת)",
    "safeBrand": "Locatelli / Zanetti Pecorino",
    "warningNote": "גבינה קשה פיקנטית 0% לקטוז",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_408",
    "category": "dairy_oils",
    "name": "גבינת פקורינו מגוררת דק 100%",
    "safeBrand": "Locatelli Grated Pecorino",
    "warningNote": "גבינת כבשים 0% לקטוז",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_409",
    "category": "dairy_oils",
    "name": "גבינת פקורינו סרדו (Sardo)",
    "safeBrand": "Zanetti",
    "warningNote": "מחלב כבשים מסרדיניה",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_410",
    "category": "dairy_oils",
    "name": "גבינת מנצ׳גו ספרדית מיושנת מחלב כבשים (12 חודש)",
    "safeBrand": "García Baquero Manchego Curado",
    "warningNote": "עשירה וטעימה ללא לקטוז",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_411",
    "category": "dairy_oils",
    "name": "גבינת גאודה עיזים קשה מיושנת",
    "safeBrand": "Frico Goat Cheese Aged / משק צוריאל",
    "warningNote": "גבינה קשה עשירה מחלב עיזים",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_412",
    "category": "dairy_oils",
    "name": "גבינת גאודה הולנדית מיושנת 12 חודש (Old Gouda)",
    "safeBrand": "Frico Old Holland",
    "warningNote": "קשה ומתפוררת 0% לקטוז",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_413",
    "category": "dairy_oils",
    "name": "גבינת גאודה כמהין",
    "safeBrand": "Frico Truffle Gouda",
    "warningNote": "טעם פטריות כמהין משובח",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_414",
    "category": "dairy_oils",
    "name": "גבינת צ׳דר אנגלית מיושנת חריפה (Mature Cheddar)",
    "safeBrand": "Cathedral City Mature / Wyke Farms",
    "warningNote": "צ׳דר מיושן טבעי 0% לקטוז",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_415",
    "category": "dairy_oils",
    "name": "גבינת צ׳דר וינטג׳ מיושנת 18 חודש",
    "safeBrand": "Cathedral City Vintage",
    "warningNote": "טעם עמוק ללא לקטוז",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_416",
    "category": "dairy_oils",
    "name": "גבינת צ׳דר עיזים קשה",
    "safeBrand": "משק צוריאל",
    "warningNote": "ללא לקטוז מחלב עיזים",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_417",
    "category": "dairy_oils",
    "name": "גבינת גרוייר שוויצרית מקורית (Gruyère AOP)",
    "safeBrand": "Emmi Le Gruyère Switzerland",
    "warningNote": "גבינה שוויצרית קשה נמסה מעולה",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_418",
    "category": "dairy_oils",
    "name": "גבינת אמנטל שוויצרית מקורית",
    "safeBrand": "Emmi Emmentaler AOP",
    "warningNote": "גבינה קשה עם חורים ללא לקטוז",
    "unit": "חריץ"
  },
  {
    "id": "sibo_shop_419",
    "category": "dairy_oils",
    "name": "גבינת פטה עיזים/כבשים קשה מלוחה",
    "safeBrand": "משק צוריאל פטה עיזים / פיראוס פטה",
    "warningNote": "דלת לקטוז טבעית",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_420",
    "category": "dairy_oils",
    "name": "גבינת חלומי עיזים/בקר לטיגון וצלייה",
    "safeBrand": "פיראוס חלומי / משק דותן",
    "warningNote": "נצרבת קראנצ׳ית במחבת ללא פירורי לחם",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_421",
    "category": "dairy_oils",
    "name": "גבינת ברי צרפתית אותנטית (Brie)",
    "safeBrand": "Président Brie",
    "warningNote": "גבינה בשלה עם פחות מ-0.1% לקטוז",
    "unit": "משולש"
  },
  {
    "id": "sibo_shop_422",
    "category": "dairy_oils",
    "name": "גבינת קממבר צרפתית מקורית (Camembert)",
    "safeBrand": "Président Camembert",
    "warningNote": "דלת לקטוז טבעית",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_423",
    "category": "dairy_oils",
    "name": "חמאה צרפתית איכותית 82% שומן",
    "safeBrand": "Elle & Vire / Président / Lurpak",
    "warningNote": "חמאה איכותית מכילה פחות מ-0.5% לקטוז",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_424",
    "category": "dairy_oils",
    "name": "חמאה צרפתית עם גבישי מלח ים (Demi-Sel)",
    "safeBrand": "Président aux Cristaux de Sel",
    "warningNote": "טעם גורמה מלוח עדין",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_425",
    "category": "dairy_oils",
    "name": "חמאה הולנדית ללא מלח",
    "safeBrand": "Frico Pure Butter",
    "warningNote": "שומן טהור לבישול",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_426",
    "category": "dairy_oils",
    "name": "חמאת גהי הודית מזוככת (Ghee 100% שומן חלב טהור)",
    "safeBrand": "Organic Valley Ghee / Pukka",
    "warningNote": "הערה קלינית: זיכוך החמאה מסיר 100% ממוצקי החלב והלקטוז!",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_427",
    "category": "dairy_oils",
    "name": "חמאת גהי אורגנית עם כורכום",
    "safeBrand": "Organic Valley Turmeric Ghee",
    "warningNote": "גהי מועשר בכורכומין",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_428",
    "category": "dairy_oils",
    "name": "חלב דל לקטוז / ללא לקטוז 0%",
    "safeBrand": "תנובה GO ללא לקטוז / יטבתה 0% לקטוז",
    "warningNote": "לשתייה מדודה עד חצי כוס ביום",
    "unit": "קרטון"
  },
  {
    "id": "sibo_shop_429",
    "category": "dairy_oils",
    "name": "חמאת כמהין איטלקית",
    "safeBrand": "Tartufi Morra",
    "warningNote": "מעדן מעל סטייק ותפוחי אדמה",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_430",
    "category": "dairy_oils",
    "name": "שמן זית כתית מעולה ישראלי חומציות 0.3%",
    "safeBrand": "מסיק קיבוץ מגל / אנשי הזית",
    "warningNote": "השומן הבריא הראשי ל-SIBO",
    "unit": "פח 2 ליטר"
  },
  {
    "id": "sibo_shop_431",
    "category": "dairy_oils",
    "name": "שמן זית זן קורונייקי פירותי",
    "safeBrand": "זיתא פרימיום",
    "warningNote": "טעם עשבוני עדין",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_432",
    "category": "dairy_oils",
    "name": "שמן זית זן פיקואל יציב",
    "safeBrand": "מסיק מגל",
    "warningNote": "מעולה לאפייה ובישול",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_433",
    "category": "dairy_oils",
    "name": "שמן זית זן ברנע ישראלי",
    "safeBrand": "יד מרדכי טהור",
    "warningNote": "טעם קלאסי",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_434",
    "category": "dairy_oils",
    "name": "שמן זרעי פשתן בכבישה קרה (שמירה במקרר)",
    "safeBrand": "תבואות / שופרסל גרין",
    "warningNote": "עשיר במיוחד באומגה 3",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_435",
    "category": "dairy_oils",
    "name": "שמן אגוזי מקדמיה טהור",
    "safeBrand": "La Tourangelle Macadamia",
    "warningNote": "עשיר בחומצה פלמיטולאית",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_436",
    "category": "dairy_oils",
    "name": "שמן זרעי דלעת ירוק כהה בכבישה קרה",
    "safeBrand": "תבואות / שופרסל גרין",
    "warningNote": "עשיר באבץ ונוגדי חמצון",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_437",
    "category": "dairy_oils",
    "name": "יוגורט עיזים מסונן ללא לקטוז",
    "safeBrand": "משק צוריאל ללא לקטוז",
    "warningNote": "בטוח לעיכול",
    "unit": "גביע"
  },
  {
    "id": "sibo_shop_438",
    "category": "grains_starches",
    "name": "אורז בסמטי הודי ארוך קלאסי (אינדקס גליקמי נמוך)",
    "safeBrand": "Tilda Pure Basmati / סוגת בסמטי כחול",
    "warningNote": "אורז הדגל של SIBO — דל פודמאפ ומתעכל בקלות",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_439",
    "category": "grains_starches",
    "name": "אורז בסמטי אורגני",
    "safeBrand": "הרדוף / שופרסל גרין",
    "warningNote": "איכות ללא הדברה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_440",
    "category": "grains_starches",
    "name": "אורז בסמטי מלא (במידה מדודה)",
    "safeBrand": "סוגת מלא",
    "warningNote": "עשיר בסיבים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_441",
    "category": "grains_starches",
    "name": "אורז יסמין תאילנדי ריחני",
    "safeBrand": "Royal Umbrella / סוגת",
    "warningNote": "מתאים למוקפצים ותבשילים אסייתיים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_442",
    "category": "grains_starches",
    "name": "אורז לסושי יפני עגול",
    "safeBrand": "Kokuho Rose / Shinode / סוגת",
    "warningNote": "לקערות סושי דה-קונסטרוקציה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_443",
    "category": "grains_starches",
    "name": "אורז אדום מלא (במידה מדודה)",
    "safeBrand": "תבואות / סוגת",
    "warningNote": "עשיר בנוגדי חמצון",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_444",
    "category": "grains_starches",
    "name": "אורז שחור (Forbidden Rice)",
    "safeBrand": "תבואות",
    "warningNote": "מרקם אגוזי עשיר",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_445",
    "category": "grains_starches",
    "name": "אורז עגול לריזוטו (ארבוריו / קרנרולי)",
    "safeBrand": "Riso Gallo Carnaroli",
    "warningNote": "לריזוטו קרמי עם פרמזן",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_446",
    "category": "grains_starches",
    "name": "דפי אורז עגולים וייטנאמיים (100% אורז ומים)",
    "safeBrand": "Bich Chi / Taste of Asia / ספאפר",
    "warningNote": "לוודא רכיבים: קמח אורז, מים ומלח בלבד (ללא קמח טפיוקה תעשייתי)",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_447",
    "category": "grains_starches",
    "name": "דפי אורז מרובעים קטנים",
    "safeBrand": "Taste of Asia",
    "warningNote": "לטורטיות מהירות",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_448",
    "category": "grains_starches",
    "name": "דפי אורז אורגניים חומים",
    "safeBrand": "King Soba Brown Rice Paper",
    "warningNote": "עשירים במינרלים",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_449",
    "category": "grains_starches",
    "name": "אטריות אורז דקות (ורמיצ׳לי / Rice Vermicelli)",
    "safeBrand": "Mama / Taste of Asia",
    "warningNote": "למרק עוף אסייתי ומוקפץ",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_450",
    "category": "grains_starches",
    "name": "אטריות אורז רחבות לפד תאי (Rice Stick)",
    "safeBrand": "Farmer Brand / Taste of Asia",
    "warningNote": "להשרות במים חמים",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_451",
    "category": "grains_starches",
    "name": "אטריות אורז חומות מלאות",
    "safeBrand": "King Soba Organic",
    "warningNote": "עשירות בסיבים ללא גלוטן",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_452",
    "category": "grains_starches",
    "name": "אטריות כוסמת יפניות 100% סובה (ללא חיטה!)",
    "safeBrand": "Clearspring 100% Soba",
    "warningNote": "לוודא: 100% קמח כוסמת ללא קמח חיטה מוסף!",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_453",
    "category": "grains_starches",
    "name": "פצפוצי אורז 100% טבעי תפוח (ללא סוכר כלל)",
    "safeBrand": "B&D פצפוצי אורז טבעי",
    "warningNote": "קורנפלקס הבוקר הבטוח של ניר",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_454",
    "category": "grains_starches",
    "name": "פריכיות אורז מלא דקות וקראנצ׳יות",
    "safeBrand": "B&D פריכיות דקות / שופרסל גרין",
    "warningNote": "בטוח 100% כבסיס לכל נשנוש וממרח",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_455",
    "category": "grains_starches",
    "name": "פריכיות אורז אישיות קטנות (בייטס)",
    "safeBrand": "B&D פריכיונים",
    "warningNote": "לנשנוש בדרכים ובנסיעות",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_456",
    "category": "grains_starches",
    "name": "פריכיות כוסמת 100% ללא תוספות",
    "safeBrand": "B&D פריכיות כוסמת",
    "warningNote": "טעם אגוזי עמוק",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_457",
    "category": "grains_starches",
    "name": "פריכיות קינואה ואורז",
    "safeBrand": "שופרסל גרין",
    "warningNote": "קראנצ׳י וקל",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_458",
    "category": "grains_starches",
    "name": "תפוחי אדמה אדומים (דזירה / ראטה)",
    "safeBrand": "שופרסל גרין / שוק איכרים",
    "warningNote": "אידיאלי לפירה קטיפתי, צ׳יפס ביתי וקומפיר",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_459",
    "category": "grains_starches",
    "name": "תפוחי אדמה לבנים לאפייה",
    "safeBrand": "טרי מהשוק",
    "warningNote": "לקומפיר מהיר במיקרוגל",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_460",
    "category": "grains_starches",
    "name": "תפוחי אדמה בייבי קטנים (גורמה)",
    "safeBrand": "דוד משה בייבי",
    "warningNote": "לאפייה בתנור עם רוזמרין ושמן שום",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_461",
    "category": "grains_starches",
    "name": "קמח שקדים טהור 100% שקדים מולבנים דק",
    "safeBrand": "שקדיה / שופרסל גרין / תבואות",
    "warningNote": "הקמח המושלם לפנקייקים, וופלים וציפוי שניצל",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_462",
    "category": "grains_starches",
    "name": "קמח שקדים מלא (עם קליפה טחונה דק)",
    "safeBrand": "שקדיה",
    "warningNote": "עשיר בסיבים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_463",
    "category": "grains_starches",
    "name": "קמח אורז לבן דק ללא גלוטן",
    "safeBrand": "סוגת ללא גלוטן / קמח תמי כתום",
    "warningNote": "מעולה להסמכת רטבים ואפייה עדינה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_464",
    "category": "grains_starches",
    "name": "קמח אורז חום מלא ללא גלוטן",
    "safeBrand": "תבואות",
    "warningNote": "עשיר בסיבים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_465",
    "category": "grains_starches",
    "name": "קמח טפיוקה טהור (עמילן מניוק)",
    "safeBrand": "תבואות / מזרח ומערב",
    "warningNote": "להוספת גמישות במאפים ללא גלוטן (במידה מדודה)",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_466",
    "category": "grains_starches",
    "name": "קמח טפיוקה אורגני",
    "safeBrand": "שופרסל גרין",
    "warningNote": "דל פודמאפ למאפים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_467",
    "category": "grains_starches",
    "name": "קינואה לבנה מלכותית שטופה היטב",
    "safeBrand": "הרדוף אורגני / שופרסל גרין",
    "warningNote": "דגש: לשטוף היטב במסננת צפופה לסילוק ספונינים מרים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_468",
    "category": "grains_starches",
    "name": "קינואה אדומה / תלת-צבעונית",
    "safeBrand": "תבואות",
    "warningNote": "מרקם קראנצ׳י לסלטים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_469",
    "category": "grains_starches",
    "name": "פתיתי קינואה להכנת דייסה מהירה (Quinoa Flakes)",
    "safeBrand": "תבואות / שופרסל גרין",
    "warningNote": "דייסה מזינה ב-3 דקות",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_470",
    "category": "grains_starches",
    "name": "כוסמת ירוקה בהירה (לא קלויה!)",
    "safeBrand": "תבואות / שופרסל גרין",
    "warningNote": "דגש: כוסמת ירוקה עדינה וקלה לעיכול, בניגוד לחומה הקלויה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_471",
    "category": "grains_starches",
    "name": "קמח כוסמת ירוקה ללא גלוטן",
    "safeBrand": "שופרסל גרין / תבואות",
    "warningNote": "להכנת קרפים צרפתיים (Galettes)",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_472",
    "category": "grains_starches",
    "name": "פירורי \"לחם\" פנקו ללא גלוטן על בסיס אורז",
    "safeBrand": "B&D פנקו ללא גלוטן / אורגנטופ",
    "warningNote": "לציפוי שניצל קראנצ׳י",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_473",
    "category": "grains_starches",
    "name": "דפי אצות נורי קלויות לסושי (100% אצות ים)",
    "safeBrand": "Taste of Asia / מזרח ומערב",
    "warningNote": "עשיר ביוד ומינרלים מהים",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_474",
    "category": "grains_starches",
    "name": "עמילן שורש חץ (Arrowroot Starch)",
    "safeBrand": "Bob's Red Mill Gluten Free",
    "warningNote": "תחליף עמילן קל לעיכול להסמכה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_475",
    "category": "grains_starches",
    "name": "פצפוצי קינואה תפוחים 100% טבעי",
    "safeBrand": "תבואות קינואה פופס",
    "warningNote": "לדייסות ויוגורט",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_476",
    "category": "grains_starches",
    "name": "דוחן בהיר טבעי (Millet)",
    "safeBrand": "תבואות אורגני",
    "warningNote": "דגן קדום דל פודמאפ",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_477",
    "category": "grains_starches",
    "name": "קמח דוחן ללא גלוטן",
    "safeBrand": "שופרסל גרין",
    "warningNote": "לאפייה מזינה",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_478",
    "category": "drinks",
    "name": "חלב שקדים ללא סוכר וללא תוספי עיבוי",
    "safeBrand": "אלפרו Alpro ללא סוכר (פקק תכלת) / Isola Bio Almond",
    "warningNote": "אזהרה קריטית: לוודא גרסה ללא סוכר וללא קרגינן / גומי גואר!",
    "unit": "קרטון"
  },
  {
    "id": "sibo_shop_479",
    "category": "drinks",
    "name": "חלב שקדים אורגני מ-3 רכיבים בלבד (שקדים, מים, מלח)",
    "safeBrand": "Rude Health Almond / The Bridge",
    "warningNote": "טהור לחלוטין",
    "unit": "קרטון"
  },
  {
    "id": "sibo_shop_480",
    "category": "drinks",
    "name": "חלב קוקוס לשתייה ללא סוכר",
    "safeBrand": "Alpro Coconut No Sugar / Isola Bio",
    "warningNote": "ללא תוספי סוכר",
    "unit": "קרטון"
  },
  {
    "id": "sibo_shop_481",
    "category": "drinks",
    "name": "חלב אורז טבעי (במידה מדודה)",
    "safeBrand": "Isola Bio Rice Milk",
    "warningNote": "ללא סוכר מוסף",
    "unit": "קרטון"
  },
  {
    "id": "sibo_shop_482",
    "category": "drinks",
    "name": "חלב אגוזי מקדמיה ללא סוכר",
    "safeBrand": "Milkadamia Unsweetened",
    "warningNote": "קרמי ועשיר",
    "unit": "קרטון"
  },
  {
    "id": "sibo_shop_483",
    "category": "drinks",
    "name": "מים מינרליים טבעיים מוגזים (סודה)",
    "safeBrand": "סן פלגרינו San Pellegrino / פרייה Perrier / נביעות",
    "warningNote": "משקה מרענן ומנקה חיך 0 קלוריות ו-0 תסיסה",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_484",
    "category": "drinks",
    "name": "סודה בטעמי פירות טבעיים (ללא סוכר/ממתיקים)",
    "safeBrand": "Schweppes סודה נענע-לימון / נביעות פלוס 0 קלוריות",
    "warningNote": "לבדוק ללא סורביטול וממתיקים מלאכותיים",
    "unit": "שישייה"
  },
  {
    "id": "sibo_shop_485",
    "category": "drinks",
    "name": "תה ירוק יפני טהור (Sencha / Matcha)",
    "safeBrand": "ויסוצקי ירוק טהור / Clipper Organic",
    "warningNote": "עשיר ב-EGCG נוגד חמצון",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_486",
    "category": "drinks",
    "name": "אבקת מאצ׳ה יפנית טקסית טהורה 100%",
    "safeBrand": "Uji Matcha / Ceremonal Matcha",
    "warningNote": "למשקה מאצ׳ה לאטה עם חלב שקדים",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_487",
    "category": "drinks",
    "name": "חליטת תה נענע ומנטה טבעית",
    "safeBrand": "ויסוצקי / Pukka Three Mint",
    "warningNote": "מרגיע גזים ועוויתות במערכת העיכול",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_488",
    "category": "drinks",
    "name": "חליטת תה קמומיל (בבונג) טהורה",
    "safeBrand": "Pukka Chamomile / ויסוצקי",
    "warningNote": "מרגיע ומסייע לשינה טובה",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_489",
    "category": "drinks",
    "name": "חליטת תה ג׳ינג׳ר ולימון",
    "safeBrand": "Pukka Three Ginger / Clipper",
    "warningNote": "מחמם ומעודד תנועתיות מעיים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_490",
    "category": "drinks",
    "name": "פולי קפה שחור / אספרסו איכותי 100% ערביקה",
    "safeBrand": "Illy / Lavazza / נספרסו",
    "warningNote": "לשתות שחור נקי או עם מעט חלב שקדים",
    "unit": "חבילה"
  },
  {
    "id": "sibo_shop_491",
    "category": "drinks",
    "name": "קפסולות אספרסו 100% ערביקה",
    "safeBrand": "Nespresso / Lavazza",
    "warningNote": "ללא תוספי טעמים",
    "unit": "שרוול"
  },
  {
    "id": "sibo_shop_492",
    "category": "drinks",
    "name": "חליטת תה רויבוש (Rooibos) ללא קפאין",
    "safeBrand": "Clipper Organic Rooibos",
    "warningNote": "עשיר במינרלים ודל טאנינים",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_493",
    "category": "drinks",
    "name": "חליטת תה פסיפלורה ולימון",
    "safeBrand": "ויסוצקי עשבים",
    "warningNote": "ללא קפאין",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_494",
    "category": "drinks",
    "name": "חליטת תה כורכום וג׳ינג׳ר",
    "safeBrand": "Pukka Turmeric Glow",
    "warningNote": "נוגד דלקת חזק",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_495",
    "category": "drinks",
    "name": "חליטת שומר טבעית (במידה עדינה)",
    "safeBrand": "ויסוצקי שומר",
    "warningNote": "להקלה על נפיחות",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_496",
    "category": "drinks",
    "name": "תחליף קפה מעולש טהור (Chicory Root Coffee)",
    "safeBrand": "Leroux Pure Chicory",
    "warningNote": "ללא קפאין, בטוח במידה מתונה",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_497",
    "category": "pantry_baking",
    "name": "אגוזי מלך טבעיים מובחרים (חצאים)",
    "safeBrand": "שופרסל גרין / קליית חממה טבעי",
    "warningNote": "עשיר באומגה 3 צמחית — מנה בטוחה: עד 10 חצאים ביום",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_498",
    "category": "pantry_baking",
    "name": "אגוזי פקאן טבעיים לא קלויים",
    "safeBrand": "שקדיה / שופרסל גרין",
    "warningNote": "דל פודמאפ — בטוח עד 10 חצאים ביום",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_499",
    "category": "pantry_baking",
    "name": "אגוזי מקדמיה טבעיים עשירים",
    "safeBrand": "ממלכת האגוזים",
    "warningNote": "שומן חד בלתי רווי מעולה — בטוח עד 10 יחידות",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_500",
    "category": "pantry_baking",
    "name": "אגוזי ברזיל טבעיים (סלניום טהור)",
    "safeBrand": "שופרסל גרין",
    "warningNote": "דגש: 1-2 אגוזים ביום מספקים 100% מהקצובה היומית של סלניום!",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_501",
    "category": "pantry_baking",
    "name": "שקדים טבעיים מולבנים פרוסים / שלמים",
    "safeBrand": "שקדיה",
    "warningNote": "בטוח עד 10 שקדים ביום",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_502",
    "category": "pantry_baking",
    "name": "צנוברים טבעיים מובחרים",
    "safeBrand": "שקדיה / פרג",
    "warningNote": "להכנת פסטו וקלייה לסלטים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_503",
    "category": "pantry_baking",
    "name": "בוטנים טבעיים קלופים לא מומלחים",
    "safeBrand": "ממלכת האגוזים",
    "warningNote": "לנשנוש בטוח עד 30 גרם",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_504",
    "category": "pantry_baking",
    "name": "גרעיני דלעת טבעיים (לא קלויים)",
    "safeBrand": "שופרסל גרין / תבואות",
    "warningNote": "עשירים באבץ ומגנזיום — עד 2 כפות",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_505",
    "category": "pantry_baking",
    "name": "גרעיני חמנייה טבעיים קלופים",
    "safeBrand": "תבואות",
    "warningNote": "עשירים בוויטמין E",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_506",
    "category": "pantry_baking",
    "name": "גרעיני אבטיח קלופים טבעיים (לא מומלחים)",
    "safeBrand": "קליית חממה",
    "warningNote": "עשירים באבץ וחלבון",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_507",
    "category": "pantry_baking",
    "name": "זרעי צ׳יה אורגניים טבעיים",
    "safeBrand": "הרדוף / תבואות / שופרסל גרין",
    "warningNote": "עשיר בסיבים מסיסים עדינים המרפדים את המעי",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_508",
    "category": "pantry_baking",
    "name": "זרעי צ׳יה לבנים אורגניים",
    "safeBrand": "שופרסל גרין",
    "warningNote": "עשירים באומגה 3",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_509",
    "category": "pantry_baking",
    "name": "זרעי פשתן שלמים / טחונים טרי",
    "safeBrand": "תבואות",
    "warningNote": "לטחון טרי ולשמור במקפיא",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_510",
    "category": "pantry_baking",
    "name": "אבקת אפייה ללא גלוטן וללא אלומיניום",
    "safeBrand": "Doves Farm / B&D ללא גלוטן",
    "warningNote": "לאפיית פנקייקים ומאפינס",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_511",
    "category": "pantry_baking",
    "name": "סודה לשתייה טהורה 100% (Sodium Bicarbonate)",
    "safeBrand": "תבואות",
    "warningNote": "להתפחה נקייה במאפים",
    "unit": "שקית"
  },
  {
    "id": "sibo_shop_512",
    "category": "pantry_baking",
    "name": "שמן MCT קוקוס טהור",
    "safeBrand": "Jarrow Formulas 100% MCT Oil",
    "warningNote": "שומן מהיר לאנרגיה מוחית ללא מעמסת עיכול",
    "unit": "בקבוק"
  },
  {
    "id": "sibo_shop_513",
    "category": "pantry_baking",
    "name": "זיתי קלמטה שלמים במי מלח ושמן זית",
    "safeBrand": "אנשי הזית / זיתא קלמטה",
    "warningNote": "לוודא: ללא חומרי שימור וללא שום",
    "unit": "צנצנת"
  },
  {
    "id": "sibo_shop_514",
    "category": "pantry_baking",
    "name": "זיתים ירוקים מבוקעים במלח בלבד",
    "safeBrand": "בית השיטה במלח בלבד",
    "warningNote": "ללא חומץ תעשייתי ושום",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_515",
    "category": "pantry_baking",
    "name": "זיתי טאסוס שחורים מיובשים במלח",
    "safeBrand": "אנשי הזית",
    "warningNote": "זיתים מקומטים עשירים בטעם",
    "unit": "קופסה"
  },
  {
    "id": "sibo_shop_516",
    "category": "pantry_baking",
    "name": "מלפפונים חמוצים במלח בלבד (קופסת שימורים ירוקה)",
    "safeBrand": "בית השיטה במלח / בני דרום במלח",
    "warningNote": "אזהרה קריטית: לוודא שכתוב \"במלח\" ולא \"בחומץ\"! (בחומץ מכיל שום ובצל מוסתרים!)",
    "unit": "פחית"
  },
  {
    "id": "sibo_shop_517",
    "category": "pantry_baking",
    "name": "אבקת אלקטרוליטים ללא סוכר (סודיום, פוטסיום, מגנזיום)",
    "safeBrand": "LMNT Raw Unflavored / Dr. Berg",
    "warningNote": "איזון מלחים קריטי",
    "unit": "קופסה"
  }
];
