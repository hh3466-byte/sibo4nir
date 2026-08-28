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
      className="fixed bottom-4 left-4 z-30 flex flex-col gap-2.5 items-start"
    >
      {/* אני רעבה SOS Floating Button */}
      <button
        id="btn-floating-hunger-sos"
        type="button"
        onClick={onOpenHungerWizard}
        className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white rounded-full font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-2xl border-2 border-amber-300 active:scale-95 group cursor-pointer backdrop-blur-md animate-pulse"
        title="אשף שובע מהיר — אני רעבה! מה לאכול עכשיו?"
      >
        <span className="text-base sm:text-lg group-hover:scale-125 transition-transform">🥑</span>
        <span className="tracking-wide">אני רעבה!!! ✨</span>
      </button>

      {/* הצעות לארוחות Floating Button - המלצת שֵׁף דַּלָּה פּוּפוּ */}
      <button
        id="btn-floating-meal-suggestions"
        type="button"
        onClick={onOpenMealSuggestions}
        className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xl border border-emerald-300/40 active:scale-95 group cursor-pointer backdrop-blur-xs ring-2 ring-emerald-400/20"
        title="המלצת שֵׁף דַּלָּה פּוּפוּ — מתכונים מותאמים ל-SIBO"
      >
        <ChefHat className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide">המלצת שֵׁף דַּלָּה פּוּפוּ 🍲</span>
      </button>
    </div>
  );
};
