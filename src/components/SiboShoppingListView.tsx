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
    <div className="max-w-4xl mx-auto p-2.5 sm:p-5 space-y-4 animate-fadeIn pb-28 text-stone-900" dir="rtl">
      {/* Calm Header Card */}
      <div className="bg-stone-900 text-white p-4 sm:p-5 rounded-3xl shadow-md text-right border border-stone-800 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-100 text-[10px] sm:text-xs font-black">
            <span>מאגר 500+ מוצרים ומותגים מאושרים</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>הכנת רשימת קניות לשליחה 📋</span>
          </h2>
          <p className="text-xs text-stone-300 font-medium">
            סמני או חפשי מוצרים שחסרים לך במקרר/מזווה – ושלחי ישירות לוואטסאפ של הקונה!
          </p>
        </div>

        {onBackToScanner && (
          <button
            type="button"
            onClick={onBackToScanner}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold shrink-0 transition-colors border border-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <span>קניות בעצמי</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sticky Bottom/Top WhatsApp Action Bar */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-stone-300 shadow-md space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-xs ${
              selectedCount > 0 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              {selectedCount}
            </span>
            <div>
              <span className="text-xs sm:text-sm font-black text-stone-900 block leading-tight">
                {selectedCount > 0 ? `${selectedCount} מוצרים נבחרו להזמנה` : 'הרשימה ריקה כרגע'}
              </span>
              <span className="text-[10.5px] text-stone-500 font-medium">
                {selectedCount > 0 ? 'מוכן לשליחה מהירה בוואטסאפ' : 'סמני מה חסר לך או השתמשי בחיפוש למטה'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyList}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-stone-200"
              title="העתק טקסט"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSuccess ? 'הועתק!' : 'העתק'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-stone-200"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>הוסף אישי</span>
            </button>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
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
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-35 disabled:hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <Send className="w-4 h-4 rtl:rotate-180" />
          <span>שלחי בוואטסאפ למי שקונה 📱 ({selectedCount} מוצרים)</span>
        </button>

        {/* Filters and Shopper Phone */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setOnlyCheckedFilter(!onlyCheckedFilter)}
            className={`font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
              onlyCheckedFilter
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {onlyCheckedFilter ? '✓ מציג רק מסומנים' : 'הצג רק מה שסומן'}
          </button>

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
                  className="font-black text-emerald-700 px-1 cursor-pointer"
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

      {/* 🏷️ Ultra-Compact Single-Line Category Scroll Bar (דק, חסכוני במקום ולא מסתיר את המסך) */}
      <div className="bg-stone-100/80 p-2 sm:p-2.5 rounded-2xl border border-stone-200 space-y-1 text-right">
        <div className="flex items-center justify-between px-1 text-[11px] font-black text-stone-600">
          <span>סינון קטגוריות (גללי ימינה/שמאלה ↔️):</span>
          <span className="text-[10px] text-stone-400 font-bold">15 קטגוריות</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs scale-102'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span>📋</span>
            <span>הכל (500+)</span>
          </button>

          {SIBO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs scale-102'
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
              className={`py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                selectedCategory === 'custom'
                  ? 'bg-amber-700 text-white border-amber-700 shadow-xs scale-102'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>✨</span>
              <span>מוצרים שלי ({customItems.length})</span>
            </button>
          )}
        </div>
      </div>

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
    </div>
  );
};
