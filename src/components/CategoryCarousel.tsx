import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronLeft, LayoutGrid, Check } from 'lucide-react';

export interface CategoryCarouselItem {
  id: string;
  label: string;
  icon?: string | React.ReactNode;
  count?: number;
  badge?: string;
}

interface CategoryCarouselProps {
  items: CategoryCarouselItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  title?: string;
  showAllOption?: boolean;
  allLabel?: string;
  allIcon?: string;
  allCount?: number;
  theme?: 'emerald' | 'amber' | 'stone' | 'teal';
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  items,
  selectedId,
  onSelect,
  title = 'קטגוריות:',
  showAllOption = true,
  allLabel = 'הכל',
  allIcon = '📋',
  allCount,
  theme = 'emerald',
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

  // Full item list including "All"
  const fullItems = useMemo(() => {
    const list: CategoryCarouselItem[] = [];
    if (showAllOption) {
      list.push({
        id: 'all',
        label: allLabel,
        icon: allIcon,
        count: allCount,
      });
    }
    return [...list, ...items];
  }, [items, showAllOption, allLabel, allIcon, allCount]);

  // Items per page: 3 on mobile, 4 on desktop
  const itemsPerPage = 3;
  const totalPages = Math.ceil(fullItems.length / itemsPerPage);

  // Auto-align page with selected item
  useEffect(() => {
    const selectedIndex = fullItems.findIndex((it) => it.id === selectedId);
    if (selectedIndex >= 0) {
      const pageOfSelected = Math.floor(selectedIndex / itemsPerPage);
      setCurrentPage(pageOfSelected);
    }
  }, [selectedId, fullItems]);

  const visibleItems = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return fullItems.slice(start, start + itemsPerPage);
  }, [fullItems, currentPage, itemsPerPage]);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1 < totalPages ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 >= 0 ? prev - 1 : totalPages - 1));
  };

  const getThemeClasses = (isSelected: boolean) => {
    if (isSelected) {
      switch (theme) {
        case 'amber':
          return 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300';
        case 'teal':
          return 'bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-300';
        case 'stone':
          return 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-400';
        case 'emerald':
        default:
          return 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300';
      }
    }
    return 'bg-white hover:bg-stone-100/90 text-stone-800 border-stone-200 shadow-2xs';
  };

  return (
    <div className="bg-stone-100/90 backdrop-blur-sm p-2 sm:p-2.5 rounded-2xl border border-stone-300 shadow-xs space-y-1.5 text-right select-none" dir="rtl">
      {/* Header with Title, Page Indicator & Grid Modal Toggle */}
      <div className="flex items-center justify-between px-1 text-[11px] font-black text-stone-600">
        <div className="flex items-center gap-1.5">
          <span>{title}</span>
          <span className="text-[10px] text-stone-400 font-bold">
            (עמוד {currentPage + 1} מתוך {totalPages})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsGridModalOpen(!isGridModalOpen)}
          className="text-emerald-800 hover:text-emerald-950 font-black text-[11px] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-stone-200 shadow-2xs hover:bg-emerald-50 transition-colors"
          title="הצג את כל הקטגוריות בחלון מלא"
        >
          <LayoutGrid className="w-3 h-3 text-emerald-700" />
          <span>{isGridModalOpen ? 'סגור תצוגה' : 'הצג הכל ▾'}</span>
        </button>
      </div>

      {/* 🎠 Carousel Stepper Row (Arrows on edges, perfectly visible cards in between) */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Right Arrow (Previous in RTL) */}
        <button
          type="button"
          onClick={handlePrev}
          className="w-8 h-10 sm:w-9 sm:h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-300 shadow-2xs cursor-pointer active:scale-95 transition-all shrink-0"
          title="קטגוריות קודמות"
        >
          <ChevronRight className="w-4 h-4 text-stone-700" />
        </button>

        {/* Visible 3 Category Cards */}
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 flex-1 min-w-0">
          {visibleItems.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-center flex flex-col items-center justify-center border transition-all cursor-pointer min-w-0 active:scale-95 ${getThemeClasses(
                  isSelected
                )}`}
              >
                <div className="text-base sm:text-lg leading-none shrink-0 mb-0.5">
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-black truncate w-full leading-tight block">
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span className={`text-[8.5px] sm:text-[9.5px] font-bold ${
                    isSelected ? 'text-emerald-100' : 'text-stone-400'
                  }`}>
                    {item.count} פריטים
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Left Arrow (Next in RTL) */}
        <button
          type="button"
          onClick={handleNext}
          className="w-8 h-10 sm:w-9 sm:h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-300 shadow-2xs cursor-pointer active:scale-95 transition-all shrink-0"
          title="קטגוריות הבאות"
        >
          <ChevronLeft className="w-4 h-4 text-stone-700" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-1 pt-0.5">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentPage(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentPage === idx
                ? 'w-5 bg-emerald-700'
                : 'w-1.5 bg-stone-300 hover:bg-stone-400'
            }`}
            title={`עבור לעמוד ${idx + 1}`}
          />
        ))}
      </div>

      {/* Expandable Full Grid Modal / Drawer if user taps "הצג הכל ▾" */}
      {isGridModalOpen && (
        <div className="p-3 bg-white rounded-2xl border-2 border-emerald-600 shadow-lg space-y-2 mt-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-100 pb-1.5 text-xs text-stone-600">
            <span className="font-bold text-emerald-950">
              כל הקטגוריות לבחירה מהירה ({fullItems.length}):
            </span>
            <button
              type="button"
              onClick={() => setIsGridModalOpen(false)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              ✕ סגור
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto pr-0.5">
            {fullItems.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={`modal-${item.id}`}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    setIsGridModalOpen(false);
                  }}
                  className={`p-2 rounded-xl text-right flex items-center justify-between gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="text-xs font-black truncate">{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
