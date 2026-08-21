import React, { useState } from 'react';
import { SiboPhase } from '../types';
import { ChefHat, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface MealAnalyzerProps {
  currentPhase: SiboPhase;
  onAnalyzeRecipe: (recipeText: string) => Promise<void>;
  isLoading: boolean;
}

export const MealAnalyzer: React.FC<MealAnalyzerProps> = ({
  currentPhase,
  onAnalyzeRecipe,
  isLoading,
}) => {
  const [recipeInput, setRecipeInput] = useState('');

  const sampleRecipes = [
    {
      title: 'מוקפץ עוף אסייתי',
      text: 'חזה עוף מוקפץ עם שום, בצל, קישוא, פטריות שמפיניון, רוטב סויה, כרובית ונודלס מחיטה',
    },
    {
      title: 'סלט ישראלי עם טחינה',
      text: 'עגבניות, מלפפונים, בצל סגול, פטרוזיליה, שמן זית, מיץ לימון, טחינה גולמית וגרגרי חומוס',
    },
    {
      title: 'מרק עוף ביתי קלאסי',
      text: 'כרעי עוף, גזר, קישוא, שורש סלרי, בצל שלם, שיני שום, פטרוזיליה ושמיר',
    },
    {
      title: 'ארוחת בוקר קלה',
      text: 'שתי ביצים עין, שמן זית, מלפפון, תותים טריים, חלב שקדים ללא סוכר וגבינת פרמזן מיושנת',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeInput.trim()) return;
    onAnalyzeRecipe(recipeInput.trim());
  };

  return (
    <div id="meal-analyzer-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          בודק מנות, מתכונים ותפריטים 🍳
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          מתכננת לבשל מנה או מזמינה במסעדה? הדביקי את רשימת הרכיבים והמערכת תבדוק כל רכיב בנפרד, תסמן
          באור אדום את מה שמתסיס ותציע חלופות מותאמות לניר.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="recipe-textarea"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2"
            >
              הזיני את רכיבי המנה או המתכון:
            </label>
            <textarea
              id="recipe-textarea"
              rows={4}
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              placeholder="למשל: סלט עם חסה, עגבניות שרי, מלפפון, בצל ירוק, גבינת פטה, אגוזי מלך ורוטב שמן זית ולימון..."
              className="w-full p-4 bg-stone-50 border border-stone-300 rounded-2xl text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>ניתוח רכיב-אחר-רכיב עם חלופות SIBO</span>
            </span>

            <button
              type="submit"
              disabled={isLoading || !recipeInput.trim()}
              className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>מנתח מתכון...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  <span>בדוק והתאם ל-SIBO 🚦</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Recipe Presets */}
        <div className="pt-6 border-t border-stone-100 space-y-3">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            או בחרי דוגמה למנה נפוצה:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sampleRecipes.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRecipeInput(item.text);
                  onAnalyzeRecipe(item.text);
                }}
                className="text-right p-3.5 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-300 transition-all text-xs space-y-1 group"
              >
                <div className="font-bold text-stone-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 rtl:rotate-180 transition-transform" />
                </div>
                <p className="text-stone-500 line-clamp-1">{item.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
