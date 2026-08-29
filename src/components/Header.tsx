import React from 'react';
import { SiboPhase } from '../types';
import { Activity, ShieldAlert, Sparkles, HelpCircle, Heart, Smartphone } from 'lucide-react';

interface HeaderProps {
  currentPhase: SiboPhase;
  onPhaseChange: (phase: SiboPhase) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenHelp: () => void;
  onOpenInstallShare: () => void;
  onOpenHungerWizard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  onPhaseChange,
  activeTab,
  onTabChange,
  onOpenHelp,
  onOpenInstallShare,
  onOpenHungerWizard,
}) => {
  const isPhase1 = currentPhase === 'phase1_strict';

  const navTabs = [
    {
      id: 'scanner',
      label: 'סופר וקניות (500+ מוצרים וסריקה) 🛒',
      desc: 'רשימה לשליחה וסריקה עצמית',
      activeColor: 'bg-emerald-800 text-white shadow-sm font-black',
      inactiveColor: 'bg-stone-100 text-stone-800 hover:bg-stone-200 font-bold border border-stone-200',
    },
    {
      id: 'recipe',
      label: 'מתכונים וארוחות (60+) 🍲',
      desc: 'ספר שף דלה פופו המלא',
      activeColor: 'bg-emerald-800 text-white shadow-sm font-black',
      inactiveColor: 'bg-stone-100 text-stone-800 hover:bg-stone-200 font-bold border border-stone-200',
    },
    {
      id: 'database',
      label: 'מאגר מזונות וייעוץ 🥦',
      desc: 'חיפוש מותר/אסור ושאלות מומחה',
      activeColor: 'bg-emerald-800 text-white shadow-sm font-black',
      inactiveColor: 'bg-stone-100 text-stone-800 hover:bg-stone-200 font-bold border border-stone-200',
    },
    {
      id: 'diary',
      label: 'יומן תזונה 📔',
      desc: 'מעקב אישי לניר',
      activeColor: 'bg-emerald-800 text-white shadow-sm font-black',
      inactiveColor: 'bg-stone-100 text-stone-800 hover:bg-stone-200 font-bold border border-stone-200',
    },
  ];

  return (
    <header id="sibo-header" className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Logo & Big Title */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="SIBO Safe for Nir"
                className="w-12 h-12 rounded-2xl object-cover shadow-md ring-2 ring-emerald-800/10 shrink-0 border border-stone-200"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                    סורק רמזור מזון לסיבו (SIBO) לגורגורילה
                  </h1>
                </div>
                <p className="text-xs text-stone-500 font-medium">סורק מזון רפואי, תפריטים מותאמים ומדריך תזונה קליני לניר</p>
              </div>
            </div>

            {/* Mobile buttons */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={onOpenHungerWizard}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm cursor-pointer"
                title="אשף אני רעבה! מה לאכול עכשיו?"
              >
                <span>🥑 אני רעבה!</span>
              </button>
              <button
                onClick={onOpenInstallShare}
                className="p-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                title="התקנה בטלפון ושיתוף"
              >
                <Smartphone className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenHelp}
                className="p-2 text-stone-500 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                title="מידע על SIBO"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SIBO Phase Selector & Principles & Share */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
            {/* Desktop Glowing SOS Button */}
            <button
              id="desktop-hunger-sos-btn"
              type="button"
              onClick={onOpenHungerWizard}
              className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              title="אשף שובע מהיר — אני רעבה! מה לאכול עכשיו?"
            >
              <span className="text-sm">🥑</span>
              <span>אני רעבה!!! (מה לאכול?) ✨</span>
            </button>
            <button
              id="install-share-btn"
              type="button"
              onClick={onOpenInstallShare}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 px-3 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-stone-600" />
              <span>התקנה בטלפון ושיתוף 📲</span>
            </button>

            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-medium">
              <button
                id="select-phase1-btn"
                type="button"
                onClick={() => onPhaseChange('phase1_strict')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isPhase1
                    ? 'bg-amber-600 text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>שלב 1: קפדני (הרעבה)</span>
              </button>
              <button
                id="select-phase2-btn"
                type="button"
                onClick={() => onPhaseChange('phase2_moderate')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  !isPhase1
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>שלב 2: שילוב מחדש</span>
              </button>
            </div>

            <button
              id="desktop-help-btn"
              onClick={onOpenHelp}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-emerald-700 bg-stone-50 hover:bg-emerald-50 border border-stone-200 px-3 py-2 rounded-xl transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>עקרונות הדיאטה</span>
            </button>
          </div>
        </div>

        {/* Phase Status Banner Note */}
        <div
          className={`mt-2.5 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
            isPhase1
              ? 'bg-amber-50 text-amber-900 border border-amber-200/80'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPhase1 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span>
              {isPhase1
                ? 'מוגדר כרגע: שלב 1 קפדני — הרעבת חיידקי המעי הדק (הימנעות מכל סוגי הסוכרים, פרוקטנים, לקטוז, עמילנים ופוליאולים)'
                : 'מוגדר כרגע: שלב 2 — שילוב הדרגתי מבוקר (מתיר מנות קטנות ומדודות של אורז, תפו״א ופירות נוספים)'}
            </span>
          </div>
          <span className="text-[11px] opacity-75 hidden md:inline">מבוסס פרוטוקול Siebecker & Jacobi</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-amber-50/50 border-t border-stone-200 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-2 min-w-max">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? tab.activeColor
                    : tab.inactiveColor
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
