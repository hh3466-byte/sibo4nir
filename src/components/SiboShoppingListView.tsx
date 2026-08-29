import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { SiboPhase } from '../types';
import {
  SIBO_SHOPPING_500_ITEMS,
  SIBO_CATEGORIES,
  SiboShopping500Item,
} from '../data/siboShopping500';
import { CategoryCarousel, CategoryCarouselItem } from './CategoryCarousel';

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
  // Empty by default: "שכל הצ'ק בוקס יהיו ריקים, מסמנים רק את מה שחסר"
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isEditingWeeklyBasket, setIsEditingWeeklyBasket] = useState(false);
  const [basketToast, setBasketToast] = useState<string | null>(null);

  // ⚡ Customizable Weekly Base Basket (Editable by Nir!)
  const DEFAULT_WEEKLY_BASKET = [
    'd-1', // חלב שקדים ללא סוכר
    'o-1', // שמן זית כתית מעולה
    'e-1', // ביצים טריות
    'm-1', // חזה עוף טרי
    'v-1', // מלפפונים
    'b-1', // פריכיות אורז
    's-1', // תפוצ'יפס טבעי מלח
    'b-3', // קורנפלור
    'b-4', // אינסטנט פודינג וניל סוויטנגו
  ];

  const [weeklyBasketIds, setWeeklyBasketIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sibo_nir_weekly_basket');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WEEKLY_BASKET;
  });

  const handleLoadWeeklyBasket = () => {
    const newChecked = { ...checkedIds };
    weeklyBasketIds.forEach((id) => {
      newChecked[id] = true;
    });
    setCheckedIds(newChecked);
    try {
      localStorage.setItem('sibo_shopping_checked_v2', JSON.stringify(newChecked));
    } catch {}
    setBasketToast(`נטענו ${weeklyBasketIds.length} מוצרי בסיס קבועים! ✨`);
    setTimeout(() => setBasketToast(null), 3000);
  };

  const handleToggleWeeklyBasketItem = (id: string) => {
    const updated = weeklyBasketIds.includes(id)
      ? weeklyBasketIds.filter((itemId) => itemId !== id)
      : [...weeklyBasketIds, id];
    setWeeklyBasketIds(updated);
    try {
      localStorage.setItem('sibo_nir_weekly_basket', JSON.stringify(updated));
    } catch {}
  };

  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const toggleSpeechRecognition = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError('הדפדפן שלך אינו תומך בדיבור (נסי ב-Chrome)');
      setTimeout(() => setSpeechError(null), 3500);
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
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        if (transcript) {
          setSearchQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SpeechRec] Error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[SpeechRec] Start failed:', err);
      setIsListening(false);
    }
  };

  // Form for custom item
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomBrand, setNewCustomBrand] = useState('');
  const [newCustomWarning, setNewCustomWarning] = useState('');

  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

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

  const handleAddToOrder = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCheckedIds((prev) => ({ ...prev, [id]: true }));
    setQuantities((prev) => ({ ...prev, [id]: prev[id] || 1 }));
    setLastAddedId(id);
    setTimeout(() => setLastAddedId(null), 1800);
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

  // Instant Search Suggestions across ALL 500+ items
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchBrand = item.safeBrand?.toLowerCase().includes(q);
      const matchWarn = item.warningNote?.toLowerCase().includes(q);
      return matchName || matchBrand || matchWarn;
    }).slice(0, 12); // top 12 matches for fast clean display
  }, [allItems, searchQuery]);

  // Filter items by category & search query for main grid
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
      return 'היי! רשימת הקניות ריקה כרגע. אנא סמני את הפריטים שחסרים לך באפליקציה.';
    }

    let msg = `🛒 *רשימת קניות מותאמת ובטוחה עבור ניר* 🌿\n`;
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
    <div className="max-w-4xl mx-auto p-1.5 sm:p-3 space-y-3 animate-fadeIn pb-32 text-stone-900" dir="rtl">
      {/* 🌟 Slim, Clean Top Header Bar (No bulky black box!) */}
      <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-stone-100/90 backdrop-blur-sm rounded-2xl border border-stone-200 text-stone-900 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToScanner && (
            <button
              type="button"
              onClick={onBackToScanner}
              className="px-2.5 py-1.5 bg-white hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors border border-stone-200 flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>חזרה</span>
            </button>
          )}
          <h2 className="text-xs sm:text-sm font-black tracking-tight text-stone-900 flex items-center gap-1.5 truncate">
            <span>רשימת קניות 📋</span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* ⚡ Weekly Basket 1-Tap Load & Edit Button */}
          <div className="flex items-center bg-white rounded-xl border border-emerald-300 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handleLoadWeeklyBasket}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="טען בלחיצה אחת את כל מוצרי הבסיס השבועיים של ניר"
            >
              <span>⚡ סל שבועי ({weeklyBasketIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingWeeklyBasket(true)}
              className="px-1.5 py-1.5 bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 border-r border-emerald-200 text-xs font-bold cursor-pointer transition-colors"
              title="עריכת רשימת מוצרי הבסיס שלי"
            >
              ⚙️
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOnlyCheckedFilter(!onlyCheckedFilter)}
            className={`font-black text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              onlyCheckedFilter
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span>{onlyCheckedFilter ? '✓ מסומנים' : 'סנן:'}</span>
            <span className="bg-emerald-100 text-emerald-950 px-1.5 py-0.2 rounded-full text-[10.5px] font-black">
              {selectedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingCustom(true)}
            className="px-2 py-1.5 bg-white hover:bg-stone-50 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-stone-200 shadow-2xs"
            title="הוסיפי מוצר אישי"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">אישי</span>
          </button>
        </div>
      </div>

      {/* Basket Loaded Toast */}
      {basketToast && (
        <div className="p-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-black text-center shadow-md animate-fadeIn flex items-center justify-center gap-2">
          <span>{basketToast}</span>
        </div>
      )}

      {/* 🔍 Prominent Search Bar with Instant Autocomplete, Voice Dictation & "הוסף להזמנה" */}
      <div className="relative space-y-2.5 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-3 sm:p-4 rounded-3xl border-2 border-emerald-600 shadow-md">
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          <span className="font-black text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
            <Search className="w-4 h-4 text-emerald-700" />
            <span>חיפוש מוצר מהיר להזמנה (מתוך 500+ מוצרים):</span>
          </span>
          {isListening && (
            <span className="text-[11px] font-black text-rose-600 animate-pulse flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>🎙️ מקשיב... דברי עכשיו!</span>
            </span>
          )}
        </div>

        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 הקלידי או אמרי שם מוצר (חלב שקדים, קורנפלור, פסטה, תותים)..."
              className="w-full py-3.5 pr-11 pl-10 rounded-2xl bg-white border-2 border-emerald-600/80 focus:border-emerald-700 text-xs sm:text-sm font-black placeholder:text-stone-400 focus:outline-none shadow-xs text-right"
            />
            <Search className="w-5 h-5 text-emerald-700 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 flex items-center justify-center text-xs absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                title="נקה חיפוש"
              >
                ✕
              </button>
            )}
          </div>

          {/* 🎙️ Voice Dictation Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 shadow-md'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
            title="חפשי בדיבור קולי 🎙️"
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 animate-bounce" />
                <span className="hidden sm:inline">עצור</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span className="hidden sm:inline">דיבור 🎙️</span>
              </>
            )}
          </button>
        </div>

        {speechError && (
          <div className="text-[11px] text-rose-700 font-bold px-2 pt-0.5">
            ⚠️ {speechError}
          </div>
        )}

        {/* Live Search Suggestions Dropdown with "הוסף להזמנה" */}
        {searchQuery.trim().length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-emerald-600 shadow-xl p-3 space-y-2 animate-fadeIn z-20 text-right mt-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5 text-xs text-stone-600">
              <span className="font-bold text-emerald-900">
                תוצאות חיפוש מהירות ({searchSuggestions.length} מוצרים נמצאו):
              </span>
              <span className="text-[11px] text-stone-400">לחצי &quot;הוסף להזמנה&quot; להוספה מיידית</span>
            </div>

            {searchSuggestions.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-500">
                לא נמצא מוצר תואם ל-&quot;{searchQuery}&quot;. תוכלי להוסיף אותו ב-&quot;הוסף אישי&quot; למעלה!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {searchSuggestions.map((item) => {
                  const isChecked = !!checkedIds[item.id];
                  const isJustAdded = lastAddedId === item.id;

                  return (
                    <div
                      key={`search-${item.id}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-black text-stone-900 block truncate">
                          {item.name}
                        </span>
                        {item.safeBrand && (
                          <span className="text-[10.5px] text-emerald-800 font-semibold block truncate">
                            🏷️ {item.safeBrand}
                          </span>
                        )}
                        {item.warningNote && (
                          <span className="text-[10px] text-amber-900 font-medium block truncate">
                            ⚠️ {item.warningNote}
                          </span>
                        )}
                      </div>

                      {/* "הוסף להזמנה" Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          if (isChecked) {
                            toggleItem(item.id);
                          } else {
                            handleAddToOrder(item.id, e);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 ${
                          isChecked
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300'
                        }`}
                      >
                        {isChecked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>נוסף להזמנה ✓</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-emerald-800" />
                            <span>הוסף להזמנה</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎠 Interactive Category Carousel (קרוסלת קטגוריות חכמה עם חיצים ללא גלילה מעייפת) */}
      <CategoryCarousel
        items={SIBO_CATEGORIES.map((cat) => ({
          id: cat.id,
          label: cat.label.split('(')[0].trim(),
          icon: cat.icon,
          count: allItems.filter((i) => i.category === cat.id).length,
        })).concat(
          customItems.length > 0
            ? [{ id: 'custom', label: 'מוצרים שלי', icon: '✨', count: customItems.length }]
            : []
        )}
        selectedId={selectedCategory}
        onSelect={(catId) => setSelectedCategory(catId)}
        title="סינון קטגוריות מהיר:"
        showAllOption={true}
        allLabel="הכל"
        allIcon="📋"
        allCount={allItems.length}
        theme="emerald"
      />

      {/* Inline Form to Add Custom Item */}
      {isAddingCustom && (
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-300 space-y-3 text-right animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>הוספת מוצר אישי לרשימה:</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
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
              className="px-3.5 py-1.5 bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
            >
              הוסף להזמנה
            </button>
          </div>
        </div>
      )}

      {/* Items List Grouped by Category */}
      <div className="space-y-4">
        {SIBO_CATEGORIES.map((cat) => {
          const inCat = filteredItems.filter((i) => i.category === cat.id);
          if (inCat.length === 0) return null;

          const checkedInCat = inCat.filter((i) => checkedIds[i.id]).length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200 shadow-xs space-y-3 text-right"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">{cat.icon}</span>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">
                    {cat.label}
                  </h3>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                  {checkedInCat} מתוך {inCat.length}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
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
                          : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200/80 text-stone-700'
                      }`}
                    >
                      {/* Top row: Checkbox, Name, Quantity Counter, and "הוסף להזמנה" */}
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

                      {/* Action Bar on Card */}
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100/60">
                        <span className="text-[10px] text-stone-400 font-medium">
                          {isChecked ? '✓ נבחר להזמנה' : 'לחצי לסימון'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            if (isChecked) {
                              toggleItem(item.id);
                            } else {
                              handleAddToOrder(item.id, e);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {isChecked ? 'נוסף ✓' : 'הוסף להזמנה ➕'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Custom Items Section if any */}
        {customItems.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200 shadow-xs space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <span>✨</span>
                <span>מוצרים נוספים שהוספת אישית ({customItems.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
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
                            className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => updateQuantity(item.id, 1, e)}
                            className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleRemoveCustomItem(item.id, e)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
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

      {/* 🛒 Floating Bottom Order & WhatsApp Bar (Always accessible, doesn't crowd product selection!) */}
      {selectedCount > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:max-w-lg sm:mx-auto z-40 animate-slideUp">
          <div className="bg-stone-900/95 backdrop-blur-md text-white p-3 rounded-2xl sm:rounded-3xl border-2 border-emerald-500 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {selectedCount}
              </span>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-white block truncate">
                  {selectedCount} מוצרים בסל הקניות
                </span>
                <span className="text-[10.5px] text-emerald-300 font-bold block truncate">
                  מוכן לאריזה ושליחה ✨
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>📦 ארוז ושלח בוואטסאפ</span>
                <Send className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📦 Order Packaging & WhatsApp Sending Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn" dir="rtl">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-emerald-600 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between gap-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-xl shrink-0">
                  📦
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    אריזת רשימת הקניות ({selectedCount} מוצרים)
                  </h3>
                  <p className="text-[11px] text-stone-300 font-medium">
                    בדקי את הרשימה, הגדירי מספר ושלחי ישירות לוואטסאפ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Selected Items Breakdown */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-right text-xs sm:text-sm">
              <div className="space-y-2">
                {allItems.filter((i) => checkedIds[i.id]).map((item) => {
                  const qty = quantities[item.id] || 1;
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-stone-900 block truncate">
                          {qty > 1 ? `${qty}x ` : ''}{item.name}
                        </span>
                        {item.safeBrand && (
                          <span className="text-[10.5px] text-stone-500 block truncate">
                            🏷️ {item.safeBrand}
                          </span>
                        )}
                        {item.warningNote && (
                          <span className="text-[10px] text-amber-800 block truncate">
                            ⚠️ {item.warningNote}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={(e) => updateQuantity(item.id, -1, e)}
                            className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-black text-stone-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => updateQuantity(item.id, 1, e)}
                            className="w-5 h-5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="הסר פריט"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Phone configuration */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <span className="text-xs font-black text-emerald-950 block">
                  📱 מספר טלפון של הקונה (לשליחה ישירה):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={directPhone}
                    onChange={(e) => {
                      setDirectPhone(e.target.value);
                      localStorage.setItem('sibo_shopper_phone', e.target.value);
                    }}
                    placeholder="למשל: 054-1234567 (אופציונלי)"
                    className="flex-1 p-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleSendWhatsApp();
                  setIsOrderModalOpen(false);
                }}
                disabled={selectedCount === 0}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
                <span>שלחי עכשיו בוואטסאפ 🚀</span>
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyList}
                  className="flex-1 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSuccess ? 'הרשימה הועתקה!' : 'העתק טקסט 📋'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClearAll();
                    setIsOrderModalOpen(false);
                  }}
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>נקה סל</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ Weekly Base Basket Edit Modal (עריכה אישית של מוצרי הבסיס הקבועים) */}
      {isEditingWeeklyBasket && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn" dir="rtl">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-emerald-600 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between gap-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    עריכת סל הבסיס השבועי של ניר ⚙️
                  </h3>
                  <p className="text-[11px] text-stone-300 font-medium">
                    סמני את מוצרי היסוד הקבועים שתרצי שייטענו תמיד בלחיצה אחת ({weeklyBasketIds.length} נבחרו)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingWeeklyBasket(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* List of all items for basket inclusion */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 text-right text-xs sm:text-sm">
              {allItems.map((item) => {
                const isInBasket = weeklyBasketIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleWeeklyBasketItem(item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isInBasket
                        ? 'bg-emerald-50 border-emerald-400 font-black text-emerald-950 shadow-2xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isInBasket ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                      <span className="truncate block">
                        {item.name}
                      </span>
                    </div>

                    {item.safeBrand && (
                      <span className="text-[10px] text-stone-500 truncate shrink-0">
                        🏷️ {item.safeBrand}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-stone-600">
                סה״כ {weeklyBasketIds.length} מוצרי בסיס שמורים
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEditingWeeklyBasket(false);
                  setBasketToast('סל הבסיס השבועי נשמר בהצלחה! 💾');
                  setTimeout(() => setBasketToast(null), 3000);
                }}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
              >
                שמור וסגור ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
