import React, { useState, useEffect, useMemo } from 'react';
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

  // Synchronize initial query and recipe ID when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedRecipe(null);
      setSearchQuery('');
      setSelectedMealType('all');
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
      // If there's an exact high match, we can find it
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

  const quickPills = ['🍲 מרק', '🥗 סלט', '🍗 עוף', '🍳 ביצים', '🐟 דגים', '🥩 בקר', '🍫 מתוק'];

  // Filter meals based on active tab and search query
  const filteredMeals = useMemo(() => {
    let list = SIBO_MEAL_SUGGESTIONS;

    if (selectedMealType !== 'all') {
      list = list.filter((m) => m.mealType === selectedMealType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matched = findMatchingRecipes(q, 20);
      if (matched.length > 0) {
        if (selectedMealType === 'all') {
          return matched;
        } else {
          return matched.filter((m) => m.mealType === selectedMealType);
        }
      }
      // Fallback substring search
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
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-4 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>תפריטים ומתכונים מותאמים אישית ל-SIBO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              מתכונים וארוחות ל-SIBO 🍲
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              תפריטים קלים, מזינים וטעימים ללא שום, ללא בצל ו-0% תסיסה — לחצי על כל ארוחה לצפייה במתכון המלא!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-base transition-colors shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live Search Bar for Ingredients & Dishes */}
        <div className="space-y-2 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedRecipe) setSelectedRecipe(null);
              }}
              placeholder="חפשי מתכון לפי מצרך או מנה (למשל: מרק, עוף, סלט, חביתה, קישוא, גזר, סלמון)..."
              className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-stone-50 border-2 border-stone-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all"
            />
            <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
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

          {/* Quick Ingredient Filters */}
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
            <span>הכל ({SIBO_MEAL_SUGGESTIONS.length})</span>
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
            <span>בוקר</span>
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
            <span>צהריים</span>
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
            <span>ערב</span>
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
                  <span>חזרה לרשימת המתכונים</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedRecipe.prepTime}</span>
                  </span>
                  <span className="bg-stone-200 text-stone-800 px-2.5 py-1 rounded-lg font-semibold">
                    רמה: {selectedRecipe.difficulty}
                  </span>
                </div>
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                  {selectedRecipe.tag}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 mb-1">
                  {selectedRecipe.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">{selectedRecipe.description}</p>
              </div>

              {/* SIBO clinical note */}
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block text-emerald-900 mb-0.5">התאמה רפואית לניר:</strong>
                  <span className="leading-relaxed">{selectedRecipe.siboNotes}</span>
                </div>
              </div>

              {/* Ingredients & Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Ingredients */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
                  <h4 className="font-black text-stone-900 text-sm flex items-center gap-1.5 border-b pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>מצרכים דלי FODMAP:</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 font-black text-base leading-none">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
                  <h4 className="font-black text-stone-900 text-sm flex items-center gap-1.5 border-b pb-2">
                    <ChefHat className="w-4 h-4 text-emerald-600" />
                    <span>אופן ההכנה (שלב אחר שלב):</span>
                  </h4>
                  <ol className="space-y-3 text-xs sm:text-sm text-stone-700 list-decimal list-inside">
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i} className="leading-relaxed">
                        <span className="text-stone-800">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            /* MEALS LIST CARDS */
            <div>
              {filteredMeals.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">🍲</div>
                  <h4 className="text-base font-bold text-stone-800">לא נמצאו מתכונים תואמים לחיפוש</h4>
                  <p className="text-xs text-stone-500">נסי לחפש מילה כללית יותר כמו "עוף", "מרק", "סלט" או "ביצים"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMealType('all');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    הצג את כל המתכונים
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMeals.map((meal) => (
                    <div
                      key={meal.id}
                      onClick={() => setSelectedRecipe(meal)}
                      className="bg-white rounded-3xl p-5 border-2 border-stone-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1 text-xs">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-lg">
                            {meal.tag}
                          </span>
                          <span className="text-stone-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {meal.prepTime}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                          {meal.title}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {meal.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                        <span>צפי במתכון המלא 📖</span>
                        <span className="bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white w-7 h-7 rounded-xl flex items-center justify-center transition-all">
                          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-100 pt-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
            🍽️ כל המתכונים מכילים 0% שום רגיל, 0% בצל ו-0% לקטוז.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
