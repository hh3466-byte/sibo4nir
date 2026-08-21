import React, { useState, useMemo } from 'react';
import { SiboPhase, SiboFoodItem, TrafficLightStatus, FoodCategory } from '../types';
import { SIBO_FOOD_DATABASE, SIBO_CATEGORIES_INFO } from '../data/siboDatabase';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface FoodDatabaseViewProps {
  currentPhase: SiboPhase;
  onSelectFoodForAnalysis: (foodName: string) => void;
}

export const FoodDatabaseView: React.FC<FoodDatabaseViewProps> = ({
  currentPhase,
  onSelectFoodForAnalysis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TrafficLightStatus>('all');
  const [selectedItem, setSelectedItem] = useState<SiboFoodItem | null>(null);

  const isPhase1 = currentPhase === 'phase1_strict';

  const filteredFoods = useMemo(() => {
    return SIBO_FOOD_DATABASE.filter((item) => {
      const currentStatus = isPhase1 ? item.statusPhase1 : item.statusPhase2;

      // Status filter
      if (statusFilter !== 'all' && currentStatus !== statusFilter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchNameHe = item.nameHe.toLowerCase().includes(query);
        const matchNameEn = item.nameEn.toLowerCase().includes(query);
        const matchNotes = item.notesHe.toLowerCase().includes(query);
        const matchFodmap = item.fodmapGroup.toLowerCase().includes(query);
        return matchNameHe || matchNameEn || matchNotes || matchFodmap;
      }

      return true;
    });
  }, [searchTerm, selectedCategory, statusFilter, isPhase1]);

  const stats = useMemo(() => {
    const total = SIBO_FOOD_DATABASE.length;
    const green = SIBO_FOOD_DATABASE.filter(
      (item) => (isPhase1 ? item.statusPhase1 : item.statusPhase2) === 'GREEN'
    ).length;
    const yellow = SIBO_FOOD_DATABASE.filter(
      (item) => (isPhase1 ? item.statusPhase1 : item.statusPhase2) === 'YELLOW'
    ).length;
    const red = SIBO_FOOD_DATABASE.filter(
      (item) => (isPhase1 ? item.statusPhase1 : item.statusPhase2) === 'RED'
    ).length;
    return { total, green, yellow, red };
  }, [isPhase1]);

  return (
    <div id="food-database-view" className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Quick stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            מאגר המאכלים ל-SIBO עבור ניר 🥦
          </h2>
          <p className="text-sm text-stone-500">
            מדריך מהיר מבוסס מחקרי ד״ר סיבקר, ד״ר ג׳קובי ואוניברסיטת מונאש
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{stats.green} מותרים (ירוק)</span>
          </span>
          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>{stats.yellow} מוגבלים (צהוב)</span>
          </span>
          <span className="bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>{stats.red} אסורים (אדום)</span>
          </span>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              id="search-food-db-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש מאכל בעברית או באנגלית (למשל: שום, אורז, תות, אבוקדו, פרמזן)..."
              className="w-full pl-4 pr-11 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setStatusFilter('GREEN')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                statusFilter === 'GREEN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ירוק</span>
            </button>
            <button
              onClick={() => setStatusFilter('YELLOW')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                statusFilter === 'YELLOW'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>צהוב</span>
            </button>
            <button
              onClick={() => setStatusFilter('RED')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                statusFilter === 'RED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>אדום</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            כל הקטגוריות
          </button>
          {Object.entries(SIBO_CATEGORIES_INFO).map(([catKey, catInfo]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === catKey
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {catInfo.nameHe}
            </button>
          ))}
        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item) => {
            const currentStatus = isPhase1 ? item.statusPhase1 : item.statusPhase2;
            const isGreen = currentStatus === 'GREEN';
            const isYellow = currentStatus === 'YELLOW';
            const isRed = currentStatus === 'RED';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer hover:shadow-md relative bg-white ${
                  isGreen
                    ? 'border-emerald-200 hover:border-emerald-400'
                    : isYellow
                    ? 'border-amber-200 hover:border-amber-400'
                    : 'border-rose-200 hover:border-rose-400'
                }`}
              >
                {/* Traffic Light Dot & Category */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isGreen
                        ? 'bg-emerald-100 text-emerald-800'
                        : isYellow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>{isGreen ? 'מותר (ירוק)' : isYellow ? 'מוגבל (צהוב)' : 'אסור (אדום)'}</span>
                  </span>

                  <span className="text-[11px] font-medium text-stone-400">
                    {SIBO_CATEGORIES_INFO[item.category]?.nameHe || item.category}
                  </span>
                </div>

                {/* Name */}
                <div className="mb-2">
                  <h3 className="text-base font-bold text-stone-900">{item.nameHe}</h3>
                  <p className="text-xs text-stone-400">{item.nameEn}</p>
                </div>

                {/* Safe portion snippet */}
                <div className="bg-stone-50 rounded-xl p-2.5 mb-3 text-xs">
                  <span className="text-stone-500 font-medium block">כמות בטוחה מומלצת:</span>
                  <span className="font-bold text-stone-800">{item.safePortionHe}</span>
                </div>

                {/* FODMAP Group */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  <span className="truncate max-w-[200px]">{item.fodmapGroup}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    פרטים <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 space-y-2">
            <Search className="w-8 h-8 mx-auto text-stone-300" />
            <p className="text-base font-semibold">לא נמצאו מאכלים התואמים את החיפוש</p>
            <p className="text-xs text-stone-400">נסי לשנות את מילת החיפוש או לבחור בקטגוריה אחרת.</p>
          </div>
        )}
      </div>

      {/* Food Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-fadeIn relative">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-2 ${
                    (isPhase1 ? selectedItem.statusPhase1 : selectedItem.statusPhase2) === 'GREEN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : (isPhase1 ? selectedItem.statusPhase1 : selectedItem.statusPhase2) === 'YELLOW'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {(isPhase1 ? selectedItem.statusPhase1 : selectedItem.statusPhase2) === 'GREEN'
                    ? 'אור ירוק — מותר לחלוטין 🟢'
                    : (isPhase1 ? selectedItem.statusPhase1 : selectedItem.statusPhase2) === 'YELLOW'
                    ? 'אור צהוב — מוגבל / שלב 2 🟡'
                    : 'אור אדום — אסור בתכלית 🔴'}
                </span>
                <h3 className="text-2xl font-bold text-stone-900">{selectedItem.nameHe}</h3>
                <p className="text-sm text-stone-500">{selectedItem.nameEn}</p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">כמות בטוחה:</span>
                  <span className="font-bold text-stone-800">{selectedItem.safePortionHe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">קבוצת FODMAP:</span>
                  <span className="font-bold text-stone-800">{selectedItem.fodmapGroup}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  הערות רפואיות:
                </span>
                <p className="text-stone-700 leading-relaxed bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
                  {selectedItem.notesHe}
                </p>
              </div>

              {selectedItem.alternativesHe && selectedItem.alternativesHe.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    חלופות מומלצות לניר:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.alternativesHe.map((alt, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-medium"
                      >
                        ✓ {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const foodName = selectedItem.nameHe;
                  setSelectedItem(null);
                  onSelectFoodForAnalysis(foodName);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                סרוק ונתח לעומק ברמזור 🚦
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
