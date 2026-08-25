import React, { useState } from 'react';
import { FoodAnalysisResult, TrafficLightStatus } from '../types';
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
} from 'lucide-react';

interface TrafficLightResultProps {
  result: FoodAnalysisResult;
  onReset: () => void;
  onSaveToDiary: (result: FoodAnalysisResult) => void;
  onExploreAlternative: (query: string) => void;
  onScanBarcode?: () => void;
  isSaved?: boolean;
  isModal?: boolean;
}

export const TrafficLightResult: React.FC<TrafficLightResultProps> = ({
  result,
  onReset,
  onSaveToDiary,
  onExploreAlternative,
  onScanBarcode,
  isSaved = false,
  isModal = true,
}) => {
  const [showPackagedPrompt, setShowPackagedPrompt] = useState<boolean>(
    Boolean(result.isPackagedProduct)
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
      title: 'אור אדום — אסור בתכלית לניר! 🔴',
      subtitle: 'מאכל עתיר תסיסה (FODMAP גבוה / עמילן מרוכז). מזין את חיידקי ה-SIBO!',
      color: 'text-rose-700',
      bgBadge: 'bg-rose-100 text-rose-800 border-rose-300',
      borderCol: 'border-rose-500',
      glowColor: 'shadow-[0_0_40px_rgba(244,63,94,0.35)] ring-4 ring-rose-500/30',
      bannerBg: 'bg-gradient-to-l from-rose-600 via-rose-700 to-red-800 text-white',
      icon: XCircle,
    },
  };

  const currentCfg = statusConfig[result.status] || statusConfig.YELLOW;

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
            className="px-3.5 py-1.5 rounded-full bg-stone-900/75 hover:bg-stone-900 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="ריענון וסריקת מוצר נוסף"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>🔄 סרוק מוצר נוסף / ריענון</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-8 h-8 rounded-full bg-stone-900/75 hover:bg-stone-900 text-white flex items-center justify-center font-bold text-sm backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer active:scale-95"
            title="סגור חלון"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Banner with Big Traffic Light Graphic */}
        <div className={`${currentCfg.bannerBg} pt-14 pb-6 px-6 sm:px-8 text-center relative overflow-hidden`}>
          {/* Subtle radial glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
            {/* Realistic Traffic Light Graphic Unit */}
            <div className="flex items-center gap-3 bg-stone-950/85 p-2 sm:p-2.5 rounded-full border border-stone-700 shadow-inner">
              {/* Red Light */}
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  result.status === 'RED'
                    ? 'bg-rose-500 shadow-[0_0_24px_#f43f5e] ring-3 ring-rose-400 animate-pulse text-white font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="אדום - אסור"
              >
                {result.status === 'RED' && <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>

              {/* Yellow Light */}
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  result.status === 'YELLOW'
                    ? 'bg-yellow-300 shadow-[0_0_24px_#fde047] ring-3 ring-yellow-400 animate-pulse text-yellow-950 font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="צהוב - מוגבל"
              >
                {result.status === 'YELLOW' && <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-950" />}
              </div>

              {/* Green Light */}
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  result.status === 'GREEN'
                    ? 'bg-emerald-400 shadow-[0_0_24px_#34d399] ring-3 ring-emerald-300 animate-pulse text-white font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="ירוק - מותר"
              >
                {result.status === 'GREEN' && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
            </div>

            {/* Verdict text */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-xs">
                {currentCfg.title}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-white/90 max-w-xl mx-auto">
                {result.shortVerdict}
              </p>
            </div>
          </div>
        </div>

        {/* Content Details Body */}
        <div className="p-5 sm:p-7 space-y-5 divide-y divide-stone-100 max-h-[60vh] overflow-y-auto">
          {/* Packaged Product Barcode Recommendation Banner */}
          {result.isPackagedProduct && showPackagedPrompt && (
            <div className="pb-2">
              <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <span>💡 זוהה כמוצר ארוז / מסחרי</span>
                    </h4>
                    <p className="text-xs text-indigo-800/90 mt-0.5 leading-relaxed">
                      כדי לוודא שאין רכיבים מתסיסים סמויים (כמו אינולין, אבקת שום/בצל או עמילן מוסף), <strong>מומלץ ביותר לסרוק את הברקוד 🏷️</strong> לקבלת דיוק של 100%!
                    </p>
                  </div>
                </div>
                {onScanBarcode && (
                  <button
                    id="btn-scan-barcode-from-result"
                    type="button"
                    onClick={onScanBarcode}
                    className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Barcode className="w-4 h-4" />
                    <span>סרוק ברקוד 🏷️</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Info Row: Food Name, Safe Portion */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900">{result.foodName}</h3>
                {result.englishName && (
                  <span className="text-xs text-stone-400 font-normal">({result.englishName})</span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">זיהוי וניתוח מבוסס פרוטוקול SIBO קליני</p>
            </div>

            {/* Max Safe Portion Badge */}
            <div className="bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-stone-400 block uppercase tracking-wider">
                  כמות בטוחה מומלצת
                </span>
                <span className="text-sm font-bold text-stone-800">{result.maxSafePortion}</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* FODMAP & Fermentation Triggers */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>רכיבי תסיסה ו-FODMAP שזוהו:</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.fodmapTriggers.length > 0 ? (
                result.fodmapTriggers.map((trig, idx) => (
                  <span
                    key={idx}
                    className={`text-xs font-semibold px-3 py-1 rounded-lg border ${
                      result.status === 'GREEN'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : result.status === 'YELLOW'
                        ? 'bg-yellow-50 text-yellow-950 border-yellow-300'
                        : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                  >
                    {trig}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  ללא טריגרים מתסיסים ידועים (דל FODMAP לחלוטין)
                </span>
              )}
            </div>
          </div>

          {/* Detailed Medical / Biochemical Explanation */}
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>הסבר רפואי וביוכימי:</span>
            </h4>
            <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 text-stone-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {result.detailedExplanation}
            </div>
          </div>

          {/* Multi-Ingredient breakdown if composite meal */}
          {result.ingredientsBreakdown && result.ingredientsBreakdown.length > 0 && (
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                פירוק רכיבי המנה לפי בטיחות SIBO:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.ingredientsBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                      item.status === 'GREEN'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : item.status === 'YELLOW'
                        ? 'bg-yellow-50/70 border-yellow-300 text-yellow-950'
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
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
          {result.safeSubstitutions && result.safeSubstitutions.length > 0 && (
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                <span>חלופות טעימות ומותרות שמתאימות לניר:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.safeSubstitutions.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onExploreAlternative(sub);
                    }}
                    className="text-right p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 text-xs font-medium transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>{sub}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Culinary & Cooking Tips */}
          {result.cookingTips && result.cookingTips.length > 0 && (
            <div className="pt-4 space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                טיפים להכנה והקלה על העיכול של ניר:
              </h4>
              <ul className="space-y-1.5">
                {result.cookingTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-stone-700 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical References Footnote */}
          {result.medicalReferences && result.medicalReferences.length > 0 && (
            <div className="pt-4 text-[11px] text-stone-400 flex items-center gap-2">
              <span className="font-semibold">מקורות רפואיים:</span>
              <span>{result.medicalReferences.join(' | ')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer with Big Refresh / Rescan Button */}
        <div className="bg-stone-50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-stone-200">
          <button
            id="btn-scan-another-food"
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-stone-800 hover:to-stone-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 ring-2 ring-stone-400/20"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>🔄 סרוק מוצר נוסף (ריענון וסגירה) 📸</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onScanBarcode && (
              <button
                type="button"
                onClick={onScanBarcode}
                className="flex-1 sm:flex-initial px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Barcode className="w-4 h-4" />
                <span>סרוק ברקוד 🏷️</span>
              </button>
            )}

            <button
              id="btn-save-to-sibo-diary"
              type="button"
              onClick={() => onSaveToDiary(result)}
              disabled={isSaved}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 cursor-default'
                  : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
              }`}
            >
              <BookmarkPlus className="w-4 h-4 text-emerald-600" />
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
