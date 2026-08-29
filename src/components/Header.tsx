import React from 'react';
import { SiboPhase } from '../types';
import { HelpCircle, Smartphone } from 'lucide-react';

interface HeaderProps {
  currentPhase: SiboPhase;
  onPhaseChange: (phase: SiboPhase) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenHelp: () => void;
  onOpenInstallShare: () => void;
  onOpenHungerWizard: () => void;
  onOpenChefPass?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenHelp,
  onOpenInstallShare,
  onOpenHungerWizard,
  onOpenChefPass,
}) => {
  const navTabs = [
    {
      id: 'scanner',
      label: 'סופר וקניות (500+) 🛒',
      activeColor: 'bg-emerald-800 text-white shadow-xs font-black',
      inactiveColor: 'bg-white text-stone-800 hover:bg-stone-100 font-bold border border-stone-200',
    },
    {
      id: 'recipe',
      label: 'מתכונים וארוחות (180+) 🍲',
      activeColor: 'bg-emerald-800 text-white shadow-xs font-black',
      inactiveColor: 'bg-white text-stone-800 hover:bg-stone-100 font-bold border border-stone-200',
    },
    {
      id: 'database',
      label: 'מאגר מזונות 🥦',
      activeColor: 'bg-emerald-800 text-white shadow-xs font-black',
      inactiveColor: 'bg-white text-stone-800 hover:bg-stone-100 font-bold border border-stone-200',
    },
    {
      id: 'diary',
      label: 'יומן תזונה 📔',
      activeColor: 'bg-emerald-800 text-white shadow-xs font-black',
      inactiveColor: 'bg-white text-stone-800 hover:bg-stone-100 font-bold border border-stone-200',
    },
  ];

  return (
    <header id="sibo-header" className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      {/* Slim Top Header: Logo, Title & Doubled Hunger Button */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-2.5">
          {/* Logo & Clean Title */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/logo.png"
              alt="SIBO Safe for Nir"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover shadow-sm ring-1 ring-emerald-800/10 shrink-0 border border-stone-200"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-stone-900 tracking-tight truncate">
                סורק רמזור מזון לסיבו (SIBO) עבור ניר
              </h1>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium truncate">
                סורק רכיבים, רשימת 500+ מוצרים ומתכוני שף
              </p>
            </div>
          </div>

          {/* Right Action: Doubled Hunger SOS Button & Quick Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenChefPass && (
              <button
                type="button"
                onClick={onOpenChefPass}
                className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1 shadow-xs cursor-pointer border border-stone-300 transition-all active:scale-95"
                title="כרטיס שף ומלצר למסעדה 👨‍🍳"
              >
                <span className="text-base sm:text-lg">👨‍🍳</span>
                <span className="hidden sm:inline">כרטיס שף</span>
              </button>
            )}

            <button
              id="header-hunger-sos-btn"
              type="button"
              onClick={onOpenHungerWizard}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#BDECB6] hover:bg-[#aee4a6] text-[#064e3b] rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer border-2 border-[#a2dba0] transition-all active:scale-95 ring-2 ring-[#a2dba0]/30"
              title="אשף אני רעבה! מה לאכול עכשיו?"
            >
              <span className="text-base sm:text-lg">🥑</span>
              <span>אני רעבה!</span>
            </button>

            <button
              onClick={onOpenInstallShare}
              className="p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              title="התקנה בטלפון ושיתוף 📲"
            >
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onOpenHelp}
              className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              title="מידע ועקרונות"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs: Multi-Row Grid for Mobile, 0 Horizontal Scroll! */}
      <div className="bg-stone-50 border-t border-stone-200 py-2 px-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-1.5 sm:gap-2">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center text-center gap-1 cursor-pointer w-full sm:w-auto shadow-2xs active:scale-98 ${
                  isActive ? tab.activeColor : tab.inactiveColor
                }`}
              >
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
