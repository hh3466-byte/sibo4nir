import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  CheckSquare,
  Square,
  Copy,
  Check,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Info,
  Search,
  X,
  AlertTriangle,
  Smartphone,
  ChevronLeft,
  Filter,
} from 'lucide-react';
import { SiboPhase } from '../types';
import {
  SIBO_SHOPPING_500_ITEMS,
  SIBO_CATEGORIES,
  SiboShopping500Item,
} from '../data/siboShopping500';

interface CustomShoppingItem {
  id: string;
  category: 'custom';
  name: string;
  safeBrand?: string;
  warningNote?: string;
  unit?: string;
}

interface SiboShoppingListViewProps {
  currentPhase: SiboPhase;
  onBackToScanner?: () => void;
}

export const SiboShoppingListView: React.FC<SiboShoppingListViewProps> = ({
  currentPhase,
  onBackToScanner,
}) => {
  // Empty by default as requested: "שכל הצ'ק בוקס יהיו ריקים, מסמנים רק את מה שחסר"
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sibo_shopping_checked_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Quantities per item (default 1)
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sibo_shopping_quantities_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Custom user-added items
  const [customItems, setCustomItems] = useState<CustomShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('sibo_shopping_custom_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyCheckedFilter, setOnlyCheckedFilter] = useState(false);

  // Form for custom item
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomBrand, setNewCustomBrand] = useState('');
  const [newCustomWarning, setNewCustomWarning] = useState('');

  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Saved contact phone for direct WhatsApp sending
  const [directPhone, setDirectPhone] = useState<string>(() => {
    try {
      return localStorage.getItem('sibo_shopper_phone') || '';
    } catch {
      return '';
    }
  });
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sibo_shopping_checked_v2', JSON.stringify(checkedIds));
    } catch {}
  }, [checkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('sibo_shopping_quantities_v2', JSON.stringify(quantities));
    } catch {}
  }, [quantities]);

  useEffect(() => {
    try {
      localStorage.setItem('sibo_shopping_custom_v2', JSON.stringify(customItems));
    } catch {}
  }, [customItems]);

  // Combine static 500 items + custom
  const allItems = useMemo(() => {
    return [...(SIBO_SHOPPING_500_ITEMS as (SiboShopping500Item | CustomShoppingItem)[]), ...customItems];
  }, [customItems]);

  const selectedCount = useMemo(() => {
    return Object.values(checkedIds).filter(Boolean).length;
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) {
        delete next[id];
      }
      return next;
    });
  };

  const updateQuantity = (id: string, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleClearAll = () => {
    setCheckedIds({});
    setQuantities({});
  };

  const handleAddCustomItem = () => {
    if (!newCustomName.trim()) return;
    const newItem: CustomShoppingItem = {
      id: `custom_${Date.now()}`,
      category: 'custom',
      name: newCustomName.trim(),
      safeBrand: newCustomBrand.trim() || undefined,
      warningNote: newCustomWarning.trim() || undefined,
      unit: 'יח׳',
    };
    setCustomItems((prev) => [newItem, ...prev]);
    setCheckedIds((prev) => ({ ...prev, [newItem.id]: true }));
    setQuantities((prev) => ({ ...prev, [newItem.id]: 1 }));
    setNewCustomName('');
    setNewCustomBrand('');
    setNewCustomWarning('');
    setIsAddingCustom(false);
  };

  const handleRemoveCustomItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
    setCheckedIds((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'custom' && item.category !== 'custom') return false;
        if (selectedCategory !== 'custom' && item.category !== selectedCategory) return false;
      }

      // Only checked filter
      if (onlyCheckedFilter && !checkedIds[item.id]) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.safeBrand?.toLowerCase().includes(q);
        const matchWarn = item.warningNote?.toLowerCase().includes(q);
        return matchName || matchBrand || matchWarn;
      }

      return true;
    });
  }, [allItems, selectedCategory, onlyCheckedFilter, searchQuery, checkedIds]);

  // Generate clean WhatsApp message
  const generateWhatsAppMessage = () => {
    const selected = allItems.filter((i) => checkedIds[i.id]);

    if (selected.length === 0) {
      return 'היי! רשימת הקניות ל-SIBO ריקה כרגע. אנא סמני את הפריטים שחסרים לך באפליקציה.';
    }

    let msg = `🛒 *רשימת קניות מותאמת ובטוחה ל-SIBO עבור ניר* 🌿\n`;
    msg += `------------------------------------\n`;
    msg += `⚠️ *דגש קריטי לקונה:* ללא שום, ללא בצל, ללא גלוטן! נא לקנות אך ורק את המותגים וההנחיות הרשומות.\n\n`;

    const categoryOrder = [
      ...SIBO_CATEGORIES.map((c) => c.id),
      'custom',
    ];

    categoryOrder.forEach((catKey) => {
      const inCat = selected.filter((i) => i.category === catKey);
      if (inCat.length > 0) {
        const catInfo = SIBO_CATEGORIES.find((c) => c.id === catKey) || { label: 'פריטים נוספים', icon: '✨' };
        msg += `${catInfo.icon} *${catInfo.label}:*\n`;
        inCat.forEach((item) => {
          const qty = quantities[item.id] || 1;
          const qtyStr = qty > 1 ? `${qty}x ` : '';
          msg += `  ▫️ *${qtyStr}${item.name}*`;
          if (item.safeBrand) {
            msg += `\n     🏷️ מותג: ${item.safeBrand}`;
          }
          if (item.warningNote) {
            msg += `\n     ${item.warningNote}`;
          }
          msg += `\n`;
        });
        msg += `\n`;
      }
    });

    msg += `------------------------------------\n`;
    msg += `סה"כ ${selected.length} מוצרים מסומנים. תודה רבה על העזרה וההקפדה! ❤️`;
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
    <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-4 animate-fadeIn pb-28 text-stone-900" dir="rtl">
      {/* Calm & Soothing Header Card */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl shadow-md relative overflow-hidden text-right border border-stone-800">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-800 text-emerald-100 text-[11px] font-black tracking-wide">
              <span>מאגר 500+ מוצרים ומותגים מדויקים ל-SIBO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>רשימת קניות לסופר (לשלוח למישהו) 📋</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-xl">
              <strong className="text-amber-300">ניר, סמני רק את מה שחסר לך במקרר או במזווה.</strong> ליד כל מוצר מופיע המותג המאושר ודגשי זהירות לקונה.
            </p>
          </div>

          {onBackToScanner && (
            <button
              type="button"
              onClick={onBackToScanner}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-2xl text-xs font-bold shrink-0 transition-colors border border-stone-700 flex items-center gap-1"
            >
              <span>קניות בעצמי</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Bottom/Top WhatsApp Action Bar */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-stone-300 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${
              selectedCount > 0 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              {selectedCount}
            </span>
            <div>
              <span className="text-xs sm:text-sm font-black text-stone-900 block">
                {selectedCount > 0 ? `${selectedCount} מוצרים נבחרו לקנייה` : 'כל המוצרים ריקים כרגע'}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {selectedCount > 0 ? 'מוכן לשליחה מהירה בוואטסאפ' : 'סמני את הפריטים שחסרים לך'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyList}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
              title="העתק טקסט"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSuccess ? 'הועתק!' : 'העתק'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>הוסף מוצר</span>
            </button>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                title="נקה את כל הסימונים"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>נקה</span>
              </button>
            )}
          </div>
        </div>

        {/* Big Unified Green WhatsApp Button */}
        <button
          type="button"
          onClick={handleSendWhatsApp}
          disabled={selectedCount === 0}
          className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-30 disabled:hover:bg-emerald-700 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
        >
          <Send className="w-5 h-5 rtl:rotate-180" />
          <span>שלחי בוואטסאפ למי שקונה 📱 ({selectedCount} מוצרים)</span>
        </button>

        {/* Set Shopper Phone Helper */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyCheckedFilter(!onlyCheckedFilter)}
              className={`font-bold px-2 py-0.5 rounded-lg border transition-all ${
                onlyCheckedFilter
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {onlyCheckedFilter ? '✓ מציג רק מסומנים' : 'הצג רק מה שסומן'}
            </button>
          </div>

          <div>
            {isEditingPhone ? (
              <div className="flex items-center gap-1">
                <input
                  type="tel"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  placeholder="מספר לקונה (05X...)"
                  className="px-2 py-0.5 border border-stone-300 rounded text-xs w-28 text-left"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('sibo_shopper_phone', directPhone);
                    setIsEditingPhone(false);
                  }}
                  className="font-black text-emerald-700 px-1"
                >
                  שמור
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                className="text-stone-500 hover:text-stone-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span>{directPhone ? `נשלח ישירות ל: ${directPhone}` : 'הגדרת מספר קבוע לקונה'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Form to Add Custom Item */}
      {isAddingCustom && (
        <div className="p-4 bg-stone-50 rounded-3xl border border-stone-300 space-y-3 text-right animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>הוספת מוצר מותאם אישית לרשימה:</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              value={newCustomName}
              onChange={(e) => setNewCustomName(e.target.value)}
              placeholder="שם המוצר (למשל: תפוחי עץ ירוקים)..."
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-emerald-600"
            />
            <input
              type="text"
              value={newCustomBrand}
              onChange={(e) => setNewCustomBrand(e.target.value)}
              placeholder="מותג מומלץ (למשל: גרני סמית)..."
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-emerald-600"
            />
            <input
              type="text"
              value={newCustomWarning}
              onChange={(e) => setNewCustomWarning(e.target.value)}
              placeholder="הערת זהירות (למשל: לא אדום)..."
              className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3.5 py-1.5 bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs"
            >
              הוסף וסמן לרשימה
            </button>
          </div>
        </div>
      )}

      {/* Search Bar Across 500+ Items */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חפשי כל מוצר, ירק, מותג או תבלין מתוך 500 מוצרים..."
          className="w-full py-3 pr-10 pl-9 rounded-2xl bg-white border border-stone-300 text-xs sm:text-sm font-semibold placeholder:text-stone-400 focus:outline-none focus:border-emerald-600 shadow-2xs text-right"
        />
        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300 flex items-center justify-center text-xs absolute left-3 top-1/2 -translate-y-1/2"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Chips - 2 Organized Rows for Easy Navigation */}
      <div className="bg-stone-50 p-2.5 sm:p-3 rounded-2xl border border-stone-200 space-y-2">
        {/* Row 1: All + Produce + Sauces + Spices + Sweets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`py-2 px-3 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span>📋</span>
            <span>הכל (500+)</span>
          </button>
          {SIBO_CATEGORIES.filter((c) => (c as any).row === 1 || ['veggies_fruits', 'sauces', 'spices', 'sweets'].includes(c.id)).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-3 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Meat/Fish + Dairy/Oils + Grains + Drinks + Pantry + Custom */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {SIBO_CATEGORIES.filter((c) => (c as any).row === 2 || ['meat_fish', 'dairy_oils', 'grains_starches', 'drinks', 'pantry_baking'].includes(c.id)).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-3 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
          {customItems.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory('custom')}
              className={`py-2 px-3 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                selectedCategory === 'custom'
                  ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                  : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span>✨</span>
              <span>מוצרים שלי ({customItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Items List Grouped by Category */}
      <div className="space-y-5">
        {SIBO_CATEGORIES.map((cat) => {
          const inCat = filteredItems.filter((i) => i.category === cat.id);
          if (inCat.length === 0) return null;

          const checkedInCat = inCat.filter((i) => checkedIds[i.id]).length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3 text-right"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">
                    {cat.label}
                  </h3>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                  {checkedInCat} מתוך {inCat.length}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inCat.map((item) => {
                  const isChecked = !!checkedIds[item.id];
                  const qty = quantities[item.id] || 1;

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isChecked
                          ? 'bg-emerald-50/90 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                          : 'bg-stone-50/40 hover:bg-stone-50 border-stone-200/80 text-stone-700'
                      }`}
                    >
                      {/* Top row: Checkbox, Name, and Quantity Counter */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className="pt-0.5 shrink-0">
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-700" />
                            ) : (
                              <Square className="w-5 h-5 text-stone-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`text-xs sm:text-sm font-extrabold block leading-tight ${
                                isChecked ? 'text-stone-950 font-black' : 'text-stone-800'
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Counter [+ 1 -] */}
                        <div
                          className="flex items-center gap-1 bg-white border border-stone-300 rounded-xl p-0.5 shrink-0 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => updateQuantity(item.id, -1, e)}
                            className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                            title="הפחת כמות"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              updateQuantity(item.id, 1, e);
                              if (!isChecked) toggleItem(item.id);
                            }}
                            className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                            title="הגדל כמות"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Brand Note & Warnings */}
                      {(item.safeBrand || item.warningNote) && (
                        <div className="space-y-1 text-right text-[11px] pt-1 border-t border-stone-100/80">
                          {item.safeBrand && (
                            <div className="text-stone-600 font-medium">
                              <span className="font-bold text-emerald-800">🏷️ מותג מומלץ:</span> {item.safeBrand}
                            </div>
                          )}
                          {item.warningNote && (
                            <div className="text-amber-900 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200 text-[10.5px] leading-tight font-semibold">
                              {item.warningNote}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Custom Items Section if any */}
        {customItems.length > 0 && (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <span>✨</span>
                <span>מוצרים נוספים שהוספת אישית ({customItems.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {customItems.map((item) => {
                const isChecked = !!checkedIds[item.id];
                const qty = quantities[item.id] || 1;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="pt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-700" />
                          ) : (
                            <Square className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-black text-stone-900 block">
                            {item.name}
                          </span>
                          {item.safeBrand && (
                            <span className="text-[11px] text-stone-500 block">
                              🏷️ {item.safeBrand}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center gap-1 bg-white border border-stone-300 rounded-xl p-0.5 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => updateQuantity(item.id, -1, e)}
                            className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => updateQuantity(item.id, 1, e)}
                            className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleRemoveCustomItem(item.id, e)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
