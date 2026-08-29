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
  Zap,
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
  const [selectedMealType, setSelectedMealType] = useState<'all' | 'favorites' | 'quick' | 'breakfast' | 'lunch' | 'dinner' | 'dessert'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<SiboRecipe | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Favorites & 5-Star Ratings State with LocalStorage Persistence
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sibo_recipe_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sibo_recipe_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleFavorite = (recipeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [recipeId]: !prev[recipeId] };
      try {
        localStorage.setItem('sibo_recipe_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSetRating = (recipeId: string, rating: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRatings((prev) => {
      const current = prev[recipeId] || 0;
      const nextVal = current === rating ? 0 : rating; // toggle if clicking same rating
      const next = { ...prev, [recipeId]: nextVal };
      try {
        localStorage.setItem('sibo_recipe_ratings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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
        setSelectedMealType(found.mealType as any);
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

  const quickPills = ['⚡ קלות ומהירות', '🍫 מתוקים וקינוחים', '🍓 ארטיק תות', '🍮 פודינג צ׳יה', '🥞 פנקייק', '🍗 שיפודים ופרגית', '🥩 קציצות בקר', '🐟 סלמון', '🥔 קומפיר', '🍲 מרק'];

  // Counts by meal type
  const favoritesCount = useMemo(() => {
    return Object.values(favorites).filter(Boolean).length;
  }, [favorites]);

  const mealCounts = useMemo(() => {
    return {
      all: SIBO_MEAL_SUGGESTIONS.length,
      favorites: favoritesCount,
      quick: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'quick').length,
      breakfast: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'breakfast').length,
      lunch: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'lunch').length,
      dinner: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'dinner').length,
      dessert: SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === 'dessert').length,
    };
  }, [favoritesCount]);

  // Filter and sort meals: rated/favorite meals ALWAYS float to the top of the category!
  const filteredMeals = useMemo(() => {
    let list = SIBO_MEAL_SUGGESTIONS;

    if (selectedMealType === 'favorites') {
      list = list.filter((m) => favorites[m.id] || (ratings[m.id] && ratings[m.id] > 0));
    } else if (selectedMealType !== 'all') {
      list = list.filter((m) => m.mealType === selectedMealType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matched = findMatchingRecipes(q, 200);
      if (matched.length > 0) {
        if (selectedMealType === 'favorites') {
          list = matched.filter((m) => favorites[m.id] || (ratings[m.id] && ratings[m.id] > 0));
        } else if (selectedMealType === 'all') {
          list = matched;
        } else {
          list = matched.filter((m) => m.mealType === selectedMealType);
        }
      } else {
        list = list.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
            m.tag.toLowerCase().includes(q)
        );
      }
    }

    // Sort by Favorites (❤️) and Highest Star Ratings (⭐⭐⭐⭐⭐) to the TOP of the category!
    return [...list].sort((a, b) => {
      const scoreA = (ratings[a.id] || 0) + (favorites[a.id] ? 10 : 0);
      const scoreB = (ratings[b.id] || 0) + (favorites[b.id] ? 10 : 0);
      return scoreB - scoreA;
    });
  }, [selectedMealType, searchQuery, favorites, ratings]);

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
              placeholder="דברי במיקרופון או הקלידי (למשל: שיפודי פרגית, קציצות בקר, סלמון, קומפיר, פנקייק, ארטיק תות, פודינג)..."
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

        {/* Meal Segment Switcher (All, Favorites, Quick, Breakfast, Lunch, Dinner, Dessert) */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setSelectedMealType('all');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[65px] py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedMealType === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200/60'
            }`}
          >
            <span>הכל ({mealCounts.all})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('favorites');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'favorites'
                ? 'bg-rose-700 text-white shadow-xs'
                : favoritesCount > 0
                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                : 'text-stone-700 hover:text-rose-700 hover:bg-stone-200/60'
            }`}
          >
            <span>❤️ אהבתי ({favoritesCount})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('quick');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[80px] py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'quick'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>קלות ({mealCounts.quick})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('breakfast');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'breakfast'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200/60'
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
            className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'lunch'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200/60'
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
            className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'dinner'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200/60'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>ערב ({mealCounts.dinner})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('dessert');
              setSelectedRecipe(null);
            }}
            className={`flex-1 min-w-[85px] py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMealType === 'dessert'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-amber-900 hover:bg-stone-200/60'
            }`}
          >
            <span>🍫 מתוקים ({mealCounts.dessert})</span>
          </button>
        </div>

        {/* Content Body: List of Meals or Open Recipe */}
        <div className="flex-1 overflow-y-auto pr-1">
          {selectedRecipe ? (
            /* EXPANDED FULL RECIPE VIEW */
            <div className="bg-stone-50 rounded-3xl p-5 sm:p-7 border border-stone-200 space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-stone-950 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>חזרה לכל המתכונים</span>
                </button>

                {/* Top Actions: Favorite Toggle & Rating */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(selectedRecipe.id, e)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                      favorites[selectedRecipe.id]
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-rose-50 border-stone-300'
                    }`}
                  >
                    <span>{favorites[selectedRecipe.id] ? '❤️ שמור במועדפים' : '🤍 הוספי למועדפים'}</span>
                  </button>

                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
                    {selectedRecipe.tag}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {selectedRecipe.prepTime} • ~{selectedRecipe.caloriesApprox} קלוריות
                  </span>
                </div>
              </div>

              <div className="border-b border-stone-200 pb-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                    {selectedRecipe.title}
                  </h3>
                </div>
                <p className="text-sm text-stone-600 font-medium">
                  {selectedRecipe.description}
                </p>

                {/* Rating Bar inside Recipe */}
                <div className="pt-2 flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200">
                  <span className="text-xs font-bold text-stone-700">דרגי מתכון זה (יופיע בראש הרשימה):</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={(e) => handleSetRating(selectedRecipe.id, star, e)}
                        className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                          (ratings[selectedRecipe.id] || 0) >= star ? 'text-amber-400' : 'text-stone-300 hover:text-amber-300'
                        }`}
                        title={`דרג ${star} כוכבים`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {ratings[selectedRecipe.id] ? (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      דירוג שלך: {ratings[selectedRecipe.id]}/5 ⭐
                    </span>
                  ) : null}
                </div>
              </div>

              {/* SIBO Safety Notes Banner */}
              <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">יתרונות קליניים ובטיחות ל-SIBO:</span>
                  <span className="text-emerald-900 font-medium">
                    {selectedRecipe.benefits && selectedRecipe.benefits.length > 0
                      ? selectedRecipe.benefits.join(' • ')
                      : '0% שום, 0% בצל, 0% גלוטן ולקטוז — בטוח לחלוטין ל-SIBO שלב 1'}
                  </span>
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
            /* LIST / GRID OF MEALS WITH TOP-SORTED RATINGS & FAVORITES */
            <div className="space-y-3">
              {filteredMeals.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
                  <div className="text-4xl">🍲</div>
                  <h4 className="text-base font-extrabold text-stone-800">
                    לא נמצאו מתכונים תואמים
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    {selectedMealType === 'favorites'
                      ? 'עדיין לא סימנת מתכונים במועדפים. לחצי על הלב ❤️ או דרגי בכוכבים ⭐ בכל מתכון כדי שהוא יופיע כאן ובראש הרשימה!'
                      : 'נסי לחפש מילה אחרת או לחצי על אחד מכפתורי החיפוש המהיר.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMealType('all');
                    }}
                    className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
                  >
                    הצג את כל המתכונים
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredMeals.map((recipe) => {
                    const isFav = !!favorites[recipe.id];
                    const currentRating = ratings[recipe.id] || 0;

                    return (
                      <div
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className={`bg-white border p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group relative ${
                          isFav || currentRating > 0
                            ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                            : 'border-stone-200 hover:border-emerald-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isFav && (
                                <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full border border-rose-200 flex items-center gap-1">
                                  <span>❤️ אהבתי</span>
                                </span>
                              )}
                              {currentRating > 0 && (
                                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 flex items-center gap-0.5">
                                  <span>{currentRating}</span>
                                  <span>★</span>
                                </span>
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded-full border border-emerald-200/60">
                                {recipe.tag}
                              </span>
                            </div>

                            {/* Favorite Heart Button on Card */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleFavorite(recipe.id, e)}
                              className={`p-1.5 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                                isFav
                                  ? 'text-rose-600 bg-rose-50'
                                  : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100'
                              }`}
                              title={isFav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                            >
                              <span className="text-sm">{isFav ? '❤️' : '🤍'}</span>
                            </button>
                          </div>

                          <h4 className="text-sm font-black text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-2">
                            {recipe.title}
                          </h4>

                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-medium">
                            {recipe.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 space-y-2">
                          {/* 5-Star Interactive Rating on Card */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={(e) => handleSetRating(recipe.id, star, e)}
                                  className={`text-sm transition-colors hover:scale-125 cursor-pointer ${
                                    currentRating >= star ? 'text-amber-400' : 'text-stone-300 hover:text-amber-300'
                                  }`}
                                  title={`דרגי ${star} כוכבים`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>

                            <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{recipe.prepTime}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-950">
                            <span className="flex items-center gap-1">
                              <span>למתכון המלא</span>
                              <BookOpen className="w-3.5 h-3.5" />
                            </span>
                            <div className="w-6 h-6 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                              <ArrowRight className="w-3 h-3 rotate-180" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span>🍽️ 185 מתכוני שֵׁף מדורגים ל-SIBO • מתכונים שדירגת כוכבים או סימנת ב-❤️ מופיעים תמיד בראש הרשימה!</span>
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