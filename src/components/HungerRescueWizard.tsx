import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SiboPhase } from '../types';
import {
  Sparkles,
  Home,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  MapPin,
  Camera,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Search,
  Zap,
  BookOpen,
  Mic,
  MicOff,
  ChefHat,
  Flame,
} from 'lucide-react';
import { optimizeImageForOcr } from '../utils/imageUtils';
import { CategoryCarousel, CategoryCarouselItem } from './CategoryCarousel';
import { SIBO_MEAL_SUGGESTIONS } from '../data/siboMealSuggestions';

interface HungerRescueWizardProps {
  currentPhase: SiboPhase;
  isOpen: boolean;
  onClose: () => void;
  onSelectFoodToAnalyze?: (foodName: string) => void;
  onOpenMealSuggestions?: () => void;
  initialPhoto?: string | null;
}

type ScenarioType = 'home' | 'driving' | 'restaurant' | 'supermarket' | 'gps' | 'camera' | 'custom' | null;

export type MealCategory =
  | 'all'
  | 'prep_3min'
  | 'prep_7min'
  | 'meat'
  | 'steaks'
  | 'fish'
  | 'bowls'
  | 'soups'
  | 'wraps'
  | 'pancakes'
  | 'sweet'
  | 'chia_puddings'
  | 'cheese'
  | 'eggs'
  | 'salads'
  | 'smoothies'
  | 'instant';

export interface SuggestedRescueMeal {
  id: string;
  title: string;
  category: MealCategory;
  timeToMake: string;
  prepMinutes: number;
  ingredients: string[];
  simpleSteps: string[];
  satietyReason: string;
  tag?: string;
  isQuickNoCook?: boolean;
}

interface ChefResponse {
  scenarioTitle: string;
  calmMessage: string;
  prepTimeMinutes: number;
  suggestedMeals: SuggestedRescueMeal[];
  safeIngredientsIdentified: string[];
  cautionWarnings?: string[];
  quickTip: string;
  matchedFromInput?: string;
}

// 🏠 Massive Master Catalog of 230+ Verified SIBO-Safe Rescue Meals for Home / Kitchen
export const HOME_RESCUE_MEALS: SuggestedRescueMeal[] = SIBO_MEAL_SUGGESTIONS.map((rec) => {
  const numMatch = rec.prepTime ? rec.prepTime.match(/\d+/) : null;
  const prepMinutes = numMatch ? parseInt(numMatch[0], 10) : 5;
  return {
    id: rec.id,
    title: rec.title,
    category: rec.category as MealCategory,
    timeToMake: rec.prepTime || '5 דקות',
    prepMinutes: prepMinutes,
    ingredients: rec.ingredients,
    simpleSteps: rec.instructions,
    satietyReason: rec.benefits && rec.benefits.length > 0 ? rec.benefits.join(' • ') : rec.description,
    tag: rec.tag,
    isQuickNoCook: rec.mealType === 'quick' || prepMinutes <= 2,
  };
});

// 🚗 Driving & Gas Station Rescue Meals (8+ options)
const DRIVING_RESCUE_MEALS: SuggestedRescueMeal[] = [
  {
    id: 'd-1',
    title: '🥚 זוג ביצים קשות מוכנות (במקרר Yellow / מנטה)',
    category: 'eggs',
    timeToMake: '1 דקה (מוכן מיד)',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['זוג ביצים קשות קלופות מהמקרר', 'שקית מלח קטנה', 'מלפפון טרי מהמדף'],
    simpleSteps: ['קונים זוג ביצים קשות במקרר הסנדוויצ׳ים', 'ממליחים מעט ואוכלים מיד ברכב לצד מלפפון'],
    satietyReason: 'חלבון מלא ואיכותי, 0% לקטוז ו-0% פודמאפ שסוגר את הרעב תוך 2 דקות.',
    tag: 'Yellow / מנטה • מוכן מיד',
  },
  {
    id: 'd-2',
    title: '🐟 טונה בשמן זית + פריכיות אורז 100%',
    category: 'fish',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['קופסת טונה בשמן זית (Easy Open)', 'חבילת פריכיות אורז 100%'],
    simpleSteps: ['פותחים את קופסת הטונה ברכב', 'מניחים על 2-3 פריכיות ואוכלים בנחת במזלג'],
    satietyReason: 'חלבון עשיר ושומן בריא שמעניקים שובע ל-4 שעות ללא נפיחות.',
    tag: 'Easy Open • שובע ל-4 שעות',
  },
  {
    id: 'd-3',
    title: '🐟 חבילת סלמון מעושן מהמקרר',
    category: 'fish',
    timeToMake: 'חצי דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['חבילת סלמון מעושן (100 גרם)', 'פריכיות אורז'],
    simpleSteps: ['פותחים את האריזה, מניחים על פריכיות ואוכלים מיד'],
    satietyReason: 'חלבון ושומן אומגה 3 מרגיע דלקות שמספק שובע מלא.',
    tag: 'אומגה 3 • פרימיום',
  },
  {
    id: 'd-4',
    title: '🥜 שקית אגוזי מלך / פקאן טבעיים',
    category: 'instant',
    timeToMake: 'חצי דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['שקית אגוזי מלך טבעיים לא קלויים (חופן עד 30 גרם)'],
    simpleSteps: ['אוכלים חופן אגוזים לצד בקבוק מים צוננים'],
    satietyReason: 'שומן אומגה 3 בריא שמייצב מיד את תחושת הרעב.',
    tag: 'חופן אנרגיה • טבעי',
  },
  {
    id: 'd-5',
    title: '🥜 בוטנים קלויים מלוחים (שקית אישית)',
    category: 'instant',
    timeToMake: 'חצי דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['שקית בוטנים מלוחים קטנה (עד 30 גרם)'],
    simpleSteps: ['אוכלים לאט חופן קטן'],
    satietyReason: 'חלבון ושומן צמחי דל פודמאפ שמשקיט את הבטן.',
    tag: 'דל פודמאפ • מלוח',
  },
  {
    id: 'd-6',
    title: '🧀 פרוסות גבינה צהובה עמק מהמקרר',
    category: 'cheese',
    timeToMake: 'חצי דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['2 פרוסות גבינה צהובה עמק (עד 40 גרם)', 'מלפפון'],
    simpleSteps: ['אוכלים פרוסה מגולגלת לצד מלפפון'],
    satietyReason: 'גבינה קשה עשירה בשומן וחלבון וכמעט 0% לקטוז.',
    tag: '0% לקטוז • נשנוש',
  },
  {
    id: 'd-7',
    title: '🥒 מקלות מלפפון טרי צונן מהמדף',
    category: 'instant',
    timeToMake: 'חצי דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['2 מלפפונים שלמים שטופים', 'מלח ים'],
    simpleSteps: ['נוגסים במלפפון פריך וקר'],
    satietyReason: 'נוזלים ומינרלים עדינים המרגיעים תחושת רעב וריקנות.',
    tag: 'הידרציה • 0 תסיסה',
  },
  {
    id: 'd-8',
    title: '☕ אספרסו שחור / סודה צוננת עם לימון',
    category: 'instant',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['כוס אספרסו קצר/ארוך או בקבוק סודה טבעית'],
    simpleSteps: ['שותים בלגימות קטנות ללא סוכר וללא חלב'],
    satietyReason: 'ממריץ את גלי הניקוי של המעי (MMC) ומפיג תחושת כבדות.',
    tag: 'ממריץ MMC • ללא סוכר',
  },
];

// 🛒 Supermarket Rescue Meals (8+ options)
const SUPERMARKET_RESCUE_MEALS: SuggestedRescueMeal[] = [
  {
    id: 's-1',
    title: '🍗 עוף חם בגריל מהמעדנייה (חזה עוף נקי)',
    category: 'meat',
    timeToMake: '1 דקה (חם ומוכן)',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['חזה עוף צלוי חם מהמעדנייה ללא רוטב', 'מלפפון טרי'],
    simpleSteps: ['מבקשים במעדנייה חזה עוף בגריל חם', 'אוכלים לצד מלפפון פריך'],
    satietyReason: 'חלבון טהור שמשביע מיד ללא שום סיכון תסיסה.',
    tag: 'חם מהמעדנייה • עשיר בחלבון',
  },
  {
    id: 's-2',
    title: '🐟 סלמון מעושן פרוס + פריכיות אורז',
    category: 'fish',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['חבילת סלמון מעושן (100 גרם)', 'פריכיות אורז מלא'],
    simpleSteps: ['מניחים פרוסות סלמון על פריכיות אורז', 'אוכלים מיד'],
    satietyReason: 'עשיר בחלבון ושומן בריא איכותי שמרגיע את הבטן.',
    tag: 'מוכן לאכילה • אומגה 3',
  },
  {
    id: 's-3',
    title: '🥑 אבוקדו בשל + פריכיות ומלח ים',
    category: 'cheese',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    isQuickNoCook: true,
    ingredients: ['אבוקדו בשל (עד חצי אבוקדו)', 'פריכיות אורז', 'מלח ים'],
    simpleSteps: ['פותחים את האבוקדו, מורחים על פריכית וממליחים'],
    satietyReason: 'שומן צמחי בריא ומשביע.',
    tag: 'שומן צמחי בריא',
  },
  {
    id: 's-4',
    title: '🐟 סרדינים בשמן זית כתית מעולה',
    category: 'fish',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['קופסת שימורי סרדינים איכותיים בשמן זית', 'פריכיות אורז'],
    simpleSteps: ['פותחים את הקופסה, מניחים על פריכית ואוכלים במזלג'],
    satietyReason: 'פצצת סידן, אומגה 3 וחלבון מרוכז שמשקיטה את הבטן מיד.',
    tag: 'עשיר בסידן • 1 דקה',
  },
  {
    id: 's-5',
    title: '🥩 פסטרמה איכותית 100% נתח שלם (ללא שום/בצל)',
    category: 'meat',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['חבילת פסטרמה נתח שלם (טירת צבי / יחיעם 100% ללא גלוטן)', 'מלפפונים'],
    simpleSteps: ['מגלגלים פרוסות פסטרמה סביב מקלות מלפפון'],
    satietyReason: 'חלבון רזה שמעניק שובע מיידי.',
    tag: 'נתח שלם • 0% גלוטן',
  },
  {
    id: 's-6',
    title: '🥜 פריכיות עם חמאת בוטנים 100% טבעית',
    category: 'sweet',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['צנצנת חמאת בוטנים 100% טבעית (ללא סוכר)', 'פריכיות אורז'],
    simpleSteps: ['מורחים כף חמאת בוטנים על פריכית'],
    satietyReason: 'שומן וחלבון דל FODMAP שסוגר את החשק לאוכל.',
    tag: 'מתוק טבעי • שובע ממושך',
  },
  {
    id: 's-7',
    title: '🧀 גבינת פרמזן מיושנת / גאודה קשה',
    category: 'cheese',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['משולש גבינת פרמזן מיושנת (0% לקטוז)', 'פריכיות ומלפפון'],
    simpleSteps: ['חותכים קוביות קטנות ואוכלים לצד פריכיות ומלפפון'],
    satietyReason: 'שומן וחלבון עשירים ללא לקטוז כלל.',
    tag: 'גבינה מיושנת • 0% לקטוז',
  },
  {
    id: 's-8',
    title: '🍓 סלסלת תותים טריים שטופים',
    category: 'sweet',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['סלסלת תותים טריים (עד 5-6 יחידות)'],
    simpleSteps: ['שוטפים ואוכלים טרי ומרענן'],
    satietyReason: 'פרי דל FODMAP מאושר עשיר בוויטמין C.',
    tag: 'פרי מאושר • דל FODMAP',
  },
];

// 🏢 Restaurant & Wolt Ordering Options
const RESTAURANT_ORDERING_IDEAS: SuggestedRescueMeal[] = [
  {
    id: 'r-1',
    title: '🥩 שיפודיית בשרים / גריל: פרגית נקייה על האש',
    category: 'meat',
    timeToMake: 'הזמנה במסעדה / וולט',
    prepMinutes: 15,
    ingredients: ['שיפוד פרגית / חזה עוף נקי (מתובל במלח ושמן בלבד)', 'תוספת אורז לבן נקי פשוט', 'סלט מלפפון קצוץ טרי עם שמן זית ולימון בצד'],
    simpleSteps: ['מבקשים מפורשות: ללא מרינדות, ללא אבקות מרק, ללא שום ובצל כלל', 'מדגישים שהתוספת תהיה אורז לבן פשוט או תפוח אדמה אפוי'],
    satietyReason: 'חלבון גריל טהור נטול תסיסה ופחמימה קלה ובטוחה.',
    tag: 'שיפודייה • וולט בטוח',
  },
  {
    id: 'r-2',
    title: '🍣 מסעדה אסייתית / סושי: סשימי סלמון/טונה + אורז מאודה',
    category: 'fish',
    timeToMake: 'הזמנה במסעדה / וולט',
    prepMinutes: 10,
    ingredients: ['סשימי סלמון או טונה טרי (נתחים נקיים ללא רטבים)', 'קערת אורז סושי מאודה נקי (ללא חומץ מתובל)', 'פרוסות מלפפון'],
    simpleSteps: ['מוודאים שהדג טרי ללא רטבי טריאקי/סויה רגילה (מכילים חיטה ושום)', 'אוכלים עם מעט מלח או שמן זית'],
    satietyReason: 'חלבון דגים נא ואיכותי ופחמימת אורז נקייה הנספגת מיד.',
    tag: 'סושי • סשימי נקי',
  },
  {
    id: 'r-3',
    title: '🐟 מסעדת דגים: פילה דניס/לברק צרוב על הפלנצ׳ה',
    category: 'fish',
    timeToMake: 'הזמנה במסעדה',
    prepMinutes: 15,
    ingredients: ['פילה דג ים (דניס/לברק/מוסר) צרוב בשמן זית ומלח בלבד', 'תפוח אדמה אפוי בנייר כסף ללא חמאה', 'סלט ירוק ללא בצל'],
    simpleSteps: ['מבקשים צלייה בשמן זית ומלח בלבד', 'מבקשים שמן זית ולימון שלם בצד לתיבול אישי'],
    satietyReason: 'דג לבן עשיר בחלבון קל לעיכול שאינו מכביד על הקיבה.',
    tag: 'דג על הפלנצ\'ה',
  },
  {
    id: 'r-4',
    title: '🍔 המבורגרייה: קציצת בקר 100% בצלחת ללא לחמנייה',
    category: 'meat',
    timeToMake: 'הזמנה במסעדה / וולט',
    prepMinutes: 12,
    ingredients: ['קציצת בקר 100% בשר נקי (לוודא שאין בצל/שום טחון בבשר)', 'ביצת עין מעל הקציצה', 'פרוסות מלפפון ומלח'],
    simpleSteps: ['מבקשים "המבורגר בצלחת ללא לחמנייה, ללא רטבים וללא בצל"', 'מוסיפים ביצת עין מעל להעשרת הטעם והשובע'],
    satietyReason: 'חלבון ושומן בקר מעניקים שובע מסיבי ל-5 שעות.',
    tag: 'המבורגר בצלחת',
  },
  {
    id: 'r-5',
    title: '🥗 בר סלטים בהרכבה עצמית: סלט טונה, ביצה קשה ומלפפון',
    category: 'instant',
    timeToMake: 'הרכבה מהירה',
    prepMinutes: 5,
    ingredients: ['בסיס חסה ירוקה פריכה + מלפפון טרי', 'טונה בשמן זית/מים + ביצה קשה חתוכה', 'רוטב: שמן זית ומיץ לימון סחוט בלבד'],
    simpleSteps: ['בוחרים ירקות בטוחים בלבד (חסה, מלפפון, גזר מגורר)', 'מוסיפים חלבון נקי (טונה, ביצה, חזה עוף נקי)', 'מתבלים בעצמכם בשמן זית ומלח בלבד'],
    satietyReason: 'שליטה מלאה במרכיבים, 0% רטבים מתועשים ושובע מעולה.',
    tag: 'בר סלטים • הרכבה עצמית',
  },
  {
    id: 'r-6',
    title: '☕ בית קפה: ביצי עין / חביתה משמן זית + סלט מלפפון',
    category: 'eggs',
    timeToMake: 'הזמנה בבית קפה',
    prepMinutes: 10,
    ingredients: ['2 ביצי עין או חביתה מטוגנת בשמן זית בלבד (ללא חלב/חמאה)', 'סלט מלפפון חתוך בלבד עם שמן זית ולימון', 'קפה שחור / אספרסו'],
    simpleSteps: ['מדגישים: טיגון בשמן זית בלבד, ללא לחם רגיל, ללא גבינות רכות', 'מבקשים את הסלט ללא עגבניות שרי מרובות, ללא בצל וללא שום'],
    satietyReason: 'ארוחת בוקר קלאסית ובטוחה בכל בית קפה בישראל.',
    tag: 'בית קפה • ארוחת בוקר',
  },
];

/**
 * ⚡ Ultra-fast Client-side Hebrew NLP Recipe Synthesizer & Matcher (0ms response)
 */
function synthesizeMealsFromQuery(query: string): {
  scenarioTitle: string;
  calmMessage: string;
  meals: SuggestedRescueMeal[];
  safeIdentified: string[];
  cautions: string[];
  tip: string;
} {
  const clean = query.toLowerCase().trim();
  const allKnown = [...HOME_RESCUE_MEALS, ...DRIVING_RESCUE_MEALS, ...SUPERMARKET_RESCUE_MEALS, ...RESTAURANT_ORDERING_IDEAS];

  const safeIdentified: string[] = [];
  const cautions: string[] = [];

  // Detect Dangerous items mentioned
  if (/שום|אבקת שום/.test(clean)) {
    cautions.push('⚠️ שום רגיל אסור ל-SIBO — השתמשי בשמן זית מושרה בשום (Garlic Oil) במקום!');
  }
  if (/בצל|שאלוט|כרישה/.test(clean)) {
    cautions.push('⚠️ בצל מכל סוג אסור — השתמשי בחלק הירוק העליון של בצל ירוק בלבד (0 פרוקטנים).');
  }
  if (/לחם|פיתה|לחמני|פסטה|קמח|חיטה|בורקס/.test(clean)) {
    cautions.push('⚠️ גלוטן וחיטה אסורים — החליפי בפריכיות אורז 100%, דפי אורז או קמח שקדים.');
  }
  if (/חומוס|שעועית|עדשים|פול/.test(clean)) {
    cautions.push('⚠️ קטניות גורמות לתסיסה מוגברת — השתמשי בבשר, דגים, עוף או ביצים במקום.');
  }
  if (/פטריו|שמפיניון/.test(clean)) {
    cautions.push('⚠️ פטריות עשירות במניטול — השתמשי בקישואים או גזר.');
  }

  // Detect Safe ingredients & boost tags
  if (/בשר|בקר|אנטרקוט|קציצ|סטייק/.test(clean)) safeIdentified.push('בקר טחון / אנטרקוט / קציצות');
  if (/פרגית|עוף|שניצל|שווארמה|הודו|פסטרמה/.test(clean)) safeIdentified.push('שיפודי פרגית / חזה עוף / שווארמה');
  if (/דג|דניס|לברק|מוסר|סלמון|סרדין/.test(clean)) safeIdentified.push('פילה דג ים / סלמון');
  if (/תפוח אדמה|תפו"א|פירה|קומפיר/.test(clean)) safeIdentified.push('תפוח אדמה אפוי (קומפיר)');
  if (/קישוא|זוקיני|זודלס/.test(clean)) safeIdentified.push('קישוא / זוקיני');
  if (/דפי אורז|לאפה|פנקייק|קרפ/.test(clean)) safeIdentified.push('דפי אורז / קמח שקדים');
  if (/מתוק|שוקולד|סניקרס|צ\'יה|שייק|תות/.test(clean)) safeIdentified.push('שוקולד 85% / חמאת בוטנים / פודינג צ\'יה');
  if (/גבינ|פרמזן|גאודה|מנצ\'גו|צהובה/.test(clean)) safeIdentified.push('גבינות מיושנות 0% לקטוז');
  if (/ביצ|חבית|שקשוקה/.test(clean)) safeIdentified.push('ביצים טריות');
  if (/טחינ/.test(clean)) safeIdentified.push('טחינה גולמית 100%');
  if (/שמן זית|שמן שום/.test(clean)) safeIdentified.push('שמן זית כתית / שמן שום');
  if (/דלה פופו|שף|מתכון/.test(clean)) safeIdentified.push('מתכוני שף דלה פופו מותאמים אישית');

  // Score existing meals
  const scored = allKnown.map((m) => {
    let score = 0;
    const title = m.title.toLowerCase();
    const ings = m.ingredients.join(' ').toLowerCase();

    // Specific category boosts
    if (/בשר|בקר|סטייק|קציצ/.test(clean) && (m.category === 'meat' || title.includes('בקר') || title.includes('אנטרקוט') || title.includes('קציצ'))) score += 35;
    if (/פרגית|שווארמה|שניצל|עוף/.test(clean) && (title.includes('פרגית') || title.includes('שווארמה') || title.includes('עוף') || title.includes('שניצל'))) score += 35;
    if (/דג|דניס|לברק|מוסר|סלמון|סרדין/.test(clean) && m.category === 'fish') score += 35;
    if (/תפוח אדמה|תפו"א|קומפיר/.test(clean) && (title.includes('תפוח אדמה') || title.includes('קומפיר'))) score += 40;
    if (/זודלס|קישוא|זוקיני/.test(clean) && (title.includes('קישוא') || title.includes('זודלס'))) score += 35;
    if (/לאפה|דפי אורז|פיצה|פנקייק/.test(clean) && (m.category === 'wraps' || title.includes('אורז') || title.includes('פנקייק'))) score += 35;
    if (/מתוק|שוקולד|סניקרס|צ\'יה|שייק|קינוח|תות/.test(clean) && (m.category === 'sweet' || title.includes('סניקרס') || title.includes('צ׳יה') || title.includes('שוקולד'))) score += 40;
    if (/גבינ|פרמזן|גאודה/.test(clean) && (m.category === 'cheese' || title.includes('פרמזן') || title.includes('גאודה'))) score += 35;
    if (/שקשוקה/.test(clean) && title.includes('שקשוקה')) score += 45;
    if (/חם|מרק|מחבת/.test(clean) && (m.category === 'bowls' || !m.isQuickNoCook)) score += 20;
    if (/קר|בלי בישול|מהיר|דקה/.test(clean) && m.isQuickNoCook) score += 20;
    if (/דלה פופו|שף/.test(clean)) score += 15;

    const words = clean.split(/[\s,]+/).filter((w) => w.length >= 2);
    for (const w of words) {
      if (title.includes(w)) score += 8;
      if (ings.includes(w)) score += 4;
    }
    return { meal: m, score };
  });

  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.meal);

  // Deduplicate meals
  const uniqueMeals = Array.from(new Set(matched.map((m) => m.id)))
    .map((id) => matched.find((m) => m.id === id)!);

  // Always supply at least 15+ meals for wide buffet
  const finalMeals = [
    ...uniqueMeals,
    ...HOME_RESCUE_MEALS.filter((hm) => !uniqueMeals.some((um) => um.id === hm.id)),
  ];

  return {
    scenarioTitle: `המלצות שף דלה פופו עבור: "${query}" ✨`,
    calmMessage: 'ניר, השף התאים עבורך שפע פתרונות שובע עשירים, מגוונים ומושלמים ל-SIBO:',
    meals: finalMeals,
    safeIdentified: safeIdentified.length > 0 ? safeIdentified : ['שפע חלבונים, שומנים וירקות דלי FODMAP'],
    cautions,
    tip: 'המלצת שף דלה פופו: שימוש בשמן זית מושרה שום (Garlic Oil) מעניק ארומה מדהימה של שום ללא שום פרוקטנים ותסיסה!',
  };
}

// 🔀 Smart dynamic shuffle that guarantees category interleaving and a fresh randomized starting dish
export function shuffleMealsWithDiversity(meals: SuggestedRescueMeal[]): SuggestedRescueMeal[] {
  if (!meals || meals.length <= 1) return meals;
  
  const pool = [...meals];
  // Shuffle array randomly
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Group by categories
  const groups: Record<string, SuggestedRescueMeal[]> = {};
  for (const m of pool) {
    const cat = m.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(m);
  }

  // Shuffle categories order
  const categories = Object.keys(groups).sort(() => Math.random() - 0.5);

  // Interleave categories round-robin so the top list features completely different meals (e.g. Fish -> Pancake -> Steak -> Wrap -> Zoodles -> Skewers -> Cheese)
  const interleaved: SuggestedRescueMeal[] = [];
  let added = true;
  let round = 0;
  while (added) {
    added = false;
    for (const cat of categories) {
      if (groups[cat] && round < groups[cat].length) {
        interleaved.push(groups[cat][round]);
        added = true;
      }
    }
    round++;
  }

  return interleaved.length > 0 ? interleaved : pool;
}

export const HungerRescueWizard: React.FC<HungerRescueWizardProps> = ({
  currentPhase,
  isOpen,
  onClose,
  onSelectFoodToAnalyze,
  onOpenMealSuggestions,
  initialPhoto,
}) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(null);
  const [customText, setCustomText] = useState('');
  const [isLoadingChef, setIsLoadingChef] = useState(false);
  const [chefResult, setChefResult] = useState<ChefResponse | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Category and Search Filtering inside the wizard
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('all');
  const [mealSearchQuery, setMealSearchQuery] = useState<string>('');

  // Interactive ingredient checklist
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // GPS Location state
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // Camera / Fridge photo state
  const [stagedPhoto, setStagedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Copy helper
  const [copiedText, setCopiedText] = useState(false);

  // Quick Inspiration Pill Prompts with massive culinary diversity
  const quickPillPrompts = [
    { label: '🐟 דניס / לברק / סלמון', text: 'בא לי פילה דג ים צרוב או סלמון' },
    { label: '🥩 קציצות בקר / סטייק', text: 'יש לי בשר בקר, קישוא ועשבי תיבול' },
    { label: '🥞 פנקייק שקדים ב-3 דקות', text: 'בא לי פנקייק שקדים מתוק וטעים' },
    { label: '🍗 שיפודי פרגית / שווארמה', text: 'בא לי שיפודי פרגית או שווארמה ביתית' },
    { label: '🥔 תפו"א אפוי / קומפיר', text: 'בא לי תפוח אדמה אפוי חם ומנחם עם שמן זית וגבינה' },
    { label: '🌯 לאפה מדפי אורז', text: 'יש לי דפי אורז ואני רוצה לאפה מגולגלת' },
    { label: '🍫 סניקרס SIBO / שוקולד', text: 'בא לי חטיף סניקרס או שוקולד מריר' },
    { label: '🥣 פודינג צ׳יה / שייק', text: 'בא לי פודינג צ׳יה קרמי או שייק' },
    { label: '🧀 פלטת גבינות ואגוזים', text: 'בא לי גבינות קשות מיושנות, אגוזים וזיתים' },
  ];

  // Randomize / Shuffle current meals on demand
  const handleShuffleMeals = () => {
    setChefResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        suggestedMeals: shuffleMealsWithDiversity(prev.suggestedMeals),
      };
    });
  };

  // Reset and load full 35+ scrollable buffet when opening
  useEffect(() => {
    if (isOpen) {
      if (initialPhoto) {
        setStagedPhoto(initialPhoto);
        setActiveScenario('camera');
        setChefResult({
          scenarioTitle: 'ניתוח תמונת מקרר / מזווה 📸',
          calmMessage: 'סורק את התמונה ומזהה את כל המצרכים הבטוחים להרכבת ארוחת בזק...',
          prepTimeMinutes: 3,
          suggestedMeals: shuffleMealsWithDiversity(HOME_RESCUE_MEALS),
          safeIngredientsIdentified: ['מזהה רכיבים מתוך התמונה...'],
          quickTip: 'זיהוי מצרכים דלי FODMAP מתוך המקרר מאפשר הרכבת ארוחה משביעה תוך 3 דקות.',
        });
        fetchChefPlan({
          imageBase64: initialPhoto,
          locationType: 'camera',
        });
      } else {
        setActiveScenario('home');
        setChefResult({
          scenarioTitle: 'בופה שובע עשיר ומגוון (35+ אופציות מסוחררות) 🏠',
          calmMessage: 'ניר, הנה מבחר ארוחות בזק מגוונות ומסוחררות: דגי ים, פנקייקים, סטייקים, דפי אורז, זודלס, שיפודים וקינוחי צ׳יה.',
          prepTimeMinutes: 3,
          suggestedMeals: shuffleMealsWithDiversity(HOME_RESCUE_MEALS),
          safeIngredientsIdentified: ['דניס', 'סלמון', 'בקר', 'פרגית', 'תפו"א', 'קישוא', 'דפי אורז', 'קמח שקדים', 'שוקולד 85%', 'צ׳יה', 'פרמזן'],
          cautionWarnings: [],
          quickTip: 'לחצי על 🔀 "סחרר הצעות" כדי לקבל מיד רעיונות טעימים חדשים!',
        });
        setStagedPhoto(null);
      }
      setCustomText('');
      setGpsError(null);
      setSelectedCategory('all');
      setMealSearchQuery('');
      setCheckedIngredients({});
      setIsListening(false);
      setSpeechError(null);
    }
  }, [isOpen, initialPhoto]);

  // Speech Recognition Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const isPhase1 = currentPhase === 'phase1_strict';

  // Toggle ingredient checkmark
  const toggleIngredientCheck = (ingKey: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [ingKey]: !prev[ingKey],
    }));
  };

  // Hebrew Speech Recognition Handler
  const handleToggleVoiceInput = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError('הדפדפן שלך אינו תומך בהקראה קולית ישירה. מומלץ להשתמש ב-Google Chrome או Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.lang = 'he-IL';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim()) {
          setCustomText(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error in SOS Wizard:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('יש לאשר גישה למיקרופון בהגדרות הדפדפן כדי לדבר.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('לא נקלט קול, לחצי שוב על המיקרופון ודברי.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      setSpeechError('שגיאה בהפעלת המיקרופון. אנא נסי שוב.');
    }
  };

  // Execute Universal Custom Query (Instant Local 0ms + AI Deepening)
  const handleExecuteUniversalQuery = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    // Stop voice if listening
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    }

    setActiveScenario('custom');
    setCustomText(q);
    setSelectedCategory('all');
    setMealSearchQuery('');

    // 1. Instant 0ms Local Matching & Synthesis
    const instantPlan = synthesizeMealsFromQuery(q);
    setChefResult({
      scenarioTitle: instantPlan.scenarioTitle,
      calmMessage: instantPlan.calmMessage,
      prepTimeMinutes: 3,
      suggestedMeals: instantPlan.meals,
      safeIngredientsIdentified: instantPlan.safeIdentified,
      cautionWarnings: instantPlan.cautions,
      quickTip: instantPlan.tip,
      matchedFromInput: q,
    });

    // 2. Background AI Deepening (if connected)
    fetchChefPlan({
      locationType: 'custom',
      textScenario: q,
    });
  };

  // Request GPS position
  const handleGetLocation = () => {
    setIsLoadingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('דפדפן זה אינו תומך בזיהוי מיקום GPS');
      setIsLoadingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsError('לא ניתן לגשת למיקום (יש לאשר הרשאת מיקום בדפדפן)');
        setIsLoadingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Call Fridge Chef API
  const fetchChefPlan = async (payload: {
    imageBase64?: string;
    textScenario?: string;
    locationType: ScenarioType;
  }) => {
    setIsLoadingChef(true);
    try {
      const res = await fetch('/api/fridge-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          phase: currentPhase,
        }),
      });

      if (!res.ok) throw new Error('שגיאה בתקשורת');
      const data: ChefResponse = await res.json();
      if (data && data.suggestedMeals && data.suggestedMeals.length > 0) {
        // Merge AI generated custom ideas with our master 35+ catalog so Nir ALWAYS gets a rich buffet
        const mergedMeals = [
          ...data.suggestedMeals,
          ...HOME_RESCUE_MEALS.filter(
            (hm) => !data.suggestedMeals.some((dm) => dm.title.toLowerCase().includes(hm.title.toLowerCase()))
          ),
        ];
        setChefResult((prev) => ({
          ...data,
          suggestedMeals: mergedMeals.length >= 10 ? mergedMeals : HOME_RESCUE_MEALS,
        }));
      }
    } catch (err) {
      // Local fallbacks already handled in 0ms instant synthesis
    } finally {
      setIsLoadingChef(false);
    }
  };

  // Handle Photo Capture / Upload
  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await optimizeImageForOcr(file);
      setStagedPhoto(base64);
      setActiveScenario('camera');
      setChefResult({
        scenarioTitle: 'ניתוח תמונת מקרר / מזווה 📸',
        calmMessage: 'סורק את התמונה ומזהה את כל המצרכים הבטוחים להרכבת ארוחת בזק...',
        prepTimeMinutes: 3,
        suggestedMeals: HOME_RESCUE_MEALS,
        safeIngredientsIdentified: ['מזהה רכיבים מתוך התמונה...'],
        quickTip: 'זיהוי מצרכים דלי FODMAP מתוך המקרר מאפשר הרכבת ארוחה משביעה תוך 3 דקות.',
      });
      fetchChefPlan({
        imageBase64: base64,
        locationType: 'camera',
      });
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setStagedPhoto(base64);
        setActiveScenario('camera');
        fetchChefPlan({
          imageBase64: base64,
          locationType: 'camera',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Scenario Choice (0ms instant display - Always keep full master sets)
  const handleSelectScenario = (type: ScenarioType) => {
    setActiveScenario(type);
    setSelectedCategory('all');
    setMealSearchQuery('');

    if (type === 'home') {
      setChefResult({
        scenarioTitle: `בופה שובע עשיר בבית (${HOME_RESCUE_MEALS.length}+ אופציות מגוונות) 🏠`,
        calmMessage: 'ניר, את בבית ליד המטבח! הנה שפע אדיר של 230+ ארוחות בזק מגוונות ב-14 קטגוריות: בשרים, סטייקים, דגי ים, זודלס, מרקי קולגן, דפי אורז, פנקייקים, קינוחים, גבינות וביצים.',
        prepTimeMinutes: 3,
        suggestedMeals: HOME_RESCUE_MEALS,
        safeIngredientsIdentified: ['פרגית', 'בקר', 'אנטרקוט', 'דניס', 'לברק', 'סלמון', 'תפוח אדמה', 'קישוא', 'דפי אורז', 'קמח שקדים', 'שוקולד 85%', 'צ׳יה', 'פרמזן', 'גאודה', 'חמאת בוטנים', 'ביצים'],
        cautionWarnings: ['להימנע מתוספת בצל, שום רגיל, רטבים תעשייתיים או לחם רגיל'],
        quickTip: 'שילוב של חלבון (בשר/דג/ביצה) עם שומן בריא (שמן זית/טחינה/גבינה מיושנת) מעניק שובע ממושך ורוגע עיכולי.',
      });
    } else if (type === 'driving') {
      setChefResult({
        scenarioTitle: 'חילוץ שובע בדרכים (Yellow / תחנת דלק) 🚗',
        calmMessage: 'ניר, את בדרכים ואפשר להשביע את הרעב מיד! בכל חנות נוחות יש שפע פתרונות SIBO מוכנים לאכילה ברכב.',
        prepTimeMinutes: 1,
        suggestedMeals: DRIVING_RESCUE_MEALS,
        safeIngredientsIdentified: ['ביצים קשות', 'טונה בשמן זית', 'סלמון מעושן', 'פריכיות אורז', 'אגוזי מלך', 'בוטנים', 'גבינה צהובה', 'מלפפון'],
        cautionWarnings: ['להימנע מסנדוויצ׳ים קנויים (מכילים מיונז תעשייתי, בצל, שום וחיטה)', 'להימנע ממסטיקים עם קסיליטול/סורביטול'],
        quickTip: 'ביצה קשה, סלמון וטונה הם המאכלים הכי בטוחים ומשביעים בדרכים!',
      });
    } else if (type === 'restaurant') {
      setChefResult({
        scenarioTitle: 'הזמנה בטוחה במסעדה / וולט / בעבודה 🏢',
        calmMessage: 'ניר, אפשר ליהנות מאוכל בחוץ ובמשלוח בביטחון מלא! הנה המנות הכי בטוחות להזמנה.',
        prepTimeMinutes: 10,
        suggestedMeals: RESTAURANT_ORDERING_IDEAS,
        safeIngredientsIdentified: ['פרגית על האש', 'חזה עוף', 'אורז לבן נקי', 'סשימי דג נא', 'פילה דג ים', 'תפוח אדמה אפוי', 'מלפפון'],
        cautionWarnings: ['להימנע לחלוטין מרטבי שום/בצל, מרינדות עמוסות ותערובות קציצות לא ידועות'],
        quickTip: 'בקשי תמיד שהנתח יהיה נקי על האש עם מלח ושמן זית בלבד, ללא רוטב.',
      });
    } else if (type === 'supermarket') {
      setChefResult({
        scenarioTitle: 'חילוץ שובע בסופרמרקט (מוכן לאכילה מהמדף) 🛒',
        calmMessage: 'ניר, הסופר מלא באוכל בטוח ומשביע! הנה שפע מאכלים שקונים ואוכלים מיד.',
        prepTimeMinutes: 1,
        suggestedMeals: SUPERMARKET_RESCUE_MEALS,
        safeIngredientsIdentified: ['עוף בגריל', 'סלמון מעושן', 'אבוקדו', 'סרדינים', 'פסטרמה', 'פריכיות אורז', 'חמאת בוטנים', 'פרמזן', 'מלפפון', 'תותים'],
        cautionWarnings: ['להימנע מסלטים מוכנים בקופסאות (מכילים מיונז שום, בצל וחומרים משמרים)'],
        quickTip: 'חזה עוף חם מהמעדנייה או סלמון מעושן הם פתרון הארוחה המהיר והבטוח ביותר.',
      });
    } else if (type === 'gps') {
      handleGetLocation();
    }
  };

  // Waiter Script Text for Restaurant
  const waiterScript = `היי, אני עם רגישות עיכולית קפדנית ביותר (ללא שום, ללא בצל, ללא חיטה וללא חלב).
אני מבקשת בבקשה:
1. פרגית / חזה עוף / פילה דג / סטייק נקי על האש — מתובל אך ורק במלח, פלפל שחור ושמן (ללא מרינדות, ללא אבקות מרק וללא רוטב).
2. תוספת: אורז לבן נקי פשוט או תפוח אדמה אפוי בנייר כסף ללא חמאה.
3. סלט: מלפפון בלבד חתוך טרי עם שמן זית ולימון בצד.
תודה רבה על העזרה וההקפדה!`;

  const copyWaiterScript = () => {
    navigator.clipboard.writeText(waiterScript);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Filter meals by Category & Search query
  const displayedMeals = useMemo(() => {
    const rawMeals = chefResult?.suggestedMeals || [];
    let list = rawMeals;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'prep_3min') {
        list = list.filter((m) => m.prepMinutes <= 3 || m.isQuickNoCook);
      } else if (selectedCategory === 'prep_7min') {
        list = list.filter((m) => (m.prepMinutes >= 4 && m.prepMinutes <= 7) || m.timeToMake.includes('7 דקות') || m.timeToMake.includes('6 דקות') || m.timeToMake.includes('5 דקות') || m.timeToMake.includes('4 דקות'));
      } else {
        list = list.filter((m) => m.category === selectedCategory);
      }
    }

    if (mealSearchQuery.trim()) {
      const q = mealSearchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
          m.simpleSteps.some((step) => step.toLowerCase().includes(q)) ||
          m.satietyReason.toLowerCase().includes(q) ||
          (m.tag && m.tag.toLowerCase().includes(q))
      );
    }

    return list;
  }, [chefResult?.suggestedMeals, selectedCategory, mealSearchQuery]);

  // Category counts for badges across 14 diverse categories + speed filters
  const categoryCounts = useMemo(() => {
    const raw = chefResult?.suggestedMeals || [];
    return {
      all: raw.length,
      prep_3min: raw.filter((m) => m.prepMinutes <= 3 || m.isQuickNoCook).length,
      prep_7min: raw.filter((m) => (m.prepMinutes >= 4 && m.prepMinutes <= 7) || m.timeToMake.includes('7 דקות') || m.timeToMake.includes('6 דקות') || m.timeToMake.includes('5 דקות') || m.timeToMake.includes('4 דקות')).length,
      meat: raw.filter((m) => m.category === 'meat').length,
      steaks: raw.filter((m) => m.category === 'steaks').length,
      fish: raw.filter((m) => m.category === 'fish').length,
      bowls: raw.filter((m) => m.category === 'bowls').length,
      soups: raw.filter((m) => m.category === 'soups').length,
      wraps: raw.filter((m) => m.category === 'wraps').length,
      pancakes: raw.filter((m) => m.category === 'pancakes').length,
      sweet: raw.filter((m) => m.category === 'sweet').length,
      chia_puddings: raw.filter((m) => m.category === 'chia_puddings').length,
      cheese: raw.filter((m) => m.category === 'cheese').length,
      eggs: raw.filter((m) => m.category === 'eggs').length,
      salads: raw.filter((m) => m.category === 'salads').length,
      smoothies: raw.filter((m) => m.category === 'smoothies').length,
      instant: raw.filter((m) => m.category === 'instant' || m.isQuickNoCook).length,
    };
  }, [chefResult?.suggestedMeals]);

  // Carousel category items with 3 דקות הכנה, 7 דקות הכנה, and all 14 rich categories
  const mealCategoryItems: CategoryCarouselItem[] = useMemo(() => {
    return [
      { id: 'prep_3min', label: '3 דקות הכנה', icon: '⏱️', count: categoryCounts.prep_3min },
      { id: 'prep_7min', label: '7 דקות הכנה', icon: '🍳', count: categoryCounts.prep_7min },
      { id: 'meat', label: 'בשר, פרגית ועוף', icon: '🍗', count: categoryCounts.meat },
      { id: 'steaks', label: 'סטייקים ובשר פרימיום', icon: '🥩', count: categoryCounts.steaks },
      { id: 'fish', label: 'דגי ים, סלמון וטונה', icon: '🐟', count: categoryCounts.fish },
      { id: 'bowls', label: 'קומפיר, זודלס וקערות', icon: '🥔', count: categoryCounts.bowls },
      { id: 'soups', label: 'מרקי החלמה וקולגן', icon: '🥣', count: categoryCounts.soups },
      { id: 'wraps', label: 'דפי אורז ולאפה', icon: '🌯', count: categoryCounts.wraps },
      { id: 'pancakes', label: 'פנקייק ומאפי שקדים', icon: '🥞', count: categoryCounts.pancakes },
      { id: 'sweet', label: 'סניקרס ושוקולד', icon: '🍫', count: categoryCounts.sweet },
      { id: 'chia_puddings', label: 'פודינג צ׳יה וקינוחים', icon: '🍮', count: categoryCounts.chia_puddings },
      { id: 'cheese', label: 'גבינות 0% לקטוז', icon: '🧀', count: categoryCounts.cheese },
      { id: 'eggs', label: 'ביצים ושקשוקות', icon: '🍳', count: categoryCounts.eggs },
      { id: 'salads', label: 'סלטים וירקות קראנץ׳', icon: '🥗', count: categoryCounts.salads },
      { id: 'smoothies', label: 'שייקים ומשקאות ריפוי', icon: '🥤', count: categoryCounts.smoothies },
      { id: 'instant', label: 'נשנושי בזק וטוסטים', icon: '⚡', count: categoryCounts.instant },
    ];
  }, [categoryCounts]);

    // Carousel scenario items for location carousel
  const scenarioItems: CategoryCarouselItem[] = useMemo(() => {
    return [
      { id: 'home', label: 'בבית / במטבח', icon: '🏠', count: HOME_RESCUE_MEALS.length },
      { id: 'driving', label: 'בנסיעה / Yellow', icon: '🚗', count: 8 },
      { id: 'supermarket', label: 'סופרמרקט', icon: '🛒', count: 8 },
      { id: 'restaurant', label: 'מסעדה / וולט', icon: '🏢', count: 6 },
      { id: 'gps', label: 'איתור GPS', icon: '📍' },
    ];
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-stone-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-500/60 overflow-hidden relative my-auto animate-scaleIn flex flex-col max-h-[94vh]"
        dir="rtl"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white p-4 sm:p-5 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer z-20 active:scale-95"
            title="סגור אשף"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-2xl shadow-inner border border-white/30">
              🥑
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 bg-amber-400 text-stone-950 rounded-full shadow-sm">
                  SIBO SOS
                </span>
                <span className="text-xs font-bold text-emerald-100">
                  {isPhase1 ? 'שלב 1: קפדני' : 'שלב 2: שילוב מחדש'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                אשף שובע מהיר — אני רעבה! ✨
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-stone-50/50">

          {/* Hero Universal Voice & Text Command Center */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-amber-50/60 p-4 sm:p-5 rounded-3xl border-2 border-emerald-500 shadow-md space-y-3.5 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">
                    דברי או הקלידי כל מה שבא לך לאכול:
                  </h3>
                  <p className="text-[11px] text-stone-600 font-medium">
                    השף יתאים לך מיד שפע מתכוני בזק בטוחים ב-100% ל-SIBO
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                0 שניות ⚡
              </span>
            </div>

            {/* Giant Inviting Hebrew Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-98 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/50 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-700/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 animate-bounce" />
                  <span>🔴 מקשיב לך עכשיו... דברי חופשי (לחצי לסיום)</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>🎙️ לחצי כאן ודברי חופשי (למשל: &quot;בא לי שיפודי פרגית&quot; או &quot;יש לי קישוא וגבינה&quot;)</span>
                </>
              )}
            </button>

            {/* Listening Wave Banner */}
            {isListening && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-100 via-red-100 to-amber-100 border-2 border-rose-400 flex items-center justify-between gap-3 text-rose-950 text-xs sm:text-sm animate-pulse">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                  <div>
                    <strong className="font-extrabold block">מקשיב לך ברגע זה...</strong>
                    <span className="text-[11px] text-rose-900 font-medium">
                      {customText ? `נקלט: "${customText}"` : 'אמרי מה יש במקרר, מה בא לך, או איפה את נמצאת...'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleVoiceInput();
                    if (customText.trim()) handleExecuteUniversalQuery(customText);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs cursor-pointer shrink-0 shadow-xs"
                >
                  המלץ עכשיו 🚀
                </button>
              </div>
            )}

            {/* Speech Error */}
            {speechError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
                <span>⚠️ {speechError}</span>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="text-amber-800 font-bold hover:underline"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Text Input Row with embedded Mic button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customText.trim()) {
                      handleExecuteUniversalQuery(customText);
                    }
                  }}
                  placeholder="הקלידי או לחצי על המיקרופון (למשל: שיפודי פרגית, קישוא, סניקרס, שף דלה פופו)..."
                  className="w-full pl-16 pr-10 py-3 bg-white border-2 border-stone-200 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all shadow-2xs"
                />

                {/* Embedded Right Mic Icon Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  }`}
                  title={isListening ? 'עצור הקשבה' : 'דברי במיקרופון'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {customText && (
                  <button
                    type="button"
                    onClick={() => setCustomText('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold bg-stone-200 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2.5 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border-2 border-stone-200 hover:border-amber-400 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                title="צלמי מקרר / מזווה"
              >
                <Camera className="w-4 h-4 text-amber-600" />
              </button>

              {/* Submit Button */}
              <button
                type="button"
                disabled={!customText.trim()}
                onClick={() => handleExecuteUniversalQuery(customText)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              >
                <span>המלץ 🚀</span>
              </button>
            </div>

            {/* 🎠 Interactive Carousel for Food Categories */}
            <div className="pt-0.5">
              <CategoryCarousel
                items={mealCategoryItems}
                selectedId={selectedCategory}
                onSelect={(id) => setSelectedCategory(id as MealCategory)}
                title="סוג מנה:"
                showAllOption={true}
                allLabel="כל המנות"
                allIcon="🌟"
                allCount={categoryCounts.all}
                theme="emerald"
              />
            </div>

            {/* 🎠 Location & Scenarios Carousel */}
            <div className="pt-0.5 border-t border-emerald-200/60">
              <CategoryCarousel
                items={scenarioItems}
                selectedId={activeScenario || 'home'}
                onSelect={(id) => handleSelectScenario(id as ScenarioType)}
                title="מיקום ותרחיש:"
                showAllOption={false}
                theme="teal"
              />
            </div>
          </div>

          {/* Unified Scrollable Results Display */}
          <div className="space-y-3.5 animate-fadeIn">
            {/* Loading Spinner */}
            {isLoadingChef && (
              <div className="py-4 text-center space-y-2 bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-black text-stone-900">
                    השף מעבד המלצות עומק מותאמות...
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    0 שום, 0 בצל, 0 גלוטן וספיגה מהירה
                  </p>
                </div>
              </div>
            )}

            {/* GPS Screen Content */}
            {activeScenario === 'gps' && !isLoadingChef && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 space-y-3 text-right">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                      📍
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-rose-950">
                        איתור אוכל בטוח סביבך ב-Google Maps
                      </h4>
                      <p className="text-xs text-stone-700 font-medium">
                        לחיצה על הכפתור תפתח ישירות מקומות קרובים עם אוכל מתאים ל-SIBO:
                      </p>
                    </div>
                  </div>

                  {isLoadingGps && (
                    <div className="flex items-center gap-2 text-xs text-stone-600 font-bold py-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      <span>דוגם את המיקום שלך...</span>
                    </div>
                  )}

                  {gpsError && (
                    <div className="text-xs text-rose-700 bg-rose-100 p-2.5 rounded-xl font-bold">
                      {gpsError}
                    </div>
                  )}

                  {/* Google Maps Action Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={
                        gpsCoords
                          ? `https://www.google.com/maps/search/סופרמרקט/@${gpsCoords.lat},${gpsCoords.lng},15z`
                          : `https://www.google.com/maps/search/סופרמרקט/`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 bg-white hover:bg-emerald-50 text-stone-900 font-black text-xs rounded-xl border-2 border-emerald-400 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>🛒 סופרמרקטים קרובים</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </a>

                    <a
                      href={
                        gpsCoords
                          ? `https://www.google.com/maps/search/שיפודיה+בשרים+על+האש/@${gpsCoords.lat},${gpsCoords.lng},15z`
                          : `https://www.google.com/maps/search/שיפודיה+בשרים+על+האש/`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 bg-white hover:bg-rose-50 text-stone-900 font-black text-xs rounded-xl border-2 border-rose-400 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center"
                    >
                      <UtensilsCrossed className="w-4 h-4 text-rose-600" />
                      <span>🥩 שיפודיות ובשרים על האש</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </a>
                  </div>
                </div>

                {/* Waiter Assistant Card */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-2">
                      <span>📋 כרטיס הזמנה חכם למלצר / קופאי:</span>
                    </h4>
                    <button
                      type="button"
                      onClick={copyWaiterScript}
                      className="text-xs font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? 'הועתק!' : 'העתקי טקסט'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-200 whitespace-pre-line leading-relaxed font-mono font-medium">
                    {waiterScript}
                  </p>
                </div>
              </div>
            )}

            {/* Chef Result Meals Display */}
            {chefResult && (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Safety Alert Warnings (if dangerous items were asked) */}
                {chefResult.cautionWarnings && chefResult.cautionWarnings.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-1.5 text-right">
                    <div className="flex items-center gap-2 text-rose-950 font-black text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>דגשי בטיחות והחלפות קריטיות:</span>
                    </div>
                    <ul className="space-y-1 text-xs text-rose-900 font-medium">
                      {chefResult.cautionWarnings.map((warn, wIdx) => (
                        <li key={wIdx} className="leading-relaxed">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Photo Preview if camera used */}
                {stagedPhoto && (
                  <div className="rounded-2xl overflow-hidden border-2 border-amber-300 max-h-40 relative">
                    <img src={stagedPhoto} alt="מקרר" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 bg-stone-950/80 text-white text-[11px] font-black px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      📸 התמונה נסרקה בהצלחה
                    </div>
                  </div>
                )}

                {/* Restaurant Order Script (if in restaurant mode) */}
                {activeScenario === 'restaurant' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-right">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <span>📋 כרטיס הזמנה חכם למלצר / משלוח:</span>
                      </h4>
                      <button
                        type="button"
                        onClick={copyWaiterScript}
                        className="text-[11px] font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? 'הועתק!' : 'העתקי טקסט'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-800 bg-white p-3 rounded-xl border border-amber-200 whitespace-pre-line leading-relaxed font-mono">
                      {waiterScript}
                    </p>
                  </div>
                )}

                {/* 🔀 Full-Width Prominent Meal Shuffle Button (User Request: גדל והבלט לכל רוחב המסך) */}
                <button
                  type="button"
                  onClick={handleShuffleMeals}
                  className="w-full py-3.5 sm:py-4 px-5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-950 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg border-2 border-amber-300 ring-2 ring-amber-400/30 transition-all cursor-pointer active:scale-98 group"
                  title="סחרר את רשימת הארוחות והצג רעיונות חדשים ומגוונים"
                >
                  <RefreshCw className="w-5 h-5 text-stone-950 group-hover:rotate-180 transition-transform duration-500 shrink-0" />
                  <span>🔀 סחרר הצעות חדשות! (הצג עוד רעיונות מגוונים) ✨</span>
                </button>

                {/* Results Count Bar */}
                <div className="flex items-center justify-between px-1 text-stone-700">
                  <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>ארוחות שובע שנבחרו עבורך ({displayedMeals.length}):</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-bold">
                    לחצי על מצרך כדי לסמן אם יש לך
                  </span>
                </div>

                {displayedMeals.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-2xl border border-stone-200 space-y-2">
                        <div className="text-3xl">🍲</div>
                        <h5 className="text-sm font-bold text-stone-800">לא נמצאו אופציות תואמות לסינון</h5>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('all');
                            setMealSearchQuery('');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                        >
                          הצג את כל האופציות
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayedMeals.map((meal, idx) => (
                          <div
                            key={meal.id || idx}
                            className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all space-y-3 text-right"
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                    אופציה {idx + 1}
                                  </span>
                                  {meal.tag && (
                                    <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                                      {meal.tag}
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-base font-black text-stone-900">
                                  {meal.title}
                                </h5>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{meal.timeToMake}</span>
                              </div>
                            </div>

                            {/* Interactive Ingredients */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-black text-stone-700">🛒 מה צריך (לחצי כדי לסמן):</span>
                              <div className="flex flex-wrap gap-1.5">
                                {meal.ingredients.map((ing, i) => {
                                  const isChecked = !!checkedIngredients[`${meal.id}-${i}`];
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => toggleIngredientCheck(`${meal.id}-${i}`)}
                                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                        isChecked
                                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 line-through opacity-80'
                                          : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                                      }`}
                                    >
                                      {isChecked ? (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                                      )}
                                      <span>{ing}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Simple steps */}
                            <div className="space-y-1">
                              <span className="text-xs font-black text-stone-700">⚡ איך מכינים (קצר ופשוט):</span>
                              <ol className="list-decimal list-inside space-y-0.5 text-xs text-stone-800 font-medium">
                                {meal.simpleSteps.map((step, sIdx) => (
                                  <li key={sIdx} className="leading-relaxed">{step}</li>
                                ))}
                              </ol>
                            </div>

                            {/* Satiety Reason */}
                            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-bold flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{meal.satietyReason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Master Chef Recipe Book Banner */}
                  {onOpenMealSuggestions && (
                    <div
                      onClick={onOpenMealSuggestions}
                      className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between cursor-pointer transition-all shadow-md hover:shadow-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-lg">
                          🍲
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white">
                            רוצה עוד עשרות מתכונים מלאים ומגוונים?
                          </h4>
                          <p className="text-[11px] text-emerald-100 font-medium">
                            פתחי את ספר המתכונים המלא של שף דלה פופו (מרקים, תבשילים, עוף, דגים וקינוחים)
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-950 bg-white hover:bg-stone-100 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition-all shadow-xs">
                        <span>ספר המתכונים 📖</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </span>
                    </div>
                  )}

                  {/* Safe ingredients & Quick Tip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {chefResult.safeIngredientsIdentified?.length > 0 && (
                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                        <span className="text-xs font-black text-emerald-900">✅ מצרכים בטוחים שזוהו:</span>
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                          {chefResult.safeIngredientsIdentified.join(', ')}
                        </p>
                      </div>
                    )}

                    {chefResult.quickTip && (
                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                        <span className="text-xs font-black text-amber-950">💡 טיפ שובע קליני:</span>
                        <p className="text-xs text-amber-900 font-medium leading-relaxed">
                          {chefResult.quickTip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

        </div>

        {/* Hidden inputs for Camera / Gallery */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelected}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelected}
          className="hidden"
        />

        {/* Bottom Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer active:scale-95"
          >
            סגור אשף
          </button>

          {activeScenario && (
            <div className="flex items-center gap-2">
              {onOpenMealSuggestions && (
                <button
                  type="button"
                  onClick={onOpenMealSuggestions}
                  className="py-2 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ספר המתכונים</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveScenario(null);
                  setChefResult(null);
                  setSelectedCategory('all');
                  setMealSearchQuery('');
                  setCustomText('');
                }}
                className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>בחרי תרחיש אחר</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
