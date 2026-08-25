import React from 'react';
import { ChefHat } from 'lucide-react';

interface FloatingActionButtonsProps {
  onOpenMealSuggestions: () => void;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onOpenMealSuggestions,
}) => {
  return (
    <div
      id="floating-sibo-actions"
      className="fixed bottom-4 left-4 z-30"
    >
      {/* הצעות לארוחות Floating Button - positioned to side on mobile */}
      <button
        id="btn-floating-meal-suggestions"
        type="button"
        onClick={onOpenMealSuggestions}
        className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl border border-amber-300/40 active:scale-95 group cursor-pointer backdrop-blur-xs"
        title="הצעות לארוחות מומלצות לניר"
      >
        <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide">הצעות לארוחות 🍲</span>
        <span className="hidden sm:inline-block bg-white/25 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold">
          מומלץ לניר
        </span>
      </button>
    </div>
  );
};
