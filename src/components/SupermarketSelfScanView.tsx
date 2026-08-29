import React, { useState, useRef } from 'react';
import { Camera, Barcode, RotateCcw, AlertTriangle, CheckCircle2, XCircle, Sparkles, Loader2, RefreshCw, Send, ListChecks, ChevronLeft, Zap } from 'lucide-react';
import { SiboPhase, FoodAnalysisResult } from '../types';
import { CameraScanner } from './CameraScanner';
import { TrafficLightResult } from './TrafficLightResult';

interface SupermarketSelfScanViewProps {
  currentPhase: SiboPhase;
  onAnalyze: (payload: { imageBase64?: string; textPrompt?: string; mimeType?: string }) => void;
  isLoading: boolean;
  analysisResult: FoodAnalysisResult | null;
  onClearResult: () => void;
  onOpenShoppingList: () => void;
  onOpenHungerWizard?: () => void;
  selectedShoppingCount?: number;
}

export const SupermarketSelfScanView: React.FC<SupermarketSelfScanViewProps> = ({
  currentPhase,
  onAnalyze,
  isLoading,
  analysisResult,
  onClearResult,
  onOpenShoppingList,
  onOpenHungerWizard,
  selectedShoppingCount = 0,
}) => {
  const [activeScanMode, setActiveScanMode] = useState<'idle' | 'camera' | 'barcode'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onAnalyze({
        imageBase64: base64,
        mimeType: file.type || 'image/jpeg',
      });
      setActiveScanMode('idle');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto p-2.5 sm:p-5 space-y-4 animate-fadeIn text-stone-900" dir="rtl">
      {/* 🥑 SUPER PROMINENT DOUBLE-SIZED HUNGER RESCUE BUTTON */}
      {!analysisResult && !isLoading && activeScanMode === 'idle' && onOpenHungerWizard && (
        <button
          type="button"
          onClick={onOpenHungerWizard}
          className="w-full p-4 sm:p-5 rounded-3xl bg-[#BDECB6] hover:bg-[#aee4a6] text-[#064e3b] font-black shadow-md hover:shadow-lg transition-all flex items-center justify-between gap-3 border-2 border-[#a2dba0] active:scale-98 cursor-pointer group"
        >
          <div className="flex items-center gap-3 sm:gap-4 text-right min-w-0">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white text-[#064e3b] flex items-center justify-center text-3xl sm:text-4xl shadow-xs group-hover:scale-110 transition-transform shrink-0 border border-[#a2dba0]">
              🥑
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-black uppercase px-2.5 py-0.5 bg-white text-[#064e3b] border border-[#a2dba0] rounded-full shadow-2xs">
                  חירום שובע מהיר
                </span>
                <h3 className="text-base sm:text-xl font-black tracking-tight text-[#064e3b] truncate">
                  אני רעבה!!! (מה לאכול עכשיו?) ✨
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#0f5132] font-bold mt-0.5 truncate">
                פתרונות מהירים ב-3 דקות • מקרר ומזווה • תחנות דלק • מנות שף
              </p>
            </div>
          </div>
          <div className="px-3.5 sm:px-5 py-2.5 bg-[#064e3b] group-hover:bg-[#022c22] text-white font-black text-xs sm:text-sm rounded-xl shadow-xs shrink-0 transition-colors">
            פתחי אשף ⚡
          </div>
        </button>
      )}

      {/* 1. TOP PROMINENT CARD: לשלוח למישהו לקנות בסופר (Entire card is a clickable button) */}
      {!analysisResult && !isLoading && activeScanMode === 'idle' && (
        <button
          type="button"
          onClick={onOpenShoppingList}
          className="w-full bg-white rounded-3xl p-4 sm:p-6 border-2 border-emerald-800/30 hover:border-emerald-800 shadow-sm hover:shadow-md transition-all text-right space-y-3 cursor-pointer group active:scale-[0.99] block"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black">
                <span>אפשרות 1: שולחת מישהו אחר</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-stone-950 flex items-center gap-2 group-hover:text-emerald-900 transition-colors">
                <span>לשלוח למישהו לקנות בסופר 📋</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-lg">
                סמני מה חסר לך במקרר (מתוך 500+ מוצרים ומותגים בטוחים) ושלחי ישירות לוואטסאפ של הקונה!
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl sm:text-2xl shrink-0 border border-emerald-200 shadow-2xs group-hover:scale-105 transition-transform">
              📱
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 flex-wrap border-t border-stone-100">
            <div className="text-xs text-stone-500 font-medium">
              {selectedShoppingCount > 0 ? (
                <span className="font-bold text-emerald-800">
                  ✓ {selectedShoppingCount} מוצרים מסומנים ברשימה
                </span>
              ) : (
                <span>כל הצ׳ק-בוקסים ריקים כרגע — סמני רק מה שחסר</span>
              )}
            </div>

            <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-800 group-hover:bg-emerald-900 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              <span>פתחי רשימת קניות לשליחה 📋</span>
            </div>
          </div>
        </button>
      )}

      {/* 2. SECOND SECTION: קניות בעצמי בסופר (צלם / סרוק) */}
      {!analysisResult && !isLoading && activeScanMode === 'idle' && (
        <div className="bg-stone-50 rounded-3xl p-4 sm:p-6 border border-stone-300 shadow-xs space-y-3 sm:space-y-4 text-right">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-black">
              <span>אפשרות 2: את נמצאת בעצמך בסופר</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-stone-900">
              קניות בעצמי בסופר 🛒
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              צלמי רכיבים או סרקי ברקוד לבדיקת בטיחות מיידית ברמזור
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Button 1: 📸 צלם */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-stone-100/80 text-stone-900 border-2 border-amber-500/80 shadow-xs hover:shadow-sm transition-all cursor-pointer transform active:scale-98 flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black tracking-tight text-stone-900">
                  צלם 📸
                </h4>
                <p className="text-xs font-semibold text-stone-600">
                  צילום רשימת רכיבים / מאכל
                </p>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full">
                ניתוח AI מיידי
              </span>
            </button>

            {/* Button 2: 🏷️ סרוק */}
            <button
              type="button"
              onClick={() => setActiveScanMode('barcode')}
              className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-stone-100/80 text-stone-900 border-2 border-emerald-700/80 shadow-xs hover:shadow-sm transition-all cursor-pointer transform active:scale-98 flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black tracking-tight text-stone-900">
                  סרוק 🏷️
                </h4>
                <p className="text-xs font-semibold text-stone-600">
                  סריקת ברקוד ישראלי חי
                </p>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full">
                מאגר סופרמרקטים
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input for Camera Capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />

      {/* Live Barcode Scanner Component */}
      {activeScanMode === 'barcode' && !analysisResult && (
        <div className="space-y-3 bg-white p-4 rounded-3xl border-2 border-emerald-700 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
            <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-emerald-800" />
              <span>סריקת ברקוד חיה</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveScanMode('idle')}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              ✕ ביטול
            </button>
          </div>

          <CameraScanner
            currentPhase={currentPhase}
            onAnalyze={async (payload) => {
              onAnalyze(payload);
              setActiveScanMode('idle');
            }}
            isLoading={isLoading}
            initialMode="barcode"
          />
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-md text-center space-y-3 animate-pulse">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
          <h3 className="text-base font-black text-stone-900">
            מנתח את המוצר ברמזור קליני...
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            בודק שום, בצל, גלוטן, לקטוז ופרוקטנים
          </p>
        </div>
      )}

      {/* Traffic Light Result Display */}
      {analysisResult && (
        <div className="space-y-4">
          <TrafficLightResult
            result={analysisResult}
            onReset={() => {
              onClearResult();
              setActiveScanMode('idle');
            }}
            onSaveToDiary={() => {}}
            onExploreAlternative={() => {}}
            isSaved={false}
          />

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClearResult();
                setActiveScanMode('idle');
              }}
              className="px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>סרקי מוצר נוסף בסופר</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
