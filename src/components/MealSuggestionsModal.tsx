import React, { useState } from 'react';
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
} from 'lucide-react';
import { SiboRecipe, SIBO_MEAL_SUGGESTIONS } from '../data/siboMealSuggestions';
import { SiboPhase } from '../types';

interface MealSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: SiboPhase;
}

export const MealSuggestionsModal: React.FC<MealSuggestionsModalProps> = ({
  isOpen,
  onClose,
  currentPhase,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [selectedRecipe, setSelectedRecipe] = useState<SiboRecipe | null>(null);

  if (!isOpen) return null;

  const filteredMeals = SIBO_MEAL_SUGGESTIONS.filter((m) => m.mealType === selectedMealType);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>תפריטים ומתכונים מותאמים אישית לגורגורילה</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              הצעות לארוחות ומתכונים ל-SIBO 🍲
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              תפריטים קלים, מזינים וטעימים לבוקר, צהריים וערב — לחצי על כל ארוחה לצפייה במתכון המלא!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-base transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Meal Segment Switcher (Breakfast, Lunch, Dinner) */}
        <div className="flex items-center justify-center gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200 shrink-0">
          <button
            onClick={() => {
              setSelectedMealType('breakfast');
              setSelectedRecipe(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedMealType === 'breakfast'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>ארוחות בוקר ☕</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('lunch');
              setSelectedRecipe(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedMealType === 'lunch'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>ארוחות צהריים 🥗</span>
          </button>

          <button
            onClick={() => {
              setSelectedMealType('dinner');
              setSelectedRecipe(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedMealType === 'dinner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-200/60'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>ארוחות ערב 🍲</span>
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>חזרה לרשימת הארוחות</span>
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
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-1">
                  {selectedRecipe.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">{selectedRecipe.description}</p>
              </div>

              {/* SIBO clinical note */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-2 text-xs sm:text-sm text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">התאמה רפואית לניר:</strong>
                  <span>{selectedRecipe.siboNotes}</span>
                </div>
              </div>

              {/* Ingredients & Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Ingredients */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5 border-b pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>מצרכים דלי FODMAP:</span>
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5 border-b pb-2">
                    <ChefHat className="w-4 h-4 text-emerald-600" />
                    <span>אופן ההכנה (שלב אחר שלב):</span>
                  </h4>
                  <ol className="space-y-2.5 text-xs sm:text-sm text-stone-700 list-decimal list-inside">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedRecipe(meal)}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-lg">
                        {meal.tag}
                      </span>
                      <span className="text-stone-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {meal.prepTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {meal.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {meal.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>צפה במתכון המלא</span>
                    <span className="bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white w-7 h-7 rounded-xl flex items-center justify-center transition-all">
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
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
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
