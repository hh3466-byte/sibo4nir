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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      {/* הצעות לארוחות (Recommended) Floating Button */}
      <button
        id="btn-floating-meal-suggestions"
        type="button"
        onClick={onOpenMealSuggestions}
        className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-extrabold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-2xl border border-amber-300/40 active:scale-95 group cursor-pointer"
      >
        <ChefHat className="w-5 h-5 text-amber-100 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide">הצעות לארוחות 🍲</span>
        <span className="bg-white/25 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
          מומלץ לניר
        </span>
      </button>
    </div>
  );
};
