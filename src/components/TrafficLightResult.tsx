import React from 'react';
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
} from 'lucide-react';

interface TrafficLightResultProps {
  result: FoodAnalysisResult;
  onReset: () => void;
  onSaveToDiary: (result: FoodAnalysisResult) => void;
  onExploreAlternative: (query: string) => void;
  isSaved?: boolean;
}

export const TrafficLightResult: React.FC<TrafficLightResultProps> = ({
  result,
  onReset,
  onSaveToDiary,
  onExploreAlternative,
  isSaved = false,
}) => {
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
      bgBadge: 'bg-rose-100 text-rose-900 border-rose-300',
      borderCol: 'border-rose-500',
      glowColor: 'shadow-[0_0_40px_rgba(244,63,94,0.4)] ring-4 ring-rose-500/30',
      bannerBg: 'bg-gradient-to-l from-rose-600 via-red-700 to-rose-900 text-white',
      icon: XCircle,
    },
  };

  const currentCfg = statusConfig[result.status] || statusConfig.YELLOW;
  const StatusIcon = currentCfg.icon;

  return (
    <div id="traffic-light-result-card" className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Visual Traffic Light Display Box */}
      <div className={`rounded-3xl overflow-hidden shadow-lg border-2 ${currentCfg.borderCol} bg-white`}>
        {/* Top Banner with Big Traffic Light Bulb Graphic */}
        <div className={`${currentCfg.bannerBg} p-6 sm:p-8 text-center relative overflow-hidden`}>
          {/* Background subtle radial glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            {/* Realistic Traffic Light Graphic Unit */}
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
                    ? 'bg-yellow-400 shadow-[0_0_24px_#facc15] ring-4 ring-yellow-300 animate-pulse text-stone-950 font-black'
                    : 'bg-stone-800/80 opacity-40'
                }`}
                title="צהוב - מוגבל"
              >
                {result.status === 'YELLOW' && <AlertTriangle className="w-6 h-6" />}
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
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
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
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        item.status === 'GREEN'
                          ? 'bg-emerald-200 text-emerald-900'
                          : item.status === 'YELLOW'
                          ? 'bg-amber-200 text-amber-900'
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
                    className="text-right p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 text-xs font-medium transition-colors flex items-center justify-between group"
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

        {/* Action Buttons Bar */}
        <div className="bg-stone-50 p-4 sm:p-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="reset-scan-btn"
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>סריקת מאכל נוסף 📸</span>
          </button>

          <button
            id="save-to-diary-btn"
            onClick={() => onSaveToDiary(result)}
            disabled={isSaved}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>{isSaved ? 'נשמר ביומן של ניר ✓' : 'הוסף ליומן הארוחות של ניר'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
