import React, { useState, useMemo } from 'react';
import { FoodAnalysisResult, TrafficLightStatus } from '../types';
import { findMatchingRecipes, SiboRecipe } from '../data/siboMealSuggestions';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  BookOpen,
  ChefHat,
  BookmarkPlus,
  ArrowRight,
  ShieldCheck,
  Camera,
  Barcode,
  RotateCcw,
  X,
  Search,
  Clock,
} from 'lucide-react';

interface TrafficLightResultProps {
  result: FoodAnalysisResult;
  onReset: () => void;
  onSaveToDiary: (result: FoodAnalysisResult) => void;
  onExploreAlternative: (query: string) => void;
  onScanBarcode?: () => void;
  onOpenRecipe?: (recipeIdOrQuery: string) => void;
  isSaved?: boolean;
  isModal?: boolean;
}

export const TrafficLightResult: React.FC<TrafficLightResultProps> = ({
  result,
  onReset,
  onSaveToDiary,
  onExploreAlternative,
  onScanBarcode,
  onOpenRecipe,
  isSaved = false,
  isModal = true,
}) => {
  const [showPackagedPrompt, setShowPackagedPrompt] = useState<boolean>(
    Boolean(result.isPackagedProduct)
  );

  const isUnidentified = Boolean(
    result.isPackagedProduct ||
    result.foodName?.includes('לא מזוהה') ||
    result.foodName?.includes('לא ברור') ||
    result.foodName?.includes('לא ברורה') ||
    result.foodName?.includes('לא ידוע') ||
    result.foodName?.includes('לא ניתן לזהות') ||
    result.foodName?.includes('מטושטש') ||
    result.foodName?.includes('מוצר ארוז') ||
    result.foodName?.includes('משקה לא מזוהה') ||
    result.foodName?.includes('מוצר מסחרי שטרם זוהה') ||
    result.shortVerdict?.includes('מוצר לא מזוהה') ||
    result.detailedExplanation?.includes('מוצר לא מזוהה') ||
    result.foodName?.toLowerCase().includes('unidentified') ||
    result.foodName?.toLowerCase().includes('unknown')
  );

  const statusConfig: Record<
    TrafficLightStatus,
    {
      title: string;
      color: string;
      bgBadge: string;
      borderCol: string;
      glowColor: string;
      bannerBg: string;
      icon: React.ComponentType<{ className?: string }>;
      subtitle: string;
    }
  > = {
    GREEN: {
      title: 'אור ירוק — מותר ובטוח לניר! 🟢',
      subtitle: 'מאכל דל תסיסה, 0 או כמעט 0 FODMAPs. בטוח לחלוטין.',
      color: 'text-emerald-700',
      bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      borderCol: 'border-emerald-500',
      glowColor: 'shadow-[0_0_40px_rgba(16,185,129,0.35)] ring-4 ring-emerald-500/30',
      bannerBg: 'bg-gradient-to-l from-emerald-600 via-emerald-700 to-teal-800 text-white',
      icon: CheckCircle2,
    },
    YELLOW: {
      title: 'אור צהוב — כמות מוגבלת / שלב 2 בלבד 🟡',
      subtitle: 'מותר אך ורק בכמות מדודה וקטנה, או מיועד לשלב שילוב מחדש.',
      color: 'text-yellow-800',
      bgBadge: 'bg-yellow-300 text-yellow-950 border-yellow-400 font-bold',
      borderCol: 'border-yellow-400',
      glowColor: 'shadow-[0_0_40px_rgba(250,204,21,0.5)] ring-4 ring-yellow-400/40',
      bannerBg: 'bg-gradient-to-l from-yellow-500 via-amber-400 to-yellow-500 text-stone-950',
      icon: AlertTriangle,
    },
    RED: {
      title: isUnidentified ? 'מוצר לא מזוהה 🔍' : 'אור אדום — אסור בתכלית לניר! 🔴',
      subtitle: isUnidentified
        ? 'בדיקה משלימה לשמירה על בטיחות ניר (סריקה חוזרת או הקלדה)'
        : 'מאכל עתיר תסיסה (FODMAP גבוה / עמילן מרוכז). מזין את חיידקי ה-SIBO!',
      color: isUnidentified ? 'text-rose-900' : 'text-rose-700',
      bgBadge: isUnidentified ? 'bg-gradient-to-r from-rose-100 to-amber-100 text-rose-950 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300',
      borderCol: isUnidentified ? 'border-amber-400' : 'border-rose-500',
      glowColor: isUnidentified ? 'shadow-[0_0_40px_rgba(245,158,11,0.35)] ring-4 ring-amber-400/30' : 'shadow-[0_0_40px_rgba(244,63,94,0.35)] ring-4 ring-rose-500/30',
      bannerBg: isUnidentified
        ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-white'
        : 'bg-gradient-to-l from-rose-600 via-rose-700 to-red-800 text-white',
      icon: isUnidentified ? Search : XCircle,
    },
  };

  const currentCfg = isUnidentified ? statusConfig.RED : (statusConfig[result.status] || statusConfig.YELLOW);

  const matchingRecipes = useMemo(() => {
    const combinedText = `${result.foodName || ''} ${result.shortVerdict || ''} ${result.detailedExplanation || ''} ${(result.safeSubstitutions || []).join(' ')}`;
    return findMatchingRecipes(combinedText, 3);
  }, [result]);

  const content = (
    <div
      id="traffic-light-result-card"
      className="w-full max-w-3xl mx-auto space-y-4 animate-scaleIn relative"
    >
      {/* Visual Traffic Light Display Box */}
      <div className={`rounded-3xl overflow-hidden shadow-2xl border-2 ${currentCfg.borderCol} bg-white relative`}>
        {/* Modal Top Control Bar (Close & Fast Refresh) */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-30 pointer-events-auto">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-xs sm:text-sm font-black backdrop-blur-md border border-white/30 shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            title="ריענון וסריקת מוצר נוסף"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>🔄 סרוק מוצר נוסף / ריענון</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center font-black text-base backdrop-blur-md border border-white/30 shadow-md transition-all cursor-pointer active:scale-95"
            title="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Banner with Big Traffic Light Graphic */}
        <div className={`${currentCfg.bannerBg} pt-16 pb-7 px-6 sm:px-8 text-center relative overflow-hidden`}>
          {/* Subtle radial glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            {/* Realistic Traffic Light Graphic Unit */}
            <div className="flex items-center gap-3.5 bg-stone-950/85 p-2.5 sm:p-3 rounded-full border border-stone-700 shadow-inner">
              {/* Red / Coral Light */}
              <div
                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isUnidentified
                    ? 'bg-rose-400 shadow-[0_0_24px_#fb7185] ring-4 ring-rose-300/80 animate-pulse text-white font-black'
                    : result.status === 'RED'
                    ? 'bg-rose-500 shadow-[0_0_28px_#f43f5e] ring-4 ring-rose-400 animate-pulse text-white font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title={isUnidentified ? 'אדום עדין - דורש זיהוי' : 'אדום - אסור'}
              >
                {isUnidentified ? <Search className="w-5 h-5 sm:w-6 sm:h-6" /> : result.status === 'RED' && <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />}
              </div>

              {/* Yellow / Amber Light */}
              <div
                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isUnidentified
                    ? 'bg-amber-400 shadow-[0_0_24px_#fbbf24] ring-4 ring-amber-300/80 animate-pulse text-stone-950 font-black'
                    : result.status === 'YELLOW'
                    ? 'bg-yellow-300 shadow-[0_0_28px_#fde047] ring-4 ring-yellow-400 animate-pulse text-yellow-950 font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title={isUnidentified ? 'ענבר - דורש בדיקה' : 'צהוב - מוגבל'}
              >
                {isUnidentified ? <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-stone-950" /> : result.status === 'YELLOW' && <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-950" />}
              </div>

              {/* Green Light */}
              <div
                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  result.status === 'GREEN'
                    ? 'bg-emerald-400 shadow-[0_0_28px_#34d399] ring-4 ring-emerald-300 animate-pulse text-white font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="ירוק - מותר"
              >
                {result.status === 'GREEN' && <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />}
              </div>
            </div>

            {/* Verdict text - Large & Bold */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
                {currentCfg.title}
              </h2>
              <p className="text-sm sm:text-base font-bold text-white/95 max-w-xl mx-auto leading-relaxed">
                {result.shortVerdict}
              </p>
            </div>

            {/* Direct High-Visibility Barcode / Label Scanner Button at the VERY TOP */}
            {onScanBarcode && (
              <div className="w-full max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={onScanBarcode}
                  className="w-full py-3.5 px-5 bg-white hover:bg-stone-50 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-2xl border-2 border-white/90 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 ring-4 ring-black/25"
                >
                  <Barcode className="w-5 h-5 text-indigo-600" />
                  <span>📸 סריקת ברקוד / רכיבים חדשה</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Details Body with Large Clear Typography */}
        <div className="p-6 sm:p-8 space-y-6 divide-y divide-stone-100 max-h-[62vh] overflow-y-auto">

          {/* Unidentified Packaged Product - Soft Rose & Amber Sunset Card for Nir */}
          {isUnidentified && (
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50/80 text-stone-900 shadow-xl border-2 border-rose-300/80 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 text-2xl font-black shadow-md ring-4 ring-rose-200">
                  🔍
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg sm:text-xl font-black text-rose-950 flex items-center gap-2">
                    <span>מוצר לא מזוהה</span>
                  </h4>
                  <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium">
                    אם מדובר במוצר ארוז, סרקי שוב את הברקוד או את רשימת הרכיבים, אם מדובר במשהו שהכנת לבד או הוכן במסעדה, אנא הקלידי במה מדובר.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Instant Resolution */}
              <div className="space-y-2.5 pt-1">
                {onScanBarcode && (
                  <button
                    type="button"
                    onClick={onScanBarcode}
                    className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95 ring-4 ring-amber-300/50"
                  >
                    <Barcode className="w-6 h-6 text-white" />
                    <span>📸 סרקי שוב את הברקוד או את רשימת הרכיבים</span>
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onReset}
                    className="py-3.5 px-4 bg-white hover:bg-amber-50 text-stone-900 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Search className="w-4 h-4 text-amber-600" />
                    <span>✏️ הקלידי במה מדובר (מנה ביתית / מסעדה)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onExploreAlternative('קפה שחור')}
                    className="py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>☕ זה קפה שחור? לחצי כאן</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Product / Food Header Card - Giant & High Visibility */}
          <div className="p-5 sm:p-6 rounded-3xl bg-stone-50 border-2 border-stone-300 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full bg-stone-900 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
                <span>🏷️ שם המאכל / המוצר שנבדק:</span>
              </span>
              {result.barcode && (
                <span className="px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold text-xs">
                  ברקוד: {result.barcode}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-4xl font-black text-stone-950 leading-tight">
                  {result.foodName}
                </h3>
                {result.englishName && (
                  <span className="text-sm text-stone-500 font-bold block mt-1">({result.englishName})</span>
                )}
              </div>

              {/* Max Safe Portion Badge */}
              <div className="bg-white border-2 border-emerald-400 px-5 py-3 rounded-2xl flex items-center gap-3.5 shrink-0 shadow-sm">
                <div className="text-right">
                  <span className="text-[11px] font-black text-emerald-800 block uppercase tracking-wider">
                    כמות בטוחה מומלצת
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-950">{result.maxSafePortion}</span>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              </div>
            </div>
          </div>

          {/* Quick Action Button to Open Barcode Scanner */}
          {onScanBarcode && (
            <div className="pt-2">
              <button
                id="btn-scan-barcode-action"
                type="button"
                onClick={onScanBarcode}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-600 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-indigo-400/30"
              >
                <Barcode className="w-5 h-5 text-indigo-200" />
                <span>🏷️ סרוק ברקוד באריזה (קריאת רכיבים 100% מדויקת) 📸</span>
              </button>
            </div>
          )}

          {/* FODMAP & Fermentation Triggers - Large Badges */}
          <div className="pt-5 space-y-2.5">
            <h4 className="text-sm sm:text-base font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>רכיבי תסיסה ו-FODMAP שזוהו:</span>
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {(result.fodmapTriggers || []).length > 0 ? (
                (result.fodmapTriggers || []).map((trig, idx) => (
                  <span
                    key={idx}
                    className={`text-sm sm:text-base font-extrabold px-4 py-2 rounded-xl border ${
                      result.status === 'GREEN'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : result.status === 'YELLOW'
                        ? 'bg-yellow-100 text-yellow-950 border-yellow-400 shadow-xs'
                        : 'bg-rose-50 text-rose-950 border-rose-300'
                    }`}
                  >
                    {trig}
                  </span>
                ))
              ) : (
                <span className="text-sm text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl">
                  ללא טריגרים מתסיסים ידועים (דל FODMAP לחלוטין)
                </span>
              )}
            </div>
          </div>

          {/* Detailed Medical / Biochemical Explanation - Highly Readable */}
          <div className="pt-5 space-y-2.5">
            <h4 className="text-sm sm:text-base font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>הסבר רפואי וביוכימי:</span>
            </h4>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 text-stone-900 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium shadow-inner">
              {result.detailedExplanation || result.shortVerdict || 'נבדק על פי כללי פרוטוקול SIBO הקליני.'}
            </div>
          </div>

          {/* Multi-Ingredient breakdown if composite meal */}
          {(result.ingredientsBreakdown || []).length > 0 && (
            <div className="pt-5 space-y-3">
              <h4 className="text-sm sm:text-base font-black text-stone-800 uppercase tracking-wider">
                פירוק רכיבי המנה לפי בטיחות SIBO:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(result.ingredientsBreakdown || []).map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-bold ${
                      item.status === 'GREEN'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : item.status === 'YELLOW'
                        ? 'bg-yellow-50/80 border-yellow-300 text-yellow-950'
                        : 'bg-rose-50/80 border-rose-200 text-rose-950'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                        item.status === 'GREEN'
                          ? 'bg-emerald-200 text-emerald-900'
                          : item.status === 'YELLOW'
                          ? 'bg-yellow-300 text-yellow-950 font-bold'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {item.status === 'GREEN' ? 'מותר 🟢' : item.status === 'YELLOW' ? 'מוגבל 🟡' : 'אסור 🔴'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safe Substitutions for Nir (חלופות בטוחות ומותרות) */}
          {(result.safeSubstitutions || []).length > 0 && (
            <div className="pt-5 space-y-3">
              <h4 className="text-sm sm:text-base font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-600" />
                <span>חלופות טעימות ומותרות שמתאימות לניר:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(result.safeSubstitutions || []).map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onExploreAlternative(sub);
                    }}
                    className="text-right p-3.5 sm:p-4 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                  >
                    <span>{sub}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIBO Tailored Recipes Banner & Direct Cards */}
          {matchingRecipes.length > 0 && (
            <div className="pt-5 space-y-3">
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white border-2 border-emerald-400 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-base sm:text-lg font-black tracking-tight">
                      מתכונים בהמלצת שֵׁף דַּלָּה פּוּפוּ 🍲
                    </h4>
                  </div>
                  {onOpenRecipe && (
                    <button
                      type="button"
                      onClick={() => onOpenRecipe(result.foodName)}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                    >
                      <span>ספר המתכונים של שֵׁף דַּלָּה פּוּפוּ 📖</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-emerald-200">
                  הנה מתכונים ביתיים מוכנים לניר בהמלצת שֵׁף דַּלָּה פּוּפוּ עם המרכיבים המדויקים, ללא בצל, ללא שום ו-0% תסיסה:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {matchingRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => onOpenRecipe && onOpenRecipe(`id:${recipe.id}`)}
                      className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-emerald-400/40 text-right backdrop-blur-md transition-all cursor-pointer group flex flex-col justify-between space-y-2 hover:border-emerald-300 hover:scale-[1.02] active:scale-95 shadow-inner"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                            ⭐ שֵׁף דַּלָּה פּוּפוּ • {recipe.tag}
                          </span>
                          <span className="text-emerald-300/80 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {recipe.prepTime}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                          {recipe.title}
                        </h5>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300">
                        <span>צפי במתכון של שֵׁף דַּלָּה פּוּפוּ</span>
                        <span className="bg-emerald-400 text-stone-950 w-5 h-5 rounded-full flex items-center justify-center text-[10px] group-hover:translate-x-[-2px] transition-all">
                          ←
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Culinary & Cooking Tips */}
          {(result.cookingTips || []).length > 0 && (
            <div className="pt-5 space-y-2.5">
              <h4 className="text-sm sm:text-base font-black text-stone-800 uppercase tracking-wider">
                טיפים להכנה והקלה על העיכול של ניר:
              </h4>
              <ul className="space-y-2">
                {(result.cookingTips || []).map((tip, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-stone-800 flex items-start gap-2.5 font-medium">
                    <span className="text-emerald-600 font-black text-base leading-none">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical References Footnote */}
          {(result.medicalReferences || []).length > 0 && (
            <div className="pt-4 text-xs text-stone-400 flex items-center gap-2">
              <span className="font-bold">מקורות רפואיים:</span>
              <span>{(result.medicalReferences || []).join(' | ')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer with Big Refresh / Rescan Button */}
        <div className="bg-stone-50 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200">
          <button
            id="btn-scan-another-food"
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 hover:from-stone-900 hover:to-stone-800 text-white rounded-2xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer active:scale-95 ring-2 ring-stone-400/20"
          >
            <RotateCcw className="w-5 h-5 text-emerald-400" />
            <span>🔄 סרוק מוצר נוסף (ריענון וסגירה) 📸</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onScanBarcode && (
              <button
                type="button"
                onClick={onScanBarcode}
                className="flex-1 sm:flex-initial px-5 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-2 border-indigo-300 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Barcode className="w-5 h-5" />
                <span>סרוק ברקוד 🏷️</span>
              </button>
            )}

            <button
              id="btn-save-to-sibo-diary"
              type="button"
              onClick={() => onSaveToDiary(result)}
              disabled={isSaved}
              className={`flex-1 sm:flex-initial px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 border shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400 cursor-default'
                  : 'bg-white hover:bg-stone-100 text-stone-900 border-stone-300'
              }`}
            >
              <BookmarkPlus className="w-5 h-5 text-emerald-600" />
              <span>{isSaved ? 'נשמר ביומן! ✓' : 'שמור ביומן מעקב'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
        {content}
      </div>
    );
  }

  return content;
};
