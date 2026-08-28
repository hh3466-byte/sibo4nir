/**
 * COMPREHENSIVE SIBO SAFE TEST SUITE
 * Tests all core modules, databases, clinical algorithms, and API endpoints.
 */

import { normalizeHebrew, fuzzyHebrewMatch } from './src/utils/textUtils.ts';
import { SIBO_FOOD_DATABASE } from './src/data/siboDatabase.ts';
import { ISRAELI_SUPERMARKET_CATALOG } from './src/data/israeliSupermarketDatabase.ts';
import {
  COMMON_ISRAELI_BARCODES,
  ISRAELI_MANUFACTURER_PREFIXES,
  fetchProductByBarcode,
} from './src/services/barcodeService.ts';
import {
  analyzeFoodClinically,
  getSmartCategoricalSubstitutions,
} from './src/services/siboClinicalEngine.ts';
import { SIBO_MEDICAL_ARTICLES } from './src/data/siboArticles.ts';
import { SIBO_MEAL_SUGGESTIONS } from './src/data/siboMealSuggestions.ts';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    failures.push(`${message} (Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
    console.error(`  ❌ FAIL: ${message} (Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

console.log('\n======================================================');
console.log('🔬 SIBO SAFE - COMPREHENSIVE VERIFICATION & TEST SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// 1. HEBREW TEXT NORMALIZATION & FUZZY MATCHING
// -----------------------------------------------------------------------------
console.log('🔹 1. Testing Hebrew Normalization & Fuzzy Search:');
assertEqual(normalizeHebrew('קוט׳ג'), 'קוטג', 'Normalizes geresh');
assertEqual(normalizeHebrew('קוט״ג'), 'קוטג', 'Normalizes gershayim');
assertEqual(normalizeHebrew("קוטג'"), 'קוטג', 'Normalizes single quote');
assertEqual(normalizeHebrew('קפה   עלית - טורקי!'), 'קפה עלית טורקי', 'Normalizes punctuation and spaces');

assert(fuzzyHebrewMatch('חלב דל לקטוז תנובה 2%', 'דל לקטוז'), 'Fuzzy matches substring');
assert(fuzzyHebrewMatch('פיוז תה אפרסק 1.5 ליטר', 'פיוז תה'), 'Fuzzy matches multi-word query');
assert(fuzzyHebrewMatch('קוטג׳ 5% תנובה', 'קוטג'), 'Fuzzy matches with gershayim');
assert(fuzzyHebrewMatch('שמן זית כתית מעולה', 'שמן זית'), 'Fuzzy matches olive oil');

// -----------------------------------------------------------------------------
// 2. SIBO FOOD DATABASE INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n🔹 2. Testing SIBO Food Database Integrity:');
assert(SIBO_FOOD_DATABASE.length >= 60, `Database contains ${SIBO_FOOD_DATABASE.length} food items (>= 60 expected)`);

const validLights = ['GREEN', 'YELLOW', 'RED'];
const validCategories = [
  'vegetables', 'fruits', 'proteins', 'grains_starches',
  'dairy_alternatives', 'nuts_seeds', 'condiments_spices',
  'sweets_sweeteners', 'drinks'
];

let allValidItems = true;
let garlicFound = false;
let cucumberFound = false;
let chickenFound = false;
let riceFound = false;

for (const item of SIBO_FOOD_DATABASE) {
  if (!item.id || !item.nameHe || !item.nameEn || !validLights.includes(item.statusPhase1) || !validLights.includes(item.statusPhase2)) {
    allValidItems = false;
  }
  if (item.nameHe.includes('שום') && !item.nameHe.includes('שמן')) {
    garlicFound = true;
    assertEqual(item.statusPhase1, 'RED', 'Garlic is RED in Phase 1');
    assertEqual(item.statusPhase2, 'RED', 'Garlic is RED in Phase 2');
  }
  if (item.nameHe === 'מלפפון') {
    cucumberFound = true;
    assertEqual(item.statusPhase1, 'GREEN', 'Cucumber is GREEN in Phase 1');
  }
  if (item.nameHe.includes('עוף')) {
    chickenFound = true;
    assertEqual(item.statusPhase1, 'GREEN', 'Chicken is GREEN in Phase 1');
  }
  if (item.nameHe.includes('אורז לבן') || item.nameHe.includes('אורז בסמטי')) {
    riceFound = true;
  }
}

assert(allValidItems, 'All food database entries have valid structure, IDs, and traffic light statuses');
assert(garlicFound, 'Garlic correctly identified and classified as high risk');
assert(cucumberFound, 'Cucumber correctly identified as safe GREEN');
assert(chickenFound, 'Chicken correctly identified as safe GREEN');
assert(riceFound, 'Rice correctly present in database');

// -----------------------------------------------------------------------------
// 3. ISRAELI SUPERMARKET BARCODE CATALOG & SERVICES
// -----------------------------------------------------------------------------
console.log('\n🔹 3. Testing Israeli Supermarket Barcode Catalog:');
const barcodeCount = Object.keys(ISRAELI_SUPERMARKET_CATALOG).length;
assert(barcodeCount >= 100, `Catalog contains ${barcodeCount} verified Israeli barcodes (>= 100 expected)`);

// Test Turkish Coffee Elite Barcode
const eliteCoffee = ISRAELI_SUPERMARKET_CATALOG['7290119374106'];
assert(!!eliteCoffee, 'Found Elite Turkish Coffee barcode 7290119374106');
assert(eliteCoffee?.productName?.includes('קפה שחור'), 'Elite Coffee name is correct');

// Test Fuze Tea Barcode
const fuzeTea = COMMON_ISRAELI_BARCODES['7293110003693'];
assert(!!fuzeTea, 'Found Fuze Tea barcode 7293110003693');
assert(fuzeTea?.productName?.includes('תה קר') || fuzeTea?.productName?.includes('Fuze'), 'Fuze Tea name is correct');

// Test Pri Mor Orange Juice Barcode
const priMorBarcode = ISRAELI_SUPERMARKET_CATALOG['7290000494443'];
assert(!!priMorBarcode, 'Found Pri Mor 2L Orange Juice barcode 7290000494443');
assert(priMorBarcode?.productName?.includes('פרי מור'), 'Pri Mor Orange Juice name is correct');

// Test Pri Niv Orange Juice Barcode
const priNivBarcode = ISRAELI_SUPERMARKET_CATALOG['7290013092018'];
assert(!!priNivBarcode, 'Found Pri Niv 2L Orange Juice barcode 7290013092018');
assert(priNivBarcode?.productName?.includes('פרי ניב'), 'Pri Niv Orange Juice name is correct');

// Test Elite Cocoa Powder Barcode
const cocoaBarcode = ISRAELI_SUPERMARKET_CATALOG['7290000062024'];
assert(!!cocoaBarcode, 'Found Elite Pure Cocoa Powder barcode 7290000062024');
assert(cocoaBarcode?.productName?.includes('קקאו'), 'Elite Cocoa name is correct');

// Test Rich's Plant Whipping Cream Barcode
const richsBarcode = ISRAELI_SUPERMARKET_CATALOG['7290000096234'];
assert(!!richsBarcode, 'Found Richs Plant Whipping Cream barcode 7290000096234');
assert(richsBarcode?.productName?.includes('ריץ'), 'Richs Whip name is correct');

// Test GS1 Manufacturer recognition
assert(!!ISRAELI_MANUFACTURER_PREFIXES['72900000'], 'Tnuva prefix 72900000 recognized');
assert(!!ISRAELI_MANUFACTURER_PREFIXES['72900002'], 'Osem prefix 72900002 recognized');
assert(!!ISRAELI_MANUFACTURER_PREFIXES['72900004'], 'Strauss Elite prefix 72900004 recognized');
assert(!!ISRAELI_MANUFACTURER_PREFIXES['729000049'], 'Pri Mor prefix 729000049 recognized');
assert(!!ISRAELI_MANUFACTURER_PREFIXES['729001309'], 'Pri Niv prefix 729001309 recognized');
assert(!!ISRAELI_MANUFACTURER_PREFIXES['729000009'], 'Richs Parve prefix 729000009 recognized');

// -----------------------------------------------------------------------------
// 4. SIBO CLINICAL ALGORITHM ENGINE (Phase 1 & Phase 2)
// -----------------------------------------------------------------------------
console.log('\n🔹 4. Testing SIBO Clinical Algorithm Engine:');

// Test GREEN food in Phase 1
const chickenRes = analyzeFoodClinically('חזה עוף צלוי', 'phase1_strict');
assertEqual(chickenRes.status, 'GREEN', 'Grilled Chicken is GREEN in Phase 1');
assert(chickenRes.riskScore <= 2, 'Chicken risk score is low (<= 2)');

// Test GREEN vegetable
const cucumberRes = analyzeFoodClinically('מלפפון ירוק טרי', 'phase1_strict');
assertEqual(cucumberRes.status, 'GREEN', 'Cucumber is GREEN in Phase 1');

// Test RED High-FODMAP food (Garlic)
const garlicRes = analyzeFoodClinically('שום טרי כתוש', 'phase1_strict');
assertEqual(garlicRes.status, 'RED', 'Garlic is RED in Phase 1');
assert(garlicRes.riskScore >= 4, 'Garlic risk score is high (>= 4)');
assert(
  garlicRes.safeSubstitutions.some(s => s.includes('שמן') || s.includes('ירוק') || s.includes('עירית')),
  'Garlic offers smart culinary substitutions (Garlic oil / Green onion leaves)'
);

// Test RED High-FODMAP food (Onion)
const onionRes = analyzeFoodClinically('בצל לבן קצוץ', 'phase1_strict');
assertEqual(onionRes.status, 'RED', 'Onion is RED in Phase 1');

// Test RED Fruit (Apple - High Fructose & Sorbitol)
const appleRes = analyzeFoodClinically('תפוח עץ ירוק', 'phase1_strict');
assertEqual(appleRes.status, 'RED', 'Apple is RED in Phase 1');

// Test Grains Phase 1 vs Phase 2
const ricePhase1 = analyzeFoodClinically('אורז בסמטי לבן', 'phase1_strict');
assertEqual(ricePhase1.status, 'YELLOW', 'White Rice is YELLOW (controlled portion) in Phase 1');

const ricePhase2 = analyzeFoodClinically('אורז בסמטי לבן', 'phase2_moderate');
assertEqual(ricePhase2.status, 'GREEN', 'White Rice is GREEN in Phase 2');

// Test Coffee & Turkish Coffee
const turkishCoffee = analyzeFoodClinically('קפה שחור טורקי עלית', 'phase1_strict');
assertEqual(turkishCoffee.status, 'GREEN', 'Pure Turkish Coffee is GREEN for Nir in Phase 1');

// Test Beer & Goldstar Barcodes and Classification
const goldstar = ISRAELI_SUPERMARKET_CATALOG['7290000185012'];
assert(!!goldstar, 'Found Goldstar beer barcode 7290000185012');
assert(goldstar?.productName?.includes('גולדסטאר'), 'Goldstar beer name is correct');

const goldstarRes = analyzeFoodClinically('בירה גולדסטאר לאגר', 'phase1_strict');
assertEqual(goldstarRes.status, 'RED', 'Goldstar Beer is strictly RED for SIBO');
assert(
  goldstarRes.safeSubstitutions.some(s => s.includes('יין') || s.includes('ג׳ין') || s.includes('סודה')),
  'Beer offers safe alcoholic/drink alternatives (Dry Wine / Gin / Soda)'
);

const nesherMalt = analyzeFoodClinically('בירה שחורה נשר מאלט', 'phase1_strict');
assertEqual(nesherMalt.status, 'RED', 'Nesher Malt is strictly RED');

// Test Maccabee 7.9% Beer
const maccabee79 = ISRAELI_SUPERMARKET_CATALOG['7290000185227'];
assert(!!maccabee79, 'Found Maccabee 7.9% barcode 7290000185227');
assert(maccabee79?.productName?.includes('מכבי 7.9%'), 'Maccabee 7.9% name is correct');

const maccabeeRes = analyzeFoodClinically('בירה מכבי 7.9%', 'phase1_strict');
assertEqual(maccabeeRes.status, 'RED', 'Maccabee 7.9% is strictly RED for Nir');

// Test Corona Extra Barcodes & SIBO Classification
const corona1 = ISRAELI_SUPERMARKET_CATALOG['7501064191402'];
assert(!!corona1, 'Found Corona Extra 330ml barcode 7501064191402');
assert(corona1?.productName?.includes('קורונה'), 'Corona Extra 330ml name is correct');

const corona2 = ISRAELI_SUPERMARKET_CATALOG['080660956153'];
assert(!!corona2, 'Found Corona Extra 355ml UPC barcode 080660956153');

const coronaRes = analyzeFoodClinically('בירה קורונה אקסטרה', 'phase1_strict');
assertEqual(coronaRes.status, 'RED', 'Corona Beer is strictly RED for Nir');

// Test Alpro Almond No Sugars (Safe Dairy Alternative)
const alpro = ISRAELI_SUPERMARKET_CATALOG['5411188130833'];
assert(!!alpro, 'Found Alpro Almond No Sugars barcode 5411188130833');
assert(alpro?.productName?.includes('שקדים') || alpro?.productName?.includes('אלפרו'), 'Alpro Almond name is correct');

// Test Rio Mare Tuna in Olive Oil (Zero FODMAP protein)
const rioMare = ISRAELI_SUPERMARKET_CATALOG['8004030010011'];
assert(!!rioMare, 'Found Rio Mare Tuna barcode 8004030010011');

// Test Nespresso Capsules
const nespresso = ISRAELI_SUPERMARKET_CATALOG['7640149010011'];
assert(!!nespresso, 'Found Nespresso Ristretto barcode 7640149010011');

// Test B&D Rice Cakes
const bdRice = ISRAELI_SUPERMARKET_CATALOG['7290003040017'];
assert(!!bdRice, 'Found B&D Rice Cakes barcode 7290003040017');

// Test Beverage Substitutions Resolver
const teaSubs = getSmartCategoricalSubstitutions('תה פיוז תה משקה קר');
assert(
  teaSubs.some(s => s.includes('קפה') || s.includes('תה') || s.includes('סודה') || s.includes('ג׳ינג׳ר')),
  'Beverage queries offer proper beverage substitutions'
);

// Test Ingredients list parsing (Barcode / OCR scenario)
const ingredientsTest = analyzeFoodClinically(
  'רכיבים: מים, סוכר, רכז מיץ תפוחים, שום יבש, חומצת לימון',
  'phase1_strict'
);
assertEqual(ingredientsTest.status, 'RED', 'Ingredient list with Garlic & Apple Juice correctly flags RED');
assert(ingredientsTest.ingredientsBreakdown?.length > 0, 'Ingredient breakdown contains parsed items');

// Test Fresh Orange Juices, Pure Cocoa, and Plant Whipping Cream clinical classification
const priMorTest = analyzeFoodClinically('מיץ תפוזים 100% סחוט טרי פרי מור', 'phase1_strict');
assertEqual(priMorTest.status, 'YELLOW', 'Pri Mor Fresh Orange Juice is YELLOW (limited to 100ml / half cup)');

const priNivTest = analyzeFoodClinically('מיץ תפוזים סחוט טבעי פרי ניב', 'phase1_strict');
assertEqual(priNivTest.status, 'YELLOW', 'Pri Niv Fresh Orange Juice is YELLOW');

const cocoaTest = analyzeFoodClinically('אבקת קקאו עלית 100% טהור לאפייה', 'phase1_strict');
assertEqual(cocoaTest.status, 'GREEN', 'Pure Cocoa Powder is GREEN (0 lactose, low FODMAP)');

const whipTest = analyzeFoodClinically('קצפת צמחית להקצפה ריץ פרווה', 'phase1_strict');
assertEqual(whipTest.status, 'GREEN', 'Plant-based Whipping Cream (Richs) is GREEN (dairy free, 0 lactose)');

const chefLavanWhip = analyzeFoodClinically('קצפת צמחית השף הלבן פרווה', 'phase1_strict');
assertEqual(chefLavanWhip.status, 'GREEN', 'Chef Lavan Plant-based Whipping Cream is GREEN');

// Test Conversational Questions & Advisory Recommender (e.g. Salad, Vegetables, Meals)
const saladQueryRes = analyzeFoodClinically('אני רוצה להכין סלט איזה ירקות אני יכול להשתמש', 'phase1_strict');
assertEqual(saladQueryRes.status, 'GREEN', 'Salad conversational question returns GREEN status');
assert(saladQueryRes.foodName.includes('סלט'), 'Salad food name is identified properly');
assert(saladQueryRes.detailedExplanation.includes('מלפפון'), 'Salad guide includes cucumber');
assert(saladQueryRes.detailedExplanation.includes('חסה'), 'Salad guide includes lettuce');
assert(saladQueryRes.detailedExplanation.includes('שמן זית'), 'Salad guide includes olive oil');
assert(saladQueryRes.detailedExplanation.includes('בצל חי'), 'Salad guide warns against raw onion');

const vegQueryRes = analyzeFoodClinically('איזה ירקות מותרים', 'phase1_strict');
assertEqual(vegQueryRes.status, 'GREEN', 'Vegetable guide returns GREEN status');

const mealQueryRes = analyzeFoodClinically('מה אפשר לאכול לארוחת בוקר', 'phase1_strict');
assertEqual(mealQueryRes.status, 'GREEN', 'Breakfast guide returns GREEN status');

const soupQueryRes = analyzeFoodClinically('אני רוצה להכין מרק', 'phase1_strict');
assertEqual(soupQueryRes.status, 'GREEN', 'Soup guide returns GREEN status');
assert(soupQueryRes.foodName.includes('מרק'), 'Soup food name is identified properly');
assert(soupQueryRes.detailedExplanation.includes('בצל חי'), 'Soup guide warns against onion');

const chickenQueryRes = analyzeFoodClinically('איך לתבל עוף', 'phase1_strict');
assertEqual(chickenQueryRes.status, 'GREEN', 'Meat & Poultry guide returns GREEN status');

const eggQueryRes = analyzeFoodClinically('איך להכין שקשוקה לסיבו', 'phase1_strict');
assertEqual(eggQueryRes.status, 'GREEN', 'Egg & Shakshuka guide returns GREEN status');

const dairyQueryRes = analyzeFoodClinically('איזה גבינות מותר', 'phase1_strict');
assertEqual(dairyQueryRes.status, 'GREEN', 'Dairy & Cheese guide returns GREEN status');

const dessertQueryRes = analyzeFoodClinically('איזה מתוק מותר', 'phase1_strict');
assertEqual(dessertQueryRes.status, 'GREEN', 'Dessert & Sweet guide returns GREEN status');

const breadQueryRes = analyzeFoodClinically('איזה לחם מותר', 'phase1_strict');
assertEqual(breadQueryRes.status, 'YELLOW', 'Bread & Pasta guide returns YELLOW status');

// Test Unidentified product fallback (Strict safety & friendly guidance for Nir)
const unknownRes = analyzeFoodClinically('מוצר ארוז לא מזוהה 9999999', 'phase1_strict');
assertEqual(unknownRes.status, 'RED', 'Unidentified product flags RED in Phase 1 for safety');
assert(unknownRes.detailedExplanation.includes('סרקי שוב את הברקוד'), 'Advises user with friendly custom message to rescan or type');

// -----------------------------------------------------------------------------
// 5. SIBO MEDICAL ARTICLES & MEAL SUGGESTIONS
// -----------------------------------------------------------------------------
console.log('\n🔹 5. Testing SIBO Articles, Meal Suggestions & Hunger SOS:');
assert(SIBO_MEDICAL_ARTICLES.length >= 4, `Contains ${SIBO_MEDICAL_ARTICLES.length} curated clinical SIBO articles`);
assert(SIBO_MEDICAL_ARTICLES.some(a => a.authors.includes('Siebecker')), 'Includes Dr. Siebecker protocol');
assert(SIBO_MEDICAL_ARTICLES.some(a => a.authors.includes('Jacobi')), 'Includes Dr. Jacobi Bi-Phasic protocol');

assert(SIBO_MEAL_SUGGESTIONS.length >= 8, `Contains ${SIBO_MEAL_SUGGESTIONS.length} recipes in meal suggestions`);
assert(SIBO_MEAL_SUGGESTIONS.some(r => r.phase === 'phase1'), 'Contains Phase 1 recipes');
assert(SIBO_MEAL_SUGGESTIONS.some(r => r.phase === 'phase2'), 'Contains Phase 2 recipes');

// Test Hunger SOS Quick Satiety Foods
const eggCheck = analyzeFoodClinically('ביצה קשה עם שמן זית ומלח', 'phase1_strict');
assertEqual(eggCheck.status, 'GREEN', 'Hard boiled egg + olive oil is 100% GREEN for quick satiety');

const tunaCheck = analyzeFoodClinically('טונה בשמן זית ומלפפון', 'phase1_strict');
assertEqual(tunaCheck.status, 'GREEN', 'Tuna in olive oil + cucumber is 100% GREEN for quick satiety');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================');

if (failed > 0) {
  console.error('\n🚨 FAILURES DETECTED:');
  failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 ALL TESTS PASSED! System is 100% healthy, verified, and operational.');
  process.exit(0);
}
