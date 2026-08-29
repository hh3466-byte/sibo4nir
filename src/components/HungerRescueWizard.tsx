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

interface HungerRescueWizardProps {
  currentPhase: SiboPhase;
  isOpen: boolean;
  onClose: () => void;
  onSelectFoodToAnalyze?: (foodName: string) => void;
  onOpenMealSuggestions?: () => void;
}

type ScenarioType = 'home' | 'driving' | 'restaurant' | 'supermarket' | 'gps' | 'camera' | 'custom' | null;

export type MealCategory = 'all' | 'meat' | 'fish' | 'bowls' | 'wraps' | 'sweet' | 'cheese' | 'eggs' | 'instant';

export interface SuggestedRescueMeal {
  id: string;
  title: string;
  category: 'meat' | 'fish' | 'bowls' | 'wraps' | 'sweet' | 'cheese' | 'eggs' | 'instant';
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

// 🏠 Massive Master Catalog of 35+ Creative SIBO-Safe Rescue Meals for Home / Kitchen
const HOME_RESCUE_MEALS: SuggestedRescueMeal[] = [
  // --- 🍗 עופות, בשרים, שיפודים ושווארמה (Meat & Poultry) ---
  {
    id: 'm-1',
    title: '🍗 שיפודי פרגית צרובים במחבת פסים ברוטב שמן שום וכמון',
    category: 'meat',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['180 גרם קוביות פרגית נקייה', 'כף שמן זית מושרה שום (Garlic Oil)', 'חצי כפית כמון', 'פפריקה מתוקה', 'מלח אטלנטי', 'מיץ לימון סחוט'],
    simpleSteps: ['מתבלים את קוביות הפרגית בשמן שום, כמון, פפריקה ומלח', 'מחממים מחבת פסים לחום גבוה', 'צורבים 2 דקות מכל צד עד להשחמה עסיסית וסוחטים מעט לימון'],
    satietyReason: 'חלבון עשיר ושומן בריא שמעניקים שובע מסיבי ל-4-5 שעות ללא שום תסיסה חיידקית.',
    tag: 'עסיסי • חלבון מלא',
  },
  {
    id: 'm-2',
    title: '🥩 קציצות בקר עסיסיות במחבת עם קישוא מגורר (ללא לחם וללא בצל)',
    category: 'meat',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['180 גרם בשר בקר טחון טרי', 'חצי קישוא קטן מגורר דק וסחוט מנוזלים (מעניק עסיסיות במקום לחם!)', 'כף שמיר/פטרוזיליה קצוצה', 'כפית שמן שום', 'מלח ופלפל שחור'],
    simpleSteps: ['מערבבים בקערה את הבקר עם הקישוא המגורר, עשבי התיבול והתבלינים', 'יוצרים 4 קציצות שטוחות', 'צורבים במחבת חמה עם כף שמן זית 2 דקות מכל צד'],
    satietyReason: 'ברזל, חלבון איכותי ונפח ירקות דל FODMAP שהופכים את הקציצות לרכות ומשביעות במיוחד.',
    tag: 'בקר עסיסי • 0% גלוטן',
  },
  {
    id: 'm-3',
    title: '🍗 שווארמה ביתית מהירה מנתחי פרגית וטחינה גולמית',
    category: 'meat',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['150 גרם רצועות דקות של פרגית / חזה הודו', 'כף שמן זית', 'כמון, כורכום, קורט קינמון ומלח', '2 כפות טחינה גולמית 100%', 'מלפפון חמוץ במלח בלבד'],
    simpleSteps: ['מקפיצים את רצועות הפרגית במחבת לוהטת עם השמן והתבלינים 3 דקות', 'מעבירים לצלחת, יוצקים מעל טחינה גולמית ואוכלים לצד מלפפון חמוץ במלח'],
    satietyReason: 'טעם שווארמה אמיתי ללא בצל וללא תבליני שום מסחריים, עם שומן טחינה שמייצב את הסוכר.',
    tag: 'טעם שווארמה • מפנק',
  },
  {
    id: 'm-4',
    title: '🥩 מוקפץ בקר אסייתי וזודלס (נודלס קישואים) בשמן שומשום וג׳ינג׳ר',
    category: 'meat',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['120 גרם רצועות סינטה/שייטל דקות', '1 קישוא חתוך לרצועות נודלס (במקלף/קולפן)', 'כפית שמן שומשום טהור', 'כפית ג׳ינג׳ר טרי מגורר', 'כף רוטב תמרי ללא גלוטן', 'חופן בוטנים קצוצים'],
    simpleSteps: ['צורבים את הבקר במחבת לוהטת דקה וחצי ומוציאים', 'באותה מחבת מקפיצים את רצועות הקישוא עם ג׳ינג׳ר ותמרי דקה', 'מחזירים את הבקר, מערבבים ומפזרים בוטנים קלויים'],
    satietyReason: 'ארוחה אסייתית מלאה עם נפח של נודלס קישואים דל פחמימה וחלבון עשיר.',
    tag: 'אסייתי • ללא גלוטן',
  },
  {
    id: 'm-5',
    title: '🥩 סטייק אנטרקוט דק (דקה וחצי מכל צד) עם רוזמרין ומלח גס',
    category: 'meat',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['150-200 גרם נתח אנטרקוט פרוס דק (דקה סטייק)', 'כף שמן זית', 'ענף רוזמרין טרי', 'מלח ים אטלנטי גס ופלפל שחור גרוס'],
    simpleSteps: ['מחממים מחבת כבדה עד שהיא מעלה עשן קל', 'מניחים את הסטייק עם הרוזמרין וצורבים דקה וחצי מכל צד', 'מניחים לנוח דקה על קרש חיתוך ופורסים לרצועות'],
    satietyReason: 'חלבון ושומן בקר מרוכזים הנספגים בקלות במעי הדק ומעניקים תחושת שובע עמוקה.',
    tag: 'פרימיום • שובע ממושך',
  },
  {
    id: 'm-6',
    title: '🍗 שניצלונים פריכים בציפוי קראנץ׳ פריכיות / קמח שקדים',
    category: 'meat',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['150 גרם רצועות חזה עוף', '1 ביצה טרופה', '2 פריכיות אורז מרוסקות דק לפירורים (או 2 כפות קמח שקדים)', 'פפריקה, מלח ושמן זית לטיגון'],
    simpleSteps: ['טובלים את רצועות העוף בביצה ולאחר מכן בפירורי הפריכיות המתובלים', 'מטגנים במחבת עם שמן זית כ-2 דקות מכל צד עד להזהבה פריכה', 'מגישים חם וקראנצ\'י לצד טחינה'],
    satietyReason: 'תחושת שניצל פריך אמיתי ב-100% התאמה ל-SIBO ללא אף גרם גלוטן.',
    tag: 'קראנצ\'י • שניצל SIBO',
  },
  {
    id: 'm-7',
    title: '🍗 רול פסטרמה נתח שלם מגולגל סביב מקלות מלפפון וטחינה',
    category: 'meat',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['4 פרוסות פסטרמה איכותית נתח שלם (ללא גלוטן/שום/בצל)', '1 מלפפון חתוך למקלות דקים', '2 כפות טחינה גולמית', 'קורט מלח גס'],
    simpleSteps: ['מורחים מעט טחינה על כל פרוסת פסטרמה', 'מניחים מקל מלפפון במרכז ומגלגלים לרול', 'אוכלים מיד באצבעות'],
    satietyReason: 'חלבון רזה ושומן צמחי בריא ללא צורך בהדלקת אש או שימוש בסירים.',
    tag: '1 דקה • ללא בישול',
  },
  {
    id: 'm-8',
    title: '🍗 כנפי עוף פריכות במחבת בשמן שום, פפריקה מעושנת ולימון',
    category: 'meat',
    timeToMake: '6 דקות',
    prepMinutes: 6,
    ingredients: ['6 כנפי עוף נקיות חצויות', 'כף שמן זית מושרה שום', 'כפית פפריקה מעושנת', 'מלח ים ומיץ מחצי לימון'],
    simpleSteps: ['מערבבים את הכנפיים עם השמן והתבלינים', 'מטגנים במחבת מכוסה על אש בינונית-גבוהה 3 דקות מכל צד עד לפריכות שחומה', 'סוחטים לימון וזוללים חם'],
    satietyReason: 'שומן וחלבון עוף טבעיים המעניקים תחושת ארוחת נחמה פריכה ומפנקת.',
    tag: 'פריך ומפנק • חם',
  },

  // --- 🐟 דגים, סלמון ופירות ים (Fish & Seafood) ---
  {
    id: 'f-1',
    title: '🐟 פילה דניס / לברק צרוב על הפלנצ׳ה בעשבי תיבול ושמן זית',
    category: 'fish',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['פילה דניס/לברק טרי עם העור', 'כף שמן זית כתית מעולה', 'ענף שמיר וטימין', 'מלח אטלנטי ופלח לימון'],
    simpleSteps: ['מחממים מחבת עם שמן זית', 'מניחים את הדג על צד העור ולוחצים 2 דקות עד שהעור פריך ומוזהב', 'הופכים ל-30 שניות נוספות ומגישים עם לימון'],
    satietyReason: 'דג ים לבן וקל לעיכול, עשיר בחלבון טהור שאינו מכביד על הקיבה.',
    tag: 'דג ים פרימיום • קל לעיכול',
  },
  {
    id: 'f-2',
    title: '🐟 קציצות דגים מהירות במחבת עם כוסברה, קישוא ושמן שום',
    category: 'fish',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['180 גרם פילה דג לבן טחון/קצוץ דק (מוסר/בקלה/דניס)', 'חצי קישוא קטן מגורר וסחוט', '2 כפות כוסברה ופטרוזיליה קצוצות', 'כפית שמן שום', 'מלח וכמון'],
    simpleSteps: ['מערבבים את הדג עם הקישוא, עשבי התיבול והתבלינים', 'יוצרים 4 קציצות קטנות', 'צורבים במחבת עם שמן זית כ-2 דקות מכל צד'],
    satietyReason: 'קציצות נימוחות ועדינות למערכת העיכול עם 0% סוכרים או סיבים מציקים.',
    tag: 'נימוח • דל FODMAP',
  },
  {
    id: 'f-3',
    title: '🐟 פילה סלמון אפוי ברוטב חרדל דיז׳ון, מייפל טהור ושמן זית',
    category: 'fish',
    timeToMake: '5 דקות',
    prepMinutes: 5,
    ingredients: ['פילה סלמון טרי (150 גרם)', 'כפית חרדל דיז׳ון חלק (ללא סוכר)', 'כפית סירופ מייפל טהור 100%', 'כף שמן זית ומלח גס'],
    simpleSteps: ['מורחים את החרדל, המייפל, השמן והמלח על הסלמון', 'מכניסים לטוסטר אובן / איירפרייר ב-200 מעלות ל-5 דקות', 'מגישים עסיסי ונימוח'],
    satietyReason: 'אומגה 3 אנטי-דלקתית ושומן איכותי שמזינים את רירית המעי ומשביעים לאורך זמן.',
    tag: 'אומגה 3 • גורמה',
  },
  {
    id: 'f-4',
    title: '🐟 טרטר סלמון טרי מהיר עם שמן שומשום, מלפפון וג׳ינג׳ר על פריכיות',
    category: 'fish',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    isQuickNoCook: true,
    ingredients: ['80 גרם פילה סלמון טרי חתוך לקוביות קטנות', 'חצי מלפפון קצוץ דק', 'כפית שמן שומשום', 'מעט ג׳ינג׳ר מגורר', 'מלח ים ופריכיות אורז'],
    simpleSteps: ['מערבבים בקערית את קוביות הסלמון, המלפפון, שמן השומשום והג׳ינג׳ר', 'מניחים כפות גדושות על פריכיות פריכות ואוכלים מיד'],
    satietyReason: 'מנת סושי גורמה ביתית ללא סוכרים מוספים וללא חומץ אורז מתועש.',
    tag: 'סושי ביתי • נא וטרי',
  },
  {
    id: 'f-5',
    title: '🐟 סרדינים איכותיים בשמן זית עם פריכיות אורז ולימון סחוט',
    category: 'fish',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['קופסת שימורי סרדינים איכותיים בשמן זית כתית', '2-3 פריכיות אורז 100%', 'חצי לימון סחוט', 'מלח ים גס'],
    simpleSteps: ['פותחים את הקופסה, מניחים סרדינים שלמים על פריכיות האורז', 'סוחטים שפע מיץ לימון טרי ומפזרים מלח גס'],
    satietyReason: 'פצצת סידן, אומגה 3 ומינרלים שמרגיעים את תחושת הרעב תוך 60 שניות.',
    tag: 'פצצת סידן • 1 דקה',
  },

  // --- 🥣 קערות שובע חמות, זודלס ותפוחי אדמה (Warm Bowls & Comfort) ---
  {
    id: 'b-1',
    title: '🥔 "קומפיר SIBO" — תפוח אדמה לוהט במילוי שמן זית, מלח גס ופרמזן',
    category: 'bowls',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['1 תפוח אדמה בינוני שטוף ומנוקב במזלג', '2 כפות שמן זית כתית מעולה', '30 גרם פרמזן מיושנת מגוררת (0% לקטוז)', 'מלח אטלנטי גס ופלפל'],
    simpleSteps: ['מבשלים את תפוח האדמה במיקרוגל 4 דקות עד שהוא רך לחלוטין', 'חוצים במרכז ומועכים קלות במזלג', 'יוצקים שפע שמן זית, מפזרים מלח גס והרבה פרמזן שנמסה לתוכו'],
    satietyReason: 'פחמימה קלה ובטוחה ללא גלוטן יחד עם שומן איכותי וגבינה מיושנת ללא לקטוז.',
    tag: 'חם ומנחם • קומפיר',
  },
  {
    id: 'b-2',
    title: '🥣 קערת אורז בסמטי חם עם קוביות עוף, טחינה ועלי בצל ירוק',
    category: 'bowls',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['1 כוס אורז בסמטי מבושל חם (מהמקרר או מהיר)', '100 גרם קוביות חזה עוף צרוב', '2 כפות טחינה גולמית', '2 כפות עלי בצל ירוק (ירוק בלבד)', 'מלח ולימון'],
    simpleSteps: ['מחממים את האורז והעוף בקערה', 'יוצקים מעל טחינה גולמית, מיץ לימון ומלח', 'מפזרים עלי בצל ירוק פריכים ומערבבים'],
    satietyReason: 'ארוחת קערה מלאה, מאוזנת וקלה ביותר לעיכול שמייצבת את הבטן.',
    tag: 'קערת שובע • אורז בסמטי',
  },
  {
    id: 'b-3',
    title: '🥣 "זודלס" (נודלס קישואים) ברוטב עגבניות, שמן שום, פרמזן ובזיליקום',
    category: 'bowls',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['2 קישואים חתוכים לסרטי פסטה במקלף', '3 כפות עגבניות מרוסקות (ללא תוספות)', 'כף שמן זית מושרה שום', 'עלי בזיליקום טריים', 'פרמזן מגוררת ומלח'],
    simpleSteps: ['מקפיצים את סרטי הקישוא במחבת עם שמן שום דקה וחצי בלבד', 'מוסיפים את העגבניות המרוסקות, מלח ובזיליקום ומבשלים דקה', 'מפזרים פרמזן בנדיבות ואוכלים חם'],
    satietyReason: 'תחושת פסטה איטלקית עשירה ללא גלוטן וללא תסיסת פחמימות.',
    tag: 'פסטה SIBO • דל פחמימה',
  },
  {
    id: 'b-4',
    title: '🥣 מרק כתום זהוב מקישואים וגזר עם חלב קוקוס וג׳ינג׳ר טרי',
    category: 'bowls',
    timeToMake: '5 דקות',
    prepMinutes: 5,
    ingredients: ['1 גזר פרוס', '1 קישוא חתוך', '3 כפות קרם/חלב קוקוס טהור', 'חצי כפית ג׳ינג׳ר מגורר', 'כפית שמן שום ומלח'],
    simpleSteps: ['מבשלים את הגזר והקישוא בכוס מים רותחים 4 דקות עד לריכוך', 'טוחנים בבלנדר מוט עם חלב הקוקוס, שמן השום, הג׳ינג׳ר והמלח למרק קטיפתי', 'שותים חם ומנחם'],
    satietyReason: 'מרק סמיך ומלטף שמחמם את מערכת העיכול ומספק ויטמינים עדינים.',
    tag: 'מרק חם • קטיפתי',
  },
  {
    id: 'b-5',
    title: '🥒 צ׳יפס קישואים פריך במחבת עם שמן זית, מלח ים וטימין',
    category: 'bowls',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['2 קישואים פרוסים לעיגולים דקים', '2 כפות שמן זית כתית מעולה', 'עלי טימין טריים ומלח ים אטלנטי גס'],
    simpleSteps: ['מחממים שמן זית במחבת רחבה', 'מניחים את פרוסות הקישוא בשכבה אחידה ומטגנים 2 דקות מכל צד עד להזהבה פריכה', 'מוציאים לנייר סופג, ממליחים במלח גס ואוכלים כחטיף'],
    satietyReason: 'חטיף קראנצ\'י מלוח ובריא שמספק מענה לצורך בנשנוש מלוח.',
    tag: 'קראנצ\'י • חטיף ירקות',
  },

  // --- 🥞 דפי אורז, פנקייקים, מאפים וקרפים (Wraps & Grain Alternatives) ---
  {
    id: 'w-1',
    title: '🌯 לאפה מדפי אורז מגולגלת עם נתחי עוף צלוי, טחינה וחסה פריכה',
    category: 'wraps',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['2 דפי אורז עגולים', '100 גרם נתחי עוף צלוי / פסטרמה', 'עלי חסה פריכים', '2 כפות טחינה גולמית', 'מלח ומיץ לימון'],
    simpleSteps: ['טובלים דף אורז בקערת מים פושרים 15 שניות ומניחים על משטח עבודה', 'מסדרים במרכז עוף, חסה וטחינה', 'מקפלים את הצדדים ומגלגלים ללאפה הדוקה'],
    satietyReason: 'מרקם לאפה מענג ורך ללא טיפת קמח חיטה, קל לעיכול ומשביע מאוד.',
    tag: 'לאפה SIBO • ללא גלוטן',
  },
  {
    id: 'w-2',
    title: '🍕 "פיצה ויאטנמית" מהירה מדף אורז פריך עם ביצה וגבינה קשה',
    category: 'wraps',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['1 דף אורז יבש', '1 ביצה טרופה', 'כף עלי בצל ירוק (ירוק בלבד)', '20 גרם פרמזן / גאודה מגוררת', 'כפית שמן שום'],
    simpleSteps: ['מניחים דף אורז יבש ישירות במחבת חמה על אש בינונית', 'יוצקים מעליו את הביצה הטרופה עם הבצל הירוק ומורחים בעדינות', 'מפזרים גבינה, כשהדף פריך מקפלים לחצי כמו טאקו ואוכלים קראנצ\'י'],
    satietyReason: 'חטיף קראנצ\'י גבינתי חם וממכר שמוכן תוך 180 שניות.',
    tag: 'פיצה קראנצ\'ית • להיט',
  },
  {
    id: 'w-3',
    title: '🥞 פנקייק שקדים ואוורירי ב-3 דקות (0% קמח, 0% סוכר)',
    category: 'wraps',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['1 ביצה טרייה', '2 כפות גדושות קמח שקדים טהור', 'כפית סירופ מייפל 100%', 'קורט קינמון', 'כפית שמן זית / שמן קוקוס לטיגון', 'תותים טריים בצד'],
    simpleSteps: ['טורפים היטב בקערית את הביצה עם קמח השקדים, המייפל והקינמון', 'יוצקים למחבת משומנת חמה ומטגנים דקה וחצי מכל צד עד להזהבה תפוחה', 'מגישים עם פרוסות תותים טריים'],
    satietyReason: 'פנקייק עשיר בחלבון ושומן בריא ללא שום קמחים מעובדים שמרגיע רעב למתוק.',
    tag: 'פנקייק שקדים • פינוק',
  },
  {
    id: 'w-4',
    title: '🧀 "טוסט" גאודה ופרמזן על פריכית כפולה בטוסטר עם שמן זית ואורגנו',
    category: 'wraps',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    ingredients: ['2 פריכיות אורז 100%', 'פרוסת גבינת גאודה מיושנת / פרמזן (0% לקטוז)', 'כפית שמן זית', 'קורט אורגנו ומלח'],
    simpleSteps: ['מניחים את הגבינה בין 2 הפריכיות, מזלפים שמן זית ואורגנו', 'מכניסים לטוסטר לחיצה / טוסטר אובן לדקה וחצי עד שהגבינה מבעבעת ונמסה', 'אוכלים קראנצ\'י וחם'],
    satietyReason: 'תחושת טוסט גבינה קראנצ\'י חם ומנחם ללא לקטוז וללא גלוטן.',
    tag: 'טוסט קראנצ\'י • גבינה נמסה',
  },

  // --- 🍫 מתוקים בטוחים, פודינג צ׳יה, שייקים ושוקולד (Sweet Satiety) ---
  {
    id: 'sw-1',
    title: '🍫 "סניקרס SIBO" מהיר — פריכית עם חמאת בוטנים, שוקולד מריר 85% ומלח גס',
    category: 'sweet',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['1-2 פריכיות אורז 100%', 'כף גדושה חמאת בוטנים 100% טבעית', '1-2 קוביות שוקולד מריר 85% מומסות (או מגוררות)', 'גרגרי מלח ים אטלנטי גס'],
    simpleSteps: ['מורחים את חמאת הבוטנים על הפריכית', 'מזלפים מעל שוקולד מריר מומס ומפזרים כמה גרגרי מלח גס', 'אוכלים מיד או מקפיאים 2 דקות לקראנץ\' מושלם'],
    satietyReason: 'שילוב מנצח של שומן צמחי, מליחות ומתיקות שסוגר לחלוטין כל חשק למתוק בלי להתסיס.',
    tag: 'סניקרס SIBO • ממכר',
  },
  {
    id: 'sw-2',
    title: '🥣 פודינג צ׳יה קרמי עם חלב שקדים, תותים ומייפל טהור',
    category: 'sweet',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    isQuickNoCook: true,
    ingredients: ['2 כפות זרעי צ׳יה', 'חצי כוס חלב שקדים טהור ללא סוכר', 'כפית סירופ מייפל טהור 100%', '4 תותים טריים חתוכים'],
    simpleSteps: ['מערבבים בכוס את זרעי הצ׳יה עם חלב השקדים והמייפל למשך דקה', 'מניחים לעמוד 2 דקות עד להסמכה קרמית', 'מפזרים תותים טריים מעל ואוכלים בכפית'],
    satietyReason: 'סיבים עדינים מסיסים ואומגה 3 צמחית שממלאים את הקיבה ברוגע ומשביעים לשעות.',
    tag: 'פודינג צ\'יה • אומגה 3',
  },
  {
    id: 'sw-3',
    title: '🍫 כדורי אנרגיה משקדים טחונים, חמאת בוטנים וקקאו טהור',
    category: 'sweet',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    isQuickNoCook: true,
    ingredients: ['3 כפות קמח שקדים טהור', 'כף גדושה חמאת בוטנים 100%', 'כפית קקאו טהור 100%', 'כפית מייפל טהור'],
    simpleSteps: ['מערבבים את כל המצרכים בקערית לבצק אחיד', 'מגלגלים ל-3 כדורים קטנים', 'זוללים מיד כחטיף אנרגיה עשיר'],
    satietyReason: 'חטיף אנרגיה מרוכז בשומנים בריאים ללא תמרים (עתירים בפרוקטוז!) שמתאים ב-100% ל-SIBO.',
    tag: 'כדורי אנרגיה • ללא תמרים',
  },
  {
    id: 'sw-4',
    title: '🍓 תותים טריים טבולים בשוקולד מריר 85% מומס ושברי אגוזי מלך',
    category: 'sweet',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    isQuickNoCook: true,
    ingredients: ['5 תותים טריים יפים', '2 קוביות שוקולד מריר 85% מומסות במיקרוגל', '3 חצאי אגוזי מלך קצוצים'],
    simpleSteps: ['טובלים חצי מכל תות בשוקולד המריר החם', 'מפזרים שברי אגוזי מלך קראנצ\'יים', 'אוכלים קינוח מלכותי ובטוח'],
    satietyReason: 'נוגדי חמצון, ויטמין C ושומן איכותי המספקים הנאה מתוקה ללא עליית סוכר.',
    tag: 'קינוח גורמה • דל FODMAP',
  },
  {
    id: 'sw-5',
    title: '🥣 "דגני בוקר SIBO" — קערת חלב שקדים, פריכיות מנופצות וקינמון',
    category: 'sweet',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['2-3 פריכיות אורז מנופצות ביד לפיסות קטנות', '1 כוס חלב שקדים צונן ללא סוכר', 'כף חמאת בוטנים או חמאת שקדים', 'שפע קינמון טחון'],
    simpleSteps: ['מניחים את פיסות הפריכיות בקערה', 'יוצקים חלב שקדים קר, מזלפים חמאת בוטנים ומפזרים קינמון', 'אוכלים בכף כמו קורנפלקס קראנצ\'י'],
    satietyReason: 'מדמה קערת קורנפלקס נוסטלגית בצורה בטוחה לחלוטין ללא סוכר שולחני וללא גלוטן.',
    tag: 'קורנפלקס SIBO • 1 דקה',
  },
  {
    id: 'sw-6',
    title: '☕ שוקו שקדים חם מ-100% קקאו טהור עם מייפל וקינמון',
    category: 'sweet',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['1 כוס חלב שקדים טהור ללא סוכר', 'כפית קקאו טהור 100%', 'כפית סירופ מייפל טהור', 'קורט קינמון'],
    simpleSteps: ['מחממים חלב שקדים בפינג\'אן או ספל', 'טורפים פנימה קקאו, מייפל וקינמון', 'שותים חם ומנחם'],
    satietyReason: 'משקה מנחם ומחמם שמספק נוגדי חמצון ומרגיע את הבטן.',
    tag: 'חם ומנחם • ללא לקטוז',
  },

  // --- 🧀 פלטות שובע יוקרתיות וגבינות 0% לקטוז (Cheese & Savory Platters) ---
  {
    id: 'ch-1',
    title: '🧀 פלטת גבינות קשות מיושנות (פרמזן, גאודה) עם אגוזי מלך וזיתים',
    category: 'cheese',
    timeToMake: '1 דקה',
    prepMinutes: 1,
    isQuickNoCook: true,
    ingredients: ['40 גרם קוביות פרמזן מיושנת או גאודה קשה (0% לקטוז)', '5 חצאי אגוזי מלך', '6 זיתים שחורים טבעיים (ללא שום)', '2 פריכיות אורז'],
    simpleSteps: ['מסדרים את הגבינות, האגוזים והזיתים על צלחת יפה', 'אוכלים לאט בנחת'],
    satietyReason: 'שומנים וחלבונים עשירים ללא טיפת לקטוז שמעניקים שובע ארוך טווח.',
    tag: 'פלטת גבינות • 0% לקטוז',
  },
  {
    id: 'ch-2',
    title: '🥑 אבוקדו בשל במילוי נתחי עוף צלוי ושמן שום מושרה',
    category: 'cheese',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    isQuickNoCook: true,
    ingredients: ['חצי אבוקדו בשל', '80 גרם נתחי עוף צלוי קר או חם', 'כפית שמן זית מושרה שום', 'מלח אטלנטי ולימון'],
    simpleSteps: ['חוצים אבוקדו ומסירים את הגלעין', 'ממלאים את השקע בנתחי עוף, מזלפים שמן שום וממליחים'],
    satietyReason: 'שילוב מושלם של שומן צמחי בריא וחלבון עוף טהור שמשתיק את הרעב מיד.',
    tag: 'אבוקדו ממולא • שומן בריא',
  },
  {
    id: 'ch-3',
    title: '🥒 סלט מלפפונים צונן בשמן זית כתית, לימון ושבבי פרמזן ענקיים',
    category: 'cheese',
    timeToMake: '2 דקות',
    prepMinutes: 2,
    isQuickNoCook: true,
    ingredients: ['2 מלפפונים חתוכים לפרוסות אלכסוניות עבות', '2 כפות שמן זית כתית מעולה', 'מיץ מחצי לימון סחוט', '30 גרם שבבי פרמזן מיושנת בקולפן', 'מלח ים'],
    simpleSteps: ['מערבבים את המלפפונים עם שמן הזית, הלימון והמלח', 'מפזרים מעל שבבי פרמזן ענקיים ואוכלים פריך'],
    satietyReason: 'מרענן, קראנצ\'י ומלא מינרלים מרגיעים עם שומן גבינה מלוח וממכר.',
    tag: 'רענן ופריך • 0% לקטוז',
  },

  // --- 🍳 מנות ביצים מיוחדות ויצירתיות (Creative Egg Dishes) ---
  {
    id: 'eg-1',
    title: '🍳 חביתת זוקיני מגורר וגבינה קשה (גהי / שמן שום)',
    category: 'eggs',
    timeToMake: '4 דקות',
    prepMinutes: 4,
    ingredients: ['2 ביצים', 'חצי קישוא קטן מגורר בפומפייה', 'כף שמן זית מושרה שום', '20 גרם פרמזן/גבינה צהובה', 'מלח'],
    simpleSteps: ['מקפיצים את הקישוא המגורר דקה במחבת עם שמן שום', 'יוצקים מעל את הביצים הטרופות והגבינה', 'מכסים ל-2 דקות ומגישים'],
    satietyReason: 'מעניק נפח עשיר, סיבים עדינים וטעם מפנק בלי אף גרם גזים.',
    tag: 'עשיר בירקות • משביע',
  },
  {
    id: 'eg-2',
    title: '🍳 שקשוקה ביתית בטוחה ל-SIBO מעגבניות טריות, עלי בצל ירוק ושמן שום',
    category: 'eggs',
    timeToMake: '5 דקות',
    prepMinutes: 5,
    ingredients: ['2 עגבניות טריות מרוסקות', 'כף שמן זית מושרה שום', '2 כפות עלי בצל ירוק (ירוק בלבד)', 'פפריקה מתוקה, כמון ומלח', '2 ביצים טריות'],
    simpleSteps: ['מבשלים את העגבניות המרוסקות עם שמן השום והתבלינים 2 דקות', 'יוצרים גומות ושוברים פנימה 2 ביצים', 'מכסים ל-3 דקות ומגישים חם לצד פריכיות'],
    satietyReason: 'שקשוקה חמה ומנחמת ב-100% התאמה ל-SIBO ללא שום וללא בצל.',
    tag: 'שקשוקה חמה • מפנק',
  },
  {
    id: 'eg-3',
    title: '🍳 ביצי עין פריכות בשמן זית לוהט על מצע פריכיות שסופגות את החלמון',
    category: 'eggs',
    timeToMake: '3 דקות',
    prepMinutes: 3,
    ingredients: ['2 ביצים טריות', '1.5 כפות שמן זית', '2 פריכיות אורז', 'מלח ים אטלנטי גס', 'פלפל שחור', 'מלפפון פריך בצד'],
    simpleSteps: ['מחממים שמן זית היטב במחבת', 'שוברים 2 ביצים לעין פריכה עם תחתית מוזהבת', 'מעבירים מעל הפריכיות כדי שיספגו את החלמון החם'],
    satietyReason: 'ארוחת נחמה חמה וממכרת שנותנת תחושת שובע ורוגע תוך 180 שניות.',
    tag: 'חם ומפנק • קל',
  },
];

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

export const HungerRescueWizard: React.FC<HungerRescueWizardProps> = ({
  currentPhase,
  isOpen,
  onClose,
  onSelectFoodToAnalyze,
  onOpenMealSuggestions,
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
    { label: '🍗 שיפודי פרגית / שווארמה', text: 'בא לי שיפודי פרגית או שווארמה ביתית' },
    { label: '🥩 קציצות בקר / סטייק', text: 'יש לי בשר בקר, קישוא ועשבי תיבול' },
    { label: '🐟 דניס / לברק / סלמון', text: 'בא לי פילה דג ים צרוב או סלמון' },
    { label: '🥔 תפו"א אפוי / קומפיר', text: 'בא לי תפוח אדמה אפוי חם ומנחם עם שמן זית וגבינה' },
    { label: '🌯 לאפה מדפי אורז', text: 'יש לי דפי אורז ואני רוצה לאפה מגולגלת' },
    { label: '🥞 פנקייק שקדים ב-3 דקות', text: 'בא לי פנקייק שקדים מתוק וטעים' },
    { label: '🍫 סניקרס SIBO / שוקולד', text: 'בא לי חטיף סניקרס או שוקולד מריר' },
    { label: '🥣 פודינג צ׳יה / שייק', text: 'בא לי פודינג צ׳יה קרמי או שייק' },
    { label: '🧀 פלטת גבינות ואגוזים', text: 'בא לי גבינות קשות מיושנות, אגוזים וזיתים' },
  ];

  // Reset and load full 35+ scrollable buffet when opening
  useEffect(() => {
    if (isOpen) {
      setActiveScenario('home');
      setChefResult({
        scenarioTitle: 'בופה שובע עשיר ומגוון (35+ אופציות ברשימה מתגלגלת) 🏠',
        calmMessage: 'ניר, הנה כל 35+ ארוחות הבזק המגוונות ברשימה מתגלגלת: בשרים, שיפודים, דגי ים, זודלס, דפי אורז, פנקייקים וקינוחי צ׳יה.',
        prepTimeMinutes: 3,
        suggestedMeals: HOME_RESCUE_MEALS,
        safeIngredientsIdentified: ['פרגית', 'בקר', 'דניס', 'לברק', 'תפו"א', 'קישוא', 'דפי אורז', 'קמח שקדים', 'שוקולד 85%', 'צ׳יה', 'פרמזן'],
        cautionWarnings: [],
        quickTip: 'גללי חופשי ברשימה המתגלגלת, סנני לפי קטגוריות או דברי במיקרופון!',
      });
      setStagedPhoto(null);
      setCustomText('');
      setGpsError(null);
      setSelectedCategory('all');
      setMealSearchQuery('');
      setCheckedIngredients({});
      setIsListening(false);
      setSpeechError(null);
    }
  }, [isOpen]);

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
        scenarioTitle: 'בופה שובע עשיר בבית (35+ אופציות מגוונות) 🏠',
        calmMessage: 'ניר, את בבית ליד המטבח! הנה שפע אדיר של ארוחות בזק מגוונות: בשרים, שיפודים, דגי ים, זודלס, דפי אורז, פנקייקים וקינוחי צ׳יה.',
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
      list = list.filter((m) => m.category === selectedCategory);
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

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const raw = chefResult?.suggestedMeals || [];
    return {
      all: raw.length,
      meat: raw.filter((m) => m.category === 'meat').length,
      fish: raw.filter((m) => m.category === 'fish').length,
      bowls: raw.filter((m) => m.category === 'bowls').length,
      wraps: raw.filter((m) => m.category === 'wraps').length,
      sweet: raw.filter((m) => m.category === 'sweet').length,
      cheese: raw.filter((m) => m.category === 'cheese').length,
      eggs: raw.filter((m) => m.category === 'eggs').length,
      instant: raw.filter((m) => m.category === 'instant' || m.isQuickNoCook).length,
    };
  }, [chefResult?.suggestedMeals]);

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

            {/* Quick Inspiration Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 text-xs">
              <span className="text-[11px] font-bold text-stone-400 shrink-0">השראה מהירה:</span>
              {quickPillPrompts.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleExecuteUniversalQuery(pill.text)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 font-bold transition-all shrink-0 cursor-pointer text-[11px] border border-stone-200/80 shadow-2xs active:scale-95"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Quick Location & Mode Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-emerald-200/50">
              <button
                type="button"
                onClick={() => handleSelectScenario('home')}
                className={`px-3 py-1.5 rounded-xl font-black transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  activeScenario === 'home'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>🏠 בבית / במטבח</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">35+</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('driving')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  activeScenario === 'driving'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>🚗 בנסיעה / Yellow</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">8+</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('supermarket')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  activeScenario === 'supermarket'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-indigo-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>🛒 סופר / מכולת</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">8+</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('restaurant')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  activeScenario === 'restaurant'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white hover:bg-teal-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>🏢 מסעדה / וולט</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">6+</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveScenario('camera');
                  cameraInputRef.current?.click();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  activeScenario === 'camera'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>📸 צלמי מקרר</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('gps')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                  activeScenario === 'gps'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>📍 איתור GPS</span>
              </button>
            </div>
          </div>

          {/* Unified Scrollable Results Display */}
          <div className="space-y-4 animate-fadeIn">
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
                <div className="space-y-4 animate-fadeIn">
                  {/* Soothing message banner */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 border border-emerald-300 shadow-xs flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 text-base font-black shadow-xs">
                      💚
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                        {chefResult.scenarioTitle}
                      </h4>
                      <p className="text-xs text-emerald-900 font-bold leading-relaxed">
                        {chefResult.calmMessage}
                      </p>
                    </div>
                  </div>

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

                  {/* Search and Rich Multi-Category Filter Toolbar */}
                  <div className="space-y-2 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
                    {/* Live In-Modal Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={mealSearchQuery}
                        onChange={(e) => setMealSearchQuery(e.target.value)}
                        placeholder="חפשי כל מצרך (פרגית, בקר, דניס, תפו&quot;א, לאפה, פנקייק, סניקרס, צ׳יה, גבינה)..."
                        className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all"
                      />
                      <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      {mealSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMealSearchQuery('')}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold bg-stone-200 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Rich Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-xl font-black transition-all shrink-0 cursor-pointer text-xs ${
                          selectedCategory === 'all'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        🌟 הכל ({categoryCounts.all})
                      </button>

                      {categoryCounts.meat > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('meat')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                            selectedCategory === 'meat'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          🍗 בשר, פרגית ושיפודים ({categoryCounts.meat})
                        </button>
                      )}

                      {categoryCounts.fish > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('fish')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                            selectedCategory === 'fish'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          🐟 דגי ים וסלמון ({categoryCounts.fish})
                        </button>
                      )}

                      {categoryCounts.bowls > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('bowls')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                            selectedCategory === 'bowls'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          🥔 קומפיר, זודלס ומרק ({categoryCounts.bowls})
                        </button>
                      )}

                      {categoryCounts.wraps > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('wraps')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                            selectedCategory === 'wraps'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          🌯 דפי אורז, פנקייק ומאפים ({categoryCounts.wraps})
                        </button>
                      )}

                      {categoryCounts.sweet > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('sweet')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                            selectedCategory === 'sweet'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          🍫 סניקרס, צ׳יה ושוקולד ({categoryCounts.sweet})
                        </button>
                      )}

                      {categoryCounts.cheese > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('cheese')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                            selectedCategory === 'cheese'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          🧀 פלטות גבינה 0% לקטוז ({categoryCounts.cheese})
                        </button>
                      )}

                      {categoryCounts.eggs > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('eggs')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                            selectedCategory === 'eggs'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          🍳 ביצים מיוחדות ({categoryCounts.eggs})
                        </button>
                      )}
                    </div>
                  </div>

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

                  {/* Meal Cards List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-stone-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>ארוחות שובע שנבחרו עבורך ({displayedMeals.length}):</span>
                      </h4>
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
                  </div>

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
