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
} from 'lucide-react';

interface TrafficLightResultProps {
  result: FoodAnalysisResult;
  onReset: () => void;
  onSaveToDiary: (result: FoodAnalysisResult) => void;
  onExploreAlternative: (query: string) => void;
  onScanBarcode?: () => void;
  isSaved?: boolean;
}

export const TrafficLightResult: React.FC<TrafficLightResultProps> = ({
  result,
  onReset,
  onSaveToDiary,
  onExploreAlternative,
  onScanBarcode,
  isSaved = false,
}) => {
  const [showPackagedModal, setShowPackagedModal] = useState<boolean>(
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

  return (
    <div id="traffic-light-result-card" className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Packaged Product Barcode Recommendation Pop-up Modal */}
      {showPackagedModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-indigo-400 space-y-5 text-center relative">
            <button
              type="button"
              onClick={() => setShowPackagedModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              title="סגור חלון"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner ring-4 ring-indigo-50">
              <Barcode className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-stone-900 leading-snug">
                💡 זיהינו שמדובר במוצר ארוז / מסחרי!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
                כדי לוודא שאין רכיבים מתסיסים סמויים (כמו אינולין, אבקת שום/בצל או עמילן מוסף), <strong>מומלץ ביותר לסרוק את הברקוד 🏷️</strong> או לצלם את טבלת הרכיבים בגב האריזה לקבלת דיוק של 100%!
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {onScanBarcode && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPackagedModal(false);
                    onScanBarcode();
                  }}
                  className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-indigo-300"
                >
                  <Barcode className="w-5 h-5" />
                  <span>סרוק ברקוד של המוצר עכשיו 🏷️</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPackagedModal(false)}
                className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                המשך לתוצאות הנוכחיות ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Traffic Light Display Box */}
      <div className={`rounded-3xl overflow-hidden shadow-lg border-2 ${currentCfg.borderCol} bg-white`}>
        {/* Top Banner with Big Traffic Light Graphic */}
        <div className={`${currentCfg.bannerBg} p-6 sm:p-8 text-center relative overflow-hidden`}>
          {/* Subtle glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            {/* Realistic Traffic Light Unit */}
            <div className="flex items-center gap-3 bg-stone-950/80 p-2.5 sm:p-3 rounded-full border border-stone-800 shadow-inner">
              {/* Red Light */}
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  result.status === 'RED'
                    ? 'bg-rose-500 shadow-[0_0_24px_#f43f5e] ring-3 ring-rose-400 animate-pulse text-white font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="אדום - אסור"
              >
                {result.status === 'RED' && <XCircle className="w-6 h-6" />}
              </div>

              {/* Yellow Light */}
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  result.status === 'YELLOW'
                    ? 'bg-yellow-300 shadow-[0_0_24px_#fde047] ring-4 ring-yellow-400 animate-pulse text-yellow-950 font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="צהוב - מוגבל"
              >
                {result.status === 'YELLOW' && <AlertTriangle className="w-6 h-6 text-yellow-950" />}
              </div>

              {/* Green Light */}
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  result.status === 'GREEN'
                    ? 'bg-emerald-400 shadow-[0_0_24px_#34d399] ring-3 ring-emerald-300 animate-pulse text-white font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="ירוק - מותר"
              >
                {result.status === 'GREEN' && <CheckCircle2 className="w-6 h-6" />}
              </div>
            </div>

            {/* Verdict text */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-xs">
                {currentCfg.title}
              </h2>
              <p className="text-sm sm:text-base font-medium text-white/90 max-w-xl mx-auto">
                {result.shortVerdict}
              </p>
            </div>
          </div>
        </div>

        {/* Content Details Body */}
        <div className="p-6 sm:p-8 space-y-6 divide-y divide-stone-100">
          {/* In-page Barcode Suggestion Banner if Packaged Product */}
          {result.isPackagedProduct && (
            <div className="pb-2">
              <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <span>💡 זוהה כמוצר ארוז / מסחרי</span>
                    </h4>
                    <p className="text-xs text-indigo-800/90 mt-0.5 leading-relaxed">
                      כדי לוודא שאין רכיבים מתסיסים סמויים (כמו אינולין, אבקת שום/בצל או עמילן מוסף), <strong>מומלץ ביותר לסרוק את הברקוד 🏷️</strong> או לצלם את טבלת הרכיבים בגב האריזה לקבלת דיוק של 100%!
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
                    <span>סרוק ברקוד של המוצר 🏷️</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Info Row: Food Name, Safe Portion, Image */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-stone-900">{result.foodName}</h3>
                {result.englishName && (
                  <span className="text-sm text-stone-400 font-normal">({result.englishName})</span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">זיהוי וניתוח מבוסס פרוטוקול SIBO קליני</p>
            </div>

            {/* Max Safe Portion Badge */}
            <div className="bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl flex items-center gap-3">
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
          <div className="pt-5 space-y-2">
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
          <div className="pt-5 space-y-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>הסבר רפואי וביוכימי:</span>
            </h4>
            <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 sm:p-5 text-stone-800 text-sm leading-relaxed whitespace-pre-line">
              {result.detailedExplanation}
            </div>
          </div>

          {/* Multi-Ingredient breakdown if composite meal */}
          {result.ingredientsBreakdown && result.ingredientsBreakdown.length > 0 && (
            <div className="pt-5 space-y-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                פירוק רכיבי המנה לפי בטיחות SIBO:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.ingredientsBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
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
            <div className="pt-5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                <span>חלופות טעימות ומותרות שמתאימות לניר:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.safeSubstitutions.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => onExploreAlternative(sub)}
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
            <div className="pt-5 space-y-2">
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
            <div className="pt-5 text-[11px] text-stone-400 flex items-center gap-2">
              <span className="font-semibold">מקורות רפואיים:</span>
              <span>{result.medicalReferences.join(' | ')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-stone-50 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-scan-another-food"
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>סרוק / בדוק מאכל נוסף 📸</span>
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
};
