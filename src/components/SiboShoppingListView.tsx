import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  CheckSquare,
  Square,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Info,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { SiboPhase } from '../types';

interface ShoppingItem {
  id: string;
  category: 'meat' | 'veg' | 'dairy_oil' | 'grains' | 'sauces_spices' | 'fruits_snacks' | 'custom';
  name: string;
  brandOrNote?: string;
  isEssential?: boolean;
}

const DEFAULT_SHOPPING_ITEMS: ShoppingItem[] = [
  // --- 🥩 בשרים, עופות ודגים טריים ---
  { id: 'm1', category: 'meat', name: 'קוביות פרגית נקייה', brandOrNote: 'לשיפודים ושווארמה ביתית', isEssential: true },
  { id: 'm2', category: 'meat', name: 'בשר בקר טחון טרי', brandOrNote: 'צוואר/צלעות לקציצות ובולונז', isEssential: true },
  { id: 'm3', category: 'meat', name: 'סטייק אנטרקוט דק (דקה סטייק)', brandOrNote: 'נתח שלם טרי', isEssential: true },
  { id: 'm4', category: 'meat', name: 'פילה סלמון טרי', brandOrNote: 'ללא עצמות', isEssential: true },
  { id: 'm5', category: 'meat', name: 'פילה דניס / לברק טרי', brandOrNote: 'עם העור', isEssential: true },
  { id: 'm6', category: 'meat', name: 'סלמון מעושן פרוס', brandOrNote: '100 גרם ללא תוספת סוכר', isEssential: true },
  { id: 'm7', category: 'meat', name: 'פסטרמה 100% נתח שלם', brandOrNote: 'טירת צבי 100% טבעי / יחיעם ללא גלוטן/שום/בצל', isEssential: true },
  { id: 'm8', category: 'meat', name: 'חזה עוף שלם / חתוך לרצועות', brandOrNote: 'טרי ונקי', isEssential: false },
  { id: 'm9', category: 'meat', name: 'כנפי עוף טריות', brandOrNote: 'חצויות ונקיות', isEssential: false },
  { id: 'm10', category: 'meat', name: 'שימורי טונה בשמן זית', brandOrNote: 'ריו מרה / פילטונה בשמן זית כתית', isEssential: true },
  { id: 'm11', category: 'meat', name: 'שימורי סרדינים בשמן זית כתית מעולה', brandOrNote: 'סרדינים איכותיים', isEssential: false },

  // --- 🥦 ירקות בטוחים (0% תסיסה) ---
  { id: 'v1', category: 'veg', name: 'קישואים / זוקיני ירוקים מוצקים', brandOrNote: '2-3 ק"ג (לזודלס, קציצות ומרק)', isEssential: true },
  { id: 'v2', category: 'veg', name: 'מלפפונים טריים פריכים', brandOrNote: '2 ק"ג (בטוח ללא הגבלה)', isEssential: true },
  { id: 'v3', category: 'veg', name: 'גזרים טריים מוצקים', brandOrNote: '1 ק"ג', isEssential: true },
  { id: 'v4', category: 'veg', name: 'חסה ערבית פריכה / לבבות חסה', brandOrNote: 'רענן ונקי', isEssential: true },
  { id: 'v5', category: 'veg', name: 'עלי תרד טריים (בייבי תרד)', brandOrNote: 'שקית/מארז שטוף לחביתות ושקשוקה', isEssential: true },
  { id: 'v6', category: 'veg', name: 'בצל ירוק טרי', brandOrNote: 'דגש: נשתמש בחלק הירוק העליון בלבד!', isEssential: true },
  { id: 'v7', category: 'veg', name: 'צרור שמיר טרי', brandOrNote: 'ירוק ורענן', isEssential: true },
  { id: 'v8', category: 'veg', name: 'צרור פטרוזיליה וכוסברה', brandOrNote: 'טרי', isEssential: true },
  { id: 'v9', category: 'veg', name: 'ענפי רוזמרין וטימין טריים', brandOrNote: 'לסטייק ודגים', isEssential: false },
  { id: 'v10', category: 'veg', name: 'שורש ג׳ינג׳ר טרי', brandOrNote: 'שורש קטן ומוצק', isEssential: true },
  { id: 'v11', category: 'veg', name: 'לימונים טריים עסיסיים', brandOrNote: '1 ק"ג לסחיטה ותיבול', isEssential: true },
  { id: 'v12', category: 'veg', name: 'תפוחי אדמה בינוניים', brandOrNote: 'לקומפיר אפוי חם וטורטייה', isEssential: true },

  // --- 🥚 ביצים, גבינות קשות (0% לקטוז) ושמנים ---
  { id: 'd1', category: 'dairy_oil', name: 'תבנית ביצים טריות L/XL', brandOrNote: 'ביצי חופש / משק', isEssential: true },
  { id: 'd2', category: 'dairy_oil', name: 'גבינת פרמזן רג׳יאנו מיושנת (גוש שלם)', brandOrNote: 'Parmigiano Reggiano מיושנת 24 חודש (0% לקטוז)', isEssential: true },
  { id: 'd3', category: 'dairy_oil', name: 'גבינת גאודה קשה / מנצ׳גו', brandOrNote: 'גבינה קשה שעברה יישון (0% לקטוז)', isEssential: true },
  { id: 'd4', category: 'dairy_oil', name: 'גבינת פטה עיזים קשה', brandOrNote: 'במים ומלח (ללא תוספות)', isEssential: false },
  { id: 'd5', category: 'dairy_oil', name: 'שמן זית כתית מעולה כבישה קרה', brandOrNote: 'חומציות עד 0.8% (יד מרדכי / מסיק קיבוץ מגל)', isEssential: true },
  { id: 'd6', category: 'dairy_oil', name: 'שמן זית מושרה שום (Garlic Oil)', brandOrNote: 'Garlic Infused Oil (מעניק ארומת שום ללא פרוקטנים!)', isEssential: true },
  { id: 'd7', category: 'dairy_oil', name: 'שמן שומשום טהור 100%', brandOrNote: 'למוקפצים וסלטים אסייתיים', isEssential: true },
  { id: 'd8', category: 'dairy_oil', name: 'שמן קוקוס מכבישה קרה', brandOrNote: 'אורגני 100%', isEssential: false },

  // --- 🍞 תחליפי פחמימות ודגנים (ללא גלוטן) ---
  { id: 'g1', category: 'grains', name: 'פריכיות אורז דקות 100% אורז', brandOrNote: 'מלא/לבן ללא תוספות מלח ושום (B&D / מאסטר שף)', isEssential: true },
  { id: 'g2', category: 'grains', name: 'דפי אורז עגולים שקופים', brandOrNote: 'מזרח ומערב / Real Thai (רכיבים: אורז, מים, מלח בלבד)', isEssential: true },
  { id: 'g3', category: 'grains', name: 'קמח שקדים טהור מולבן', brandOrNote: 'לפנקייקים ולציפוי שניצל (שקדיה / הרדוף)', isEssential: true },
  { id: 'g4', category: 'grains', name: 'אורז בסמטי קלאסי הודי', brandOrNote: 'Tilda / סוגת בסמטי איכותי', isEssential: true },
  { id: 'g5', category: 'grains', name: 'קינואה לבנה שטופה', brandOrNote: 'סוגת / הרדוף', isEssential: false },
  { id: 'g6', category: 'grains', name: 'פצפוצי אורז תפוח 100% טבעי', brandOrNote: 'ללא תוספת סוכר (B&D / תבואות)', isEssential: false },

  // --- 🥫 רטבים, תבלינים וממרחים עם מותגים מדויקים ---
  { id: 's1', category: 'sauces_spices', name: 'רוטב סויה תמרי ללא גלוטן', brandOrNote: 'מותג: San-J Tamari Gluten-Free או קיקומן ללא גלוטן (פקק כחול)', isEssential: true },
  { id: 's2', category: 'sauces_spices', name: 'טחינה גולמית 100% שומשום טהור', brandOrNote: 'מותג: אל ארז / היונה / הר ברכה (ללא שום וללא מלח מוסף)', isEssential: true },
  { id: 's3', category: 'sauces_spices', name: 'חרדל דיז׳ון חלק ללא סוכר', brandOrNote: 'מותג: Maille Dijon Originale (לוודא: ללא שום וללא סוכר)', isEssential: true },
  { id: 's4', category: 'sauces_spices', name: 'חמאת בוטנים 100% טבעית', brandOrNote: 'מותג: B&D 100% טבעי / ראסטיס / סקיפי ללא סוכר (ללא שמן דקלים)', isEssential: true },
  { id: 's5', category: 'sauces_spices', name: 'שוקולד מריר 85% איכותי', brandOrNote: 'מותג: Lindt Excellence 85% Cocoa (שחור וזהב)', isEssential: true },
  { id: 's6', category: 'sauces_spices', name: 'זרעי צ׳יה טבעיים', brandOrNote: 'הרדוף / תבואות / שקדיה', isEssential: true },
  { id: 's7', category: 'sauces_spices', name: 'סירופ מייפל 100% טהור', brandOrNote: 'מותג: Maple Joe דרגת Grade A טהור', isEssential: true },
  { id: 's8', category: 'sauces_spices', name: 'חומץ תפוחים טבעי לא מסונן', brandOrNote: 'מותג: Bragg Organic Apple Cider Vinegar', isEssential: false },
  { id: 's9', category: 'sauces_spices', name: 'חלב שקדים טהור ללא סוכר', brandOrNote: 'מותג: אלפרו ללא סוכר (פקק תכלת) / Isola Bio שקדים טהור', isEssential: true },
  { id: 's10', category: 'sauces_spices', name: 'חלב קוקוס טבעי בקרטון/פחית', brandOrNote: 'מותג: Aroy-D 100% (ללא חומרים משמרים וללא סוכר)', isEssential: false },
  { id: 's11', category: 'sauces_spices', name: 'אבקת קקאו הולנדי טהור 100%', brandOrNote: 'מותג: עלית קקאו טהור לאפייה / הרדוף אורגני', isEssential: false },
  { id: 's12', category: 'sauces_spices', name: 'כמון טחון טהור', brandOrNote: 'תבליני טעם וריח / פרג 100% טהור ללא תערובות', isEssential: true },
  { id: 's13', category: 'sauces_spices', name: 'כורכום טהור 100%', brandOrNote: 'תבלין טהור ללא תוספות', isEssential: true },
  { id: 's14', category: 'sauces_spices', name: 'פפריקה מתוקה ופפריקה מעושנת טהורה', brandOrNote: '100% פפריקה טהורה', isEssential: true },
  { id: 's15', category: 'sauces_spices', name: 'מלח ים אטלנטי גס ופלפל שחור גרוס', brandOrNote: 'מלח אטלנטי טבעי', isEssential: true },
  { id: 's16', category: 'sauces_spices', name: 'סומאק טהור ואורגנו יבש', brandOrNote: 'ללא תוספת מלח ושום', isEssential: false },

  // --- 🍓 פירות ונשנושים בטוחים ---
  { id: 'f1', category: 'fruits_snacks', name: 'תותים טריים שטופים', brandOrNote: '1-2 סלסלות (דל פודמאפ מאושר)', isEssential: true },
  { id: 'f2', category: 'fruits_snacks', name: 'אוכמניות טריות', brandOrNote: 'סלסלה קטנה', isEssential: false },
  { id: 'f3', category: 'fruits_snacks', name: 'אגוזי מלך טבעיים לא קלויים', brandOrNote: 'שקית/מארז ואקום טרי', isEssential: true },
  { id: 'f4', category: 'fruits_snacks', name: 'אגוזי פקאן טבעיים לא קלויים', brandOrNote: 'חצאי פקאן טבעי', isEssential: false },
  { id: 'f5', category: 'fruits_snacks', name: 'בוטנים קלויים מלוחים', brandOrNote: 'שקית בוטנים (ללא סוכר וקמח)', isEssential: false },
  { id: 'f6', category: 'fruits_snacks', name: 'מלפפונים חמוצים במלח בלבד', brandOrNote: 'מותג: בית השיטה במלח (דגש: ללא חומץ, ללא שום וללא סוכר)', isEssential: true },
  { id: 'f7', category: 'fruits_snacks', name: 'זיתים שחורים / ירוקים במלח', brandOrNote: 'ללא תבליני שום ובצל', isEssential: false },
];

const CATEGORY_NAMES: Record<string, { label: string; icon: string }> = {
  meat: { label: 'בשרים, עופות ודגים טריים', icon: '🥩' },
  veg: { label: 'ירקות ועשבי תיבול בטוחים', icon: '🥦' },
  dairy_oil: { label: 'ביצים, גבינות קשות (0% לקטוז) ושמנים', icon: '🥚' },
  grains: { label: 'תחליפי פחמימות ודגנים (ללא גלוטן)', icon: '🍞' },
  sauces_spices: { label: 'רטבים, תבלינים וממרחים (מותגים ספציפיים)', icon: '🥫' },
  fruits_snacks: { label: 'פירות, אגוזים ונשנושים', icon: '🍓' },
  custom: { label: 'פריטים מותאמים אישית שהוספת', icon: '✨' },
};

interface SiboShoppingListViewProps {
  currentPhase: SiboPhase;
  onBackToScanner?: () => void;
}

export const SiboShoppingListView: React.FC<SiboShoppingListViewProps> = ({
  currentPhase,
  onBackToScanner,
}) => {
  // Saved checked items in localStorage
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sibo_shopping_checked_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default initial checked essentials for Nir
    const initial: Record<string, boolean> = {};
    DEFAULT_SHOPPING_ITEMS.filter((i) => i.isEssential).forEach((i) => {
      initial[i.id] = true;
    });
    return initial;
  });

  // Custom added items
  const [customItems, setCustomItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('sibo_shopping_custom_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomNote, setNewCustomNote] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Preferred phone number for 1-tap direct WhatsApp sending (saved in storage)
  const [directPhone, setDirectPhone] = useState<string>(() => {
    try {
      return localStorage.getItem('sibo_shopper_phone') || '';
    } catch {
      return '';
    }
  });
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sibo_shopping_checked_v1', JSON.stringify(checkedIds));
    } catch {}
  }, [checkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('sibo_shopping_custom_v1', JSON.stringify(customItems));
    } catch {}
  }, [customItems]);

  const allItems = useMemo(() => {
    return [...DEFAULT_SHOPPING_ITEMS, ...customItems];
  }, [customItems]);

  const selectedCount = useMemo(() => {
    return Object.values(checkedIds).filter(Boolean).length;
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const all: Record<string, boolean> = {};
    allItems.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedIds(all);
  };

  const handleSelectEssentialsOnly = () => {
    const essentials: Record<string, boolean> = {};
    allItems.forEach((item) => {
      if (item.isEssential) essentials[item.id] = true;
    });
    setCheckedIds(essentials);
  };

  const handleClearAll = () => {
    setCheckedIds({});
  };

  const handleAddCustomItem = () => {
    if (!newCustomName.trim()) return;
    const newItem: ShoppingItem = {
      id: `custom-${Date.now()}`,
      category: 'custom',
      name: newCustomName.trim(),
      brandOrNote: newCustomNote.trim() || undefined,
      isEssential: false,
    };
    setCustomItems((prev) => [...prev, newItem]);
    setCheckedIds((prev) => ({ ...prev, [newItem.id]: true }));
    setNewCustomName('');
    setNewCustomNote('');
    setIsAddingCustom(false);
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
    setCheckedIds((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Generate WhatsApp Message formatted cleanly by supermarket aisles
  const generateWhatsAppMessage = () => {
    const selectedItems = allItems.filter((i) => checkedIds[i.id]);

    if (selectedItems.length === 0) {
      return 'היי! רשימת הקניות ל-SIBO ריקה כרגע. אנא סמני פריטים באפליקציה.';
    }

    let msg = `🛒 *רשימת קניות מותאמת ובטוחה ל-SIBO עבור ניר* 🌿\n`;
    msg += `------------------------------------\n`;
    msg += `⚠️ *דגש קריטי לקונה:* ללא שום, ללא בצל, ללא גלוטן! נא להקפיד על המותגים וההערות המפורטות.\n\n`;

    const categories = ['meat', 'veg', 'dairy_oil', 'grains', 'sauces_spices', 'fruits_snacks', 'custom'];

    categories.forEach((catKey) => {
      const itemsInCat = selectedItems.filter((i) => i.category === catKey);
      if (itemsInCat.length > 0) {
        const catInfo = CATEGORY_NAMES[catKey] || { label: 'שונות', icon: '📦' };
        msg += `${catInfo.icon} *${catInfo.label}:*\n`;
        itemsInCat.forEach((item) => {
          msg += `  ▫️ *${item.name}*`;
          if (item.brandOrNote) {
            msg += ` (${item.brandOrNote})`;
          }
          msg += `\n`;
        });
        msg += `\n`;
      }
    });

    msg += `------------------------------------\n`;
    msg += `תודה רבה רבה על העזרה וההקפדה! ❤️`;
    return msg;
  };

  const handleSendWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const encoded = encodeURIComponent(text);

    let url = `https://api.whatsapp.com/send?text=${encoded}`;
    if (directPhone && directPhone.trim()) {
      const cleanPhone = directPhone.replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.startsWith('0') ? `972${cleanPhone.slice(1)}` : cleanPhone;
      url = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encoded}`;
    }

    window.open(url, '_blank');
  };

  const handleCopyList = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-5 animate-fadeIn pb-24" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden text-right">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-amber-400 text-stone-950 rounded-full">
              רשימת קניות לשליחה
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              רשימת קניות לסופר (לשלוח למישהו) 📋
            </h2>
            <p className="text-xs text-emerald-100 font-medium max-w-md">
              סמני מה חסר במקרר ובמזווה, ולחצי על כפתור הוואטסאפ לשליחה מיידית לקונה!
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🛒
          </div>
        </div>
      </div>

      {/* Floating Bottom WhatsApp Action Bar */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-500 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              {selectedCount}
            </span>
            <div>
              <span className="text-xs sm:text-sm font-black text-stone-900 block">
                פריטים מסומנים לקנייה
              </span>
              <span className="text-[11px] text-stone-500">
                המקרר תמיד יהיה מלא לכל הארוחות
              </span>
            </div>
          </div>

          {/* Quick Copy & Selection Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyList}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="העתק טקסט ללוח"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSuccess ? 'הועתק!' : 'העתק'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוסף מוצר</span>
            </button>
          </div>
        </div>

        {/* Giant WhatsApp Send Button */}
        <button
          type="button"
          onClick={handleSendWhatsApp}
          disabled={selectedCount === 0}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-98"
        >
          <Send className="w-5 h-5 rtl:rotate-180" />
          <span>שלחי בוואטסאפ למי שקונה 📱 ({selectedCount} מוצרים)</span>
        </button>

        {/* Action Filter Pills */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectEssentialsOnly}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              ⭐ סמני מוצרי בסיס חיוניים
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-stone-600 hover:underline cursor-pointer"
            >
              בחר הכל
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-bold text-stone-600 hover:underline cursor-pointer"
            >
              נקה הכל
            </button>
          </div>

          {/* Optional Direct Contact Phone */}
          <div className="text-[11px] text-stone-500">
            {isEditingPhone ? (
              <div className="flex items-center gap-1">
                <input
                  type="tel"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  placeholder="מספר טלפון לקונה..."
                  className="px-2 py-0.5 border border-stone-300 rounded text-xs w-28 text-left"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('sibo_shopper_phone', directPhone);
                    setIsEditingPhone(false);
                  }}
                  className="font-bold text-emerald-700"
                >
                  שמור
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                className="text-stone-500 hover:text-stone-800 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span>{directPhone ? `נשלח ל: ${directPhone}` : 'הגדר מספר קבוע לקונה'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal / Inline form for Custom Item */}
      {isAddingCustom && (
        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-3 text-right">
          <h4 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>הוספת מוצר מותאם אישית לרשימה:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={newCustomName}
              onChange={(e) => setNewCustomName(e.target.value)}
              placeholder="שם המוצר (למשל: תפוחי עץ ירוקים)..."
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newCustomNote}
              onChange={(e) => setNewCustomNote(e.target.value)}
              placeholder="מותג / הערה לקונה (למשל: רק גרני סמית)..."
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs"
            >
              הוסף לרשימה
            </button>
          </div>
        </div>
      )}

      {/* Categorized Checklist */}
      <div className="space-y-6">
        {['meat', 'veg', 'dairy_oil', 'grains', 'sauces_spices', 'fruits_snacks', 'custom'].map((catKey) => {
          const itemsInCat = allItems.filter((i) => i.category === catKey);
          if (itemsInCat.length === 0) return null;

          const catInfo = CATEGORY_NAMES[catKey] || { label: 'שונות', icon: '📦' };
          const checkedInCat = itemsInCat.filter((i) => checkedIds[i.id]).length;

          return (
            <div
              key={catKey}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3 text-right"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{catInfo.icon}</span>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">
                    {catInfo.label}
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {checkedInCat} / {itemsInCat.length}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itemsInCat.map((item) => {
                  const isChecked = !!checkedIds[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                          : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200/80 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="pt-0.5 text-emerald-700">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span
                            className={`text-xs sm:text-sm font-extrabold block ${
                              isChecked ? 'text-stone-950' : 'text-stone-700'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.brandOrNote && (
                            <span
                              className={`text-[11px] block font-medium ${
                                isChecked ? 'text-emerald-900 font-semibold' : 'text-stone-500'
                              }`}
                            >
                              🏷️ {item.brandOrNote}
                            </span>
                          )}
                        </div>
                      </div>

                      {item.category === 'custom' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomItem(item.id);
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
