import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Sparkles,
  ChefHat,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Coffee,
  Sun,
  Moon,
  Search,
  X,
  Mic,
  MicOff,
  Cookie,
} from 'lucide-react';
import { SiboRecipe, SIBO_MEAL_SUGGESTIONS, findMatchingRecipes } from '../data/siboMealSuggestions';
import { SiboPhase } from '../types';

interface MealSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: SiboPhase;
  initialSearchQuery?: string | null;
  initialRecipeId?: string | null;
}

export const MealSuggestionsModal: React.FC<MealSuggestionsModalProps> = ({
  isOpen,
  onClose,
  currentPhase,
  initialSearchQuery = null,
  initialRecipeId = null,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<SiboRecipe | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Synchronize initial query and recipe ID when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedRecipe(null);
      setSearchQuery('');
      setSelectedMealType('all');
      setIsListening(false);
      setSpeechError(null);
      return;
    }

    if (initialRecipeId) {
      const found = SIBO_MEAL_SUGGESTIONS.find((r) => r.id === initialRecipeId);
      if (found) {
        setSelectedRecipe(found);
        setSelectedMealType(found.mealType);
        return;
      }
    }

    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchQuery(initialSearchQuery.trim());
      setSelectedMealType('all');
      const matches = findMatchingRecipes(initialSearchQuery, 1);
      if (matches.length === 1 && (initialSearchQuery.includes('מרק') || initialSearchQuery.includes('שקשוקה'))) {
        setSelectedRecipe(matches[0]);
      }
    } else {
      setSearchQuery('');
      setSelectedRecipe(null);
      setSelectedMealType('all');
    }
  }, [isOpen, initialRecipeId, initialSearchQuery]);

  // Speech Recognition Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Toggle Voice Input Recognition (Hebrew)
  const handleToggleVoiceInput = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('הדפדפן אינו תומך בזיהוי קולי ישיר. ניתן להקליד חופשי בתיבת החיפוש.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
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
          setSearchQuery(transcript);
          if (selectedRecipe) setSelectedRecipe(null);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('גישה למיקרופון נחסמה. אנא אשרי הרשאת מיקרופון בדפדפן.');
        } else if (event.error === 'no-speech') {
          setSpeechError('לא נקלט קול, אנא נסי שוב.');
        } else {
          setSpeechError('שגיאת זיהוי קולי: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError('לא ניתן להפעיל מיקרופון: ' + (err?.message || 'שגיאה כללית'));
    }
  };

  const quickPills = ['🍗 שיפודים ופרגית', '🥩 בקר וקציצות', '🐟 דגים וסלמון', '🥔 קומפיר', '🌯 דפי אורז', '🥞 פנקייק', '🍫 סניקרס וצ׳יה', '🍲 מרק', '🍳 ביצים'];

  // Counts by meal type
  const mealCounts = useMemo(() => {
    return {
      all: SIBO_MEAL_SUGGESTIONS.length,
      breakfast: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'breakfast').length,
      lunch: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'lunch').length,
      dinner: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'dinner').length,
      snack: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'snack').length,
    };
  }, []);

  // Filter meals based on active tab and search query
  const filteredMeals = useMemo(() => {
    let list = SIBO_MEAL_SUGGESTIONS;

    if (selectedMealType !== 'all') {
      list = list.filter((m) => m.mealType === selectedMealType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matched = findMatchingRecipes(q, 35);
      if (matched.length > 0) {
        if (selectedMealType === 'all') {
          return matched;
        } else {
          return matched.filter((m) => m.mealType === selectedMealType);
        }
      }
      return list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
          m.tag.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedMealType, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-4 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col" dir="rtl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>המלצת שֵׁף דַּלָּה פּוּפוּ ל-SIBO 👨‍🍳</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              מתכונים וארוחות — המלצת שֵׁף דַּלָּה פּוּפוּ 🍲
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              תפריטים קלים, מזינים וטעימים ללא שום, ללא בצל ו-0% תסיסה בהמלצת שֵׁף דַּלָּה פּוּפוּ — לחצי על כל ארוחה לצפייה במתכון המלא!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-base transition-colors shrink-0 cursor-pointer"
            title="סגור חלון"
          >
            ✕
          </button>
        </div>

        {/* Live Voice & Text Search Bar for Ingredients & Dishes */}
        <div className="space-y-2 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedRecipe) setSelectedRecipe(null);
              }}
              placeholder="דברי במיקרופון או הקלידי (למשל: שיפודי פרגית, קציצות בקר, סלמון, קומפיר, פנקייק, סניקרס)..."
              className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-stone-50 border-2 border-stone-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all shadow-2xs"
            />

            {/* Embedded Live Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
              }`}
              title={isListening ? 'עצור הקשבה קולית' : 'דברי במיקרופון (זיהוי קולי בעברית)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4 text-emerald-700" />
              )}
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold bg-stone-200 hover:bg-stone-300 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                title="נקה חיפוש"
              >
                ✕
              </button>
            )}
          </div>

          {/* Listening Live Wave Feedback */}
          {isListening && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-100 via-red-100 to-amber-100 border-2 border-rose-400 flex items-center justify-between gap-3 text-rose-950 text-xs sm:text-sm animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span className="font-black">🎙️ מקשיב לך עכשיו בעברית... אמרי כל מנה או מצרך שבא לך!</span>
              </div>
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs"
              >
                סיום ✕
              </button>
            </div>
          )}

          {/* Speech Error message */}
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

          {/* Quick Ingredient & Dish Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-400 font-bold text-[11px] shrink-0">חיפוש מהיר:</span>
            {quickPills.map((pill) => {
              const cleanWord = pill.replace(/^[^\s]+\s*/, '');
              const isActive = searchQuery.includes(cleanWord);
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    setSearchQuery(cleanWord);
                    if (selectedRecipe) setSelectedRecipe(null);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal Segment Switcher (All, Breakfast, Lunch, Dinner, Snack) */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setSelectedMealType('all');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedMealType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <span>הכל ({mealCounts.all})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('breakfast');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'breakfast'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>בוקר ({mealCounts.breakfast})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('lunch');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'lunch'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>צהריים ({mealCounts.lunch})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('dinner');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'dinner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>ערב ({mealCounts.dinner})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('snack');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[80px] py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'snack'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>נשנוש ({mealCounts.snack})</span>
          </button>
        </div>

        {/* Content Body: List of Meals or Open Recipe */}
        <div className="flex-1 overflow-y-auto pr-1">
          {selectedRecipe ? (
            /* EXPANDED FULL RECIPE VIEW */
            <div className="bg-stone-50 rounded-3xl p-5 sm:p-7 border border-stone-200 space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>חזרה לכל המתכונים</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    {selectedRecipe.tag}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {selectedRecipe.difficulty} • {selectedRecipe.prepTime}
                  </span>
                </div>
              </div>

              <div className="border-b border-stone-200 pb-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  {selectedRecipe.title}
                </h3>
                <p className="text-sm text-stone-600 mt-1">
                  {selectedRecipe.description}
                </p>
              </div>

              {/* SIBO Safety Notes Banner */}
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">למה המתכון בטוח ב-100% ל-SIBO?</span>
                  <span className="text-emerald-800">{selectedRecipe.siboNotes}</span>
                </div>
              </div>

              {/* Ingredients and Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Ingredients List */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5 border-b border-stone-100 pb-2">
                    <span>🛒 מצרכים מדויקים ל-SIBO:</span>
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions Steps */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5 border-b border-stone-100 pb-2">
                    <span>👨‍🍳 הוראות הכנה שלב-אחר-שלב:</span>
                  </h4>
                  <ol className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            /* LIST / GRID OF MEALS */
            <div className="space-y-3">
              {filteredMeals.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
                  <div className="text-4xl">🍲</div>
                  <h4 className="text-base font-extrabold text-stone-800">
                    לא נמצאו מתכונים תואמים לחיפוש
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    נסי לחפש מילה אחרת (למשל: עוף, פרגית, סלמון, קישוא, ביצה, שוקולד, מרק) או לחצי על אחד מכפתורי החיפוש המהיר.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMealType('all');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    הצג את כל המתכונים
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredMeals.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="bg-white border border-stone-200 hover:border-emerald-400 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/60">
                            ⭐ המלצת שֵׁף דַּלָּה פּוּפוּ
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{recipe.prepTime}</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                          {recipe.title}
                        </h4>

                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                        <span className="flex items-center gap-1">
                          <span>צפי במתכון של שף דלה פופו</span>
                          <BookOpen className="w-3.5 h-3.5" />
                        </span>
                        <div className="w-6 h-6 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                          <ArrowRight className="w-3 h-3 rotate-180" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span>🍽️ כל המתכונים בהמלצת שֵׁף דַּלָּה פּוּפוּ מכילים 0% שום רגיל, 0% בצל ו-0% לקטוז.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};