import React from 'react';
import { ChefHat, Sparkles } from 'lucide-react';

interface FloatingActionButtonsProps {
  onOpenMealSuggestions: () => void;
  onOpenHungerWizard: () => void;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onOpenMealSuggestions,
  onOpenHungerWizard,
}) => {
  return (
    <div
      id="floating-sibo-actions"
      className="hidden sm:flex fixed bottom-5 left-5 z-30 flex-col gap-2.5 items-start"
    >
      {/* אני רעבה SOS Floating Button */}
      <button
        id="btn-floating-hunger-sos"
        type="button"
        onClick={onOpenHungerWizard}
        className="px-4 py-2.5 sm:px-5 sm:py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 group cursor-pointer"
        title="אשף שובע מהיר — אני רעבה! מה לאכול עכשיו?"
      >
        <span className="text-base sm:text-lg group-hover:scale-110 transition-transform">🥑</span>
        <span className="tracking-wide">אני רעבה!!! ✨</span>
      </button>

      {/* הצעות לארוחות Floating Button - המלצת שֵׁף דַּלָּה פּוּפוּ */}
      <button
        id="btn-floating-meal-suggestions"
        type="button"
        onClick={onOpenMealSuggestions}
        className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-lg hover:shadow-xl active:scale-95 group cursor-pointer"
        title="המלצת שֵׁף דַּלָּה פּוּפוּ — מתכונים מותאמים ל-SIBO"
      >
        <ChefHat className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide">מתכוני שֵׁף (60+) 🍲</span>
      </button>
    </div>
  );
};
