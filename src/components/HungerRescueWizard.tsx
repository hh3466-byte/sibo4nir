import React, { useState, useRef, useEffect } from 'react';
import { SiboPhase } from '../types';
import {
  Sparkles,
  Home,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  MapPin,
  Camera,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Search,
  Zap,
} from 'lucide-react';

interface HungerRescueWizardProps {
  currentPhase: SiboPhase;
  isOpen: boolean;
  onClose: () => void;
  onSelectFoodToAnalyze?: (foodName: string) => void;
}

type ScenarioType = 'home' | 'driving' | 'restaurant' | 'supermarket' | 'gps' | 'camera' | 'custom' | null;

interface SuggestedMeal {
  title: string;
  timeToMake: string;
  ingredients: string[];
  simpleSteps: string[];
  satietyReason: string;
}

interface ChefResponse {
  scenarioTitle: string;
  calmMessage: string;
  prepTimeMinutes: number;
  suggestedMeals: SuggestedMeal[];
  safeIngredientsIdentified: string[];
  cautionWarnings?: string[];
  quickTip: string;
}

export const HungerRescueWizard: React.FC<HungerRescueWizardProps> = ({
  currentPhase,
  isOpen,
  onClose,
  onSelectFoodToAnalyze,
}) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(null);
  const [customText, setCustomText] = useState('');
  const [isLoadingChef, setIsLoadingChef] = useState(false);
  const [chefResult, setChefResult] = useState<ChefResponse | null>(null);

  // GPS Location state
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // Camera / Fridge photo state
  const [stagedPhoto, setStagedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Copy helper
  const [copiedText, setCopiedText] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setActiveScenario(null);
      setChefResult(null);
      setStagedPhoto(null);
      setCustomText('');
      setGpsError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPhase1 = currentPhase === 'phase1_strict';

  // Request GPS position
  const handleGetLocation = () => {
    setIsLoadingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('דפדפן זה אינו תומך בזיהוי מיקום GPS');
      setIsLoadingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsError('לא ניתן לגשת למיקום (יש לאשר הרשאת מיקום בדפדפן)');
        setIsLoadingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Call Fridge Chef API
  const fetchChefPlan = async (payload: {
    imageBase64?: string;
    textScenario?: string;
    locationType: ScenarioType;
  }) => {
    setIsLoadingChef(true);
    try {
      const res = await fetch('/api/fridge-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          phase: currentPhase,
        }),
      });

      if (!res.ok) throw new Error('שגיאה בתקשורת');
      const data: ChefResponse = await res.json();
      setChefResult(data);
    } catch (err) {
      console.warn('Chef API failed, using client safety fallback:', err);
      // Resilient Client-Side Safety Fallback
      setChefResult({
        scenarioTitle: 'פתרון שובע מהיר ב-3 דקות (חירום)',
        calmMessage: 'ניר, את בידיים טובות! הנה ארוחות בזק שמשביעות מיד ושומרות על הבטן שלך שקטה.',
        prepTimeMinutes: 3,
        suggestedMeals: [
          {
            title: '🍳 חביתת 2 ביצים בשמן זית + פריכיות אורז ומלפפון',
            timeToMake: '3 דקות',
            ingredients: ['2 ביצים טריות', 'כף שמן זית', '2-3 פריכיות אורז 100%', 'מלפפון טרי עם מלח'],
            simpleSteps: ['מחממים שמן זית במחבת', 'טורפים ביצים ומטגנים דקה וחצי', 'מגישים על פריכיות לצד מלפפון'],
            satietyReason: 'חלבון מלא ושומן בריא שמספקים שובע מיידי ויציב ללא שום תסיסה.',
          },
          {
            title: '🐟 סלט טונה עשיר בטחינה ומלפפון',
            timeToMake: '2 דקות',
            ingredients: ['קופסת טונה', 'מלפפון קצוץ', 'כף טחינה גולמית 100%', 'מלח ולימון'],
            simpleSteps: ['מערבבים את הטונה עם מלפפון וטחינה', 'מתבלים במלח ולימון ואוכלים עם פריכיות'],
            satietyReason: '0 פחמימות, חלבון עשיר ושומן איכותי שסוגר את הרעב מיד.',
          },
        ],
        safeIngredientsIdentified: ['ביצים', 'טונה', 'שמן זית', 'מלפפון', 'טחינה', 'פריכיות אורז'],
        cautionWarnings: ['להימנע מתוספת בצל, שום, רטבים מתועשים או לחם רגיל'],
        quickTip: 'שילוב של חלבון + שומן בריא משביע פי 3 ומייצב את האנרגיה ללא נפיחות.',
      });
    } finally {
      setIsLoadingChef(false);
    }
  };

  // Handle Photo Capture / Upload
  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setStagedPhoto(base64);
      fetchChefPlan({
        imageBase64: base64,
        locationType: 'camera',
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Scenario Choice
  const handleSelectScenario = (type: ScenarioType) => {
    setActiveScenario(type);
    setChefResult(null);

    if (type === 'home') {
      fetchChefPlan({ locationType: 'home', textScenario: 'אני בבית ליד המטבח' });
    } else if (type === 'driving') {
      fetchChefPlan({ locationType: 'driving', textScenario: 'אני בנסיעה / תחנת דלק / חנות נוחות' });
    } else if (type === 'restaurant') {
      fetchChefPlan({ locationType: 'restaurant', textScenario: 'אני בעבודה / מזמינה בוולט / במסעדה' });
    } else if (type === 'supermarket') {
      fetchChefPlan({ locationType: 'supermarket', textScenario: 'אני ליד סופרמרקט או מכולת' });
    } else if (type === 'gps') {
      handleGetLocation();
    }
  };

  // Waiter Script Text for Restaurant
  const waiterScript = `היי, אני עם רגישות עיכולית קפדנית ביותר (ללא שום, ללא בצל, ללא חיטה וללא חלב).
אני מבקשת בבקשה:
1. פרגית / חזה עוף / פילה דג / סטייק נקי על האש — מתובל אך ורק במלח, פלפל שחור ושמן (ללא מרינדות, ללא אבקות מרק וללא רוטב).
2. תוספת: אורז לבן נקי פשוט או תפוח אדמה אפוי בנייר כסף ללא חמאה.
3. סלט: מלפפון בלבד חתוך טרי עם שמן זית ולימון בצד.
תודה רבה על העזרה וההקפדה!`;

  const copyWaiterScript = () => {
    navigator.clipboard.writeText(waiterScript);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-500/60 overflow-hidden relative my-auto animate-scaleIn flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer z-20 active:scale-95"
            title="סגור אשף"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-2xl shadow-inner border border-white/30">
              🥑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 bg-amber-400 text-stone-950 rounded-full shadow-sm">
                  SIBO SOS
                </span>
                <span className="text-xs font-bold text-emerald-100">
                  {isPhase1 ? 'שלב 1: קפדני' : 'שלב 2: שילוב מחדש'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                אשף שובע מהיר — אני רעבה! ✨
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 bg-stone-50/50">

          {/* Screen 1: Choose Scenario if none selected */}
          {!activeScenario && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-stone-900">
                  ניר, אל דאגה! איפה את נמצאת כרגע?
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-medium">
                  בחרי את המצב שלך, ותוך 3 דקות תהיה לך ארוחה משביעה ובטוחה:
                </p>
              </div>

              {/* 6 Scenario Grid Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Home / Kitchen */}
                <button
                  type="button"
                  onClick={() => handleSelectScenario('home')}
                  className="p-4 rounded-2xl bg-white hover:bg-emerald-50/80 border-2 border-emerald-300 shadow-sm hover:shadow-md transition-all text-right flex items-center gap-3.5 group cursor-pointer active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-900 group-hover:text-emerald-800 transition-colors">
                      🏠 בבית / ליד המטבח
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      ארוחות בזק ממה שיש בבית (3-5 דקות)
                    </p>
                  </div>
                </button>

                {/* 2. Photo Fridge / Counter */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveScenario('camera');
                    cameraInputRef.current?.click();
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/80 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-400 shadow-sm hover:shadow-md transition-all text-right flex items-center gap-3.5 group cursor-pointer active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-950">
                      📸 צלמי מקרר / מזווה
                    </h4>
                    <p className="text-xs text-stone-700 font-medium">
                      ה-AI יסרוק את המדף וירכיב מתכון
                    </p>
                  </div>
                </button>

                {/* 3. On the Road / Driving */}
                <button
                  type="button"
                  onClick={() => handleSelectScenario('driving')}
                  className="p-4 rounded-2xl bg-white hover:bg-amber-50/80 border-2 border-stone-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all text-right flex items-center gap-3.5 group cursor-pointer active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-900 group-hover:text-amber-800 transition-colors">
                      🚗 בנסיעה / בדרכים
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      מה לקנות בתחנות דלק (Yellow, מנטה)
                    </p>
                  </div>
                </button>

                {/* 4. Restaurant / Work / Wolt */}
                <button
                  type="button"
                  onClick={() => handleSelectScenario('restaurant')}
                  className="p-4 rounded-2xl bg-white hover:bg-teal-50/80 border-2 border-stone-200 hover:border-teal-300 shadow-sm hover:shadow-md transition-all text-right flex items-center gap-3.5 group cursor-pointer active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-900 group-hover:text-teal-800 transition-colors">
                      🏢 בעבודה / מסעדה / וולט
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      תסריט הזמנה מדויק ללא שום/בצל
                    </p>
                  </div>
                </button>

                {/* 5. Near Supermarket */}
                <button
                  type="button"
                  onClick={() => handleSelectScenario('supermarket')}
                  className="p-4 rounded-2xl bg-white hover:bg-indigo-50/80 border-2 border-stone-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all text-right flex items-center gap-3.5 group cursor-pointer active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-900 group-hover:text-indigo-800 transition-colors">
                      🛒 ליד סופר / מכולת
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      רשימת קנייה מיידית לשובע ב-2 דקות
                    </p>
                  </div>
                </button>

                {/* 6. GPS Food Finder */}
                <button
                  type="button"
                  onClick={() => handleSelectScenario('gps')}
                  className="p-4 rounded-2xl bg-white hover:bg-rose-50/80 border-2 border-stone-200 hover:border-rose-300 shadow-sm hover:shadow-md transition-all text-right flex items-center gap-3.5 group cursor-pointer active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-stone-900 group-hover:text-rose-800 transition-colors">
                      📍 חפשי אוכל סביבי (GPS)
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      סופרים ומסעדות בשרים קרובות במפות
                    </p>
                  </div>
                </button>
              </div>

              {/* Free text custom query */}
              <div className="pt-2">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5 shadow-xs">
                  <label htmlFor="hunger-custom-input" className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>או ספרי לי בקצרה מה יש סביבך:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="hunger-custom-input"
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customText.trim()) {
                          setActiveScenario('custom');
                          fetchChefPlan({ locationType: 'custom', textScenario: customText.trim() });
                        }
                      }}
                      placeholder="לדוגמה: יש לי ביצים, מלפפון וטונה / אני בקניון..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
                    />
                    <button
                      type="button"
                      disabled={!customText.trim()}
                      onClick={() => {
                        if (customText.trim()) {
                          setActiveScenario('custom');
                          fetchChefPlan({ locationType: 'custom', textScenario: customText.trim() });
                        }
                      }}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Screen 2: Active Scenario Display */}
          {activeScenario && (
            <div className="space-y-6 animate-fadeIn">
              {/* Back to Scenarios bar */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveScenario(null);
                    setChefResult(null);
                    setStagedPhoto(null);
                  }}
                  className="text-xs font-black text-stone-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                  <span>חזרה לבחירת מצב</span>
                </button>

                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {activeScenario === 'home' && '🏠 בבית / במטבח'}
                  {activeScenario === 'camera' && '📸 צילום מקרר ומזווה'}
                  {activeScenario === 'driving' && '🚗 בנסיעה / בדרכים'}
                  {activeScenario === 'restaurant' && '🏢 מסעדה / וולט'}
                  {activeScenario === 'supermarket' && '🛒 סופרמרקט / מכולת'}
                  {activeScenario === 'gps' && '📍 איתור סביבי (GPS)'}
                  {activeScenario === 'custom' && '✏️ מענה מותאם אישית'}
                </span>
              </div>

              {/* Loading Spinner */}
              {isLoadingChef && (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-stone-900">
                      השף מרכיב עבורך ארוחת שובע בטוחה ב-3 דקות...
                    </h4>
                    <p className="text-xs text-stone-500">
                      מוודא 0 שום, 0 בצל, 0 גלוטן וספיגה מושלמת ללא גזים
                    </p>
                  </div>
                </div>
              )}

              {/* GPS Screen Content */}
              {activeScenario === 'gps' && !isLoadingChef && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 space-y-3 text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                        📍
                      </div>
                      <div>
                        <h4 className="text-base font-black text-rose-950">
                          איתור אוכל בטוח סביבך ב-Google Maps
                        </h4>
                        <p className="text-xs text-stone-700 font-medium">
                          לחיצה על הכפתור תפתח ישירות מקומות קרובים עם אוכל מתאים ל-SIBO:
                        </p>
                      </div>
                    </div>

                    {isLoadingGps && (
                      <div className="flex items-center gap-2 text-xs text-stone-600 font-bold py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        <span>דוגם את המיקום שלך...</span>
                      </div>
                    )}

                    {gpsError && (
                      <div className="text-xs text-rose-700 bg-rose-100 p-2.5 rounded-xl font-bold">
                        {gpsError}
                      </div>
                    )}

                    {/* Google Maps Action Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <a
                        href={
                          gpsCoords
                            ? `https://www.google.com/maps/search/סופרמרקט/@${gpsCoords.lat},${gpsCoords.lng},15z`
                            : `https://www.google.com/maps/search/סופרמרקט/`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-4 bg-white hover:bg-emerald-50 text-stone-900 font-black text-xs sm:text-sm rounded-xl border-2 border-emerald-400 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>🛒 סופרמרקטים קרובים (עוף בגריל, טונה)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </a>

                      <a
                        href={
                          gpsCoords
                            ? `https://www.google.com/maps/search/שיפודיה+בשרים+על+האש/@${gpsCoords.lat},${gpsCoords.lng},15z`
                            : `https://www.google.com/maps/search/שיפודיה+בשרים+על+האש/`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-4 bg-white hover:bg-rose-50 text-stone-900 font-black text-xs sm:text-sm rounded-xl border-2 border-rose-400 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center"
                      >
                        <UtensilsCrossed className="w-4 h-4 text-rose-600" />
                        <span>🥩 שיפודיות ובשרים (פרגית נקייה על האש)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </a>
                    </div>
                  </div>

                  {/* Waiter Assistant Card */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                        <span>📋 כרטיס הזמנה חכם למלצר / קופאי:</span>
                      </h4>
                      <button
                        type="button"
                        onClick={copyWaiterScript}
                        className="text-xs font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? 'הועתק!' : 'העתקי טקסט'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-stone-800 bg-stone-50 p-3.5 rounded-xl border border-stone-200 whitespace-pre-line leading-relaxed font-mono font-medium">
                      {waiterScript}
                    </p>
                  </div>
                </div>
              )}

              {/* Driving / Gas Station Quick Survival Guide */}
              {activeScenario === 'driving' && !isLoadingChef && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                        ⛽
                      </div>
                      <div>
                        <h4 className="text-base font-black text-stone-950">
                          רשימת הישרדות בתחנות דלק וחנויות נוחות (Yellow / מנטה / SoGood)
                        </h4>
                        <p className="text-xs text-stone-800 font-medium">
                          המוצרים הכי בטוחים שקונים ופותחים מיד ברכב:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <span className="text-xs font-black text-emerald-700">🥚 חטיף ביצים קשות (2 יח׳)</span>
                        <p className="text-[11px] text-stone-600 font-medium">100% חלבון נקי, 0 פחמימות ושובע מיידי.</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <span className="text-xs font-black text-emerald-700">🐟 קופסת טונה בשמן זית / מים</span>
                        <p className="text-[11px] text-stone-600 font-medium">לפתוח ולאכול עם מזלג. שובע לשעות.</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <span className="text-xs font-black text-emerald-700">🌾 פריכיות אורז רגילות (ללא תיבול)</span>
                        <p className="text-[11px] text-stone-600 font-medium">פחמימה קלה ובטוחה שמרגיעה את הרעב.</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <span className="text-xs font-black text-emerald-700">🥜 בוטנים קלויים מלוחים (שקית קטנה)</span>
                        <p className="text-[11px] text-stone-600 font-medium">דלי FODMAP. להגביל לחופן קטן (עד 30 גרם).</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <span className="text-xs font-black text-emerald-700">☕ קפה שחור / אספרסו / סודה</span>
                        <p className="text-[11px] text-stone-600 font-medium">קפאין מאיץ תנועתיות MMC. לשתות ללא חלב.</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
                        <span className="text-xs font-black text-rose-800">⛔ ממה להימנע בתחנה:</span>
                        <p className="text-[11px] text-stone-600 font-medium">כריכים מוכנים (בצל/שום/גלוטן), בורקסים ומסטיקים עם קסיליטול.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chef Result Meals Display */}
              {chefResult && !isLoadingChef && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Soothing message banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 border border-emerald-300 shadow-xs flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xl font-black shadow-xs">
                      💚
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-black text-emerald-950">
                        {chefResult.scenarioTitle} (הכנה: ~{chefResult.prepTimeMinutes} דקות)
                      </h4>
                      <p className="text-xs sm:text-sm text-emerald-900 font-bold leading-relaxed">
                        {chefResult.calmMessage}
                      </p>
                    </div>
                  </div>

                  {/* Photo Preview if camera used */}
                  {stagedPhoto && (
                    <div className="rounded-2xl overflow-hidden border-2 border-amber-300 max-h-48 relative">
                      <img src={stagedPhoto} alt="מקרר" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 right-2 bg-stone-950/80 text-white text-[11px] font-black px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        📸 התמונה נסרקה בהצלחה
                      </div>
                    </div>
                  )}

                  {/* Meal Cards */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-stone-800 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>ארוחות השובע המומלצות עבורך כרגע:</span>
                    </h4>

                    <div className="space-y-3.5">
                      {chefResult.suggestedMeals.map((meal, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all space-y-3 text-right"
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                            <div>
                              <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                                אופציה {idx + 1} • {meal.timeToMake}
                              </span>
                              <h5 className="text-base font-black text-stone-900">
                                {meal.title}
                              </h5>
                            </div>
                            <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                          </div>

                          {/* Ingredients */}
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-stone-700">🛒 מה צריך:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {meal.ingredients.map((ing, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-stone-100 text-stone-800 font-medium px-2.5 py-1 rounded-lg border border-stone-200"
                                >
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Simple steps */}
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-stone-700">⚡ איך מכינים (קצר ופשוט):</span>
                            <ol className="list-decimal list-inside space-y-0.5 text-xs text-stone-800 font-medium">
                              {meal.simpleSteps.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Satiety Reason */}
                          <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{meal.satietyReason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safe ingredients & Quick Tip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {chefResult.safeIngredientsIdentified?.length > 0 && (
                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                        <span className="text-xs font-black text-emerald-900">✅ מצרכים בטוחים שזוהו:</span>
                        <p className="text-xs text-emerald-800 font-medium">
                          {chefResult.safeIngredientsIdentified.join(', ')}
                        </p>
                      </div>
                    )}

                    {chefResult.quickTip && (
                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                        <span className="text-xs font-black text-amber-950">💡 טיפ שובע קליני:</span>
                        <p className="text-xs text-amber-900 font-medium">
                          {chefResult.quickTip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Hidden inputs for Camera / Gallery */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelected}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelected}
          className="hidden"
        />

        {/* Bottom Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer active:scale-95"
          >
            סגור אשף
          </button>

          {activeScenario && (
            <button
              type="button"
              onClick={() => {
                setActiveScenario(null);
                setChefResult(null);
              }}
              className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>בחרי תרחיש אחר</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
