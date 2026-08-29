import React, { useState, useRef } from 'react';
import { Camera, Barcode, RotateCcw, AlertTriangle, CheckCircle2, XCircle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
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
}

export const SupermarketSelfScanView: React.FC<SupermarketSelfScanViewProps> = ({
  currentPhase,
  onAnalyze,
  isLoading,
  analysisResult,
  onClearResult,
  onOpenShoppingList,
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
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-5 animate-fadeIn" dir="rtl">
      {/* Calm Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden text-right">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-amber-400 text-stone-950 rounded-full">
              סורק סופרמרקט חכם
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              קניות בעצמי בסופר 🛒
            </h2>
            <p className="text-xs text-emerald-100 font-medium max-w-md">
              בחרי אם לצלם את רשימת הרכיבים באריזה או לסרוק ברקוד — ותקבלי רמזור מיידי תוך שנייה!
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🔍
          </div>
        </div>
      </div>

      {/* Main 2 Giant Action Buttons when idle & no results */}
      {!analysisResult && !isLoading && activeScanMode === 'idle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Button 1: 📸 צלם */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform active:scale-98 flex flex-col items-center justify-center text-center gap-3 border-2 border-amber-300/60 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                  צלם 📸
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-amber-100">
                  צילום רשימת רכיבים / מאכל
                </p>
              </div>
              <span className="text-[11px] font-black bg-white/20 text-white px-3 py-1 rounded-full">
                ניתוח AI מיידי ✨
              </span>
            </button>

            {/* Button 2: 🏷️ סרוק */}
            <button
              type="button"
              onClick={() => setActiveScanMode('barcode')}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform active:scale-98 flex flex-col items-center justify-center text-center gap-3 border-2 border-emerald-400/60 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <Barcode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                  סרוק 🏷️
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-emerald-100">
                  סריקת ברקוד ישראלי חי
                </p>
              </div>
              <span className="text-[11px] font-black bg-white/20 text-white px-3 py-1 rounded-full">
                מאגר סופרמרקטים 🛒
              </span>
            </button>
          </div>

          {/* Helper Shortcut to Shopping List */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-3 text-right">
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black text-stone-900">
                מעדיפה לשלוח מישהו אחר לקנות עבורך?
              </h4>
              <p className="text-[11px] text-stone-600 font-medium">
                פתחי את רשימת הקניות החכמה ושלחי בוואטסאפ בשנייה אחת
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenShoppingList}
              className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-black text-xs shrink-0 transition-colors cursor-pointer"
            >
              לרשימת קניות 📋
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
        <div className="space-y-3 bg-white p-4 rounded-3xl border-2 border-emerald-500 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-emerald-600" />
              <span>סריקת ברקוד חיה</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveScanMode('idle')}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg cursor-pointer"
            >
              ✕ ביטול
            </button>
          </div>

          <CameraScanner
            currentPhase={currentPhase}
            onAnalyze={(payload) => {
              onAnalyze(payload);
              setActiveScanMode('idle');
            }}
            isLoading={isLoading}
            initialMode="barcode"
            onReset={() => {}}
          />
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-md text-center space-y-3 animate-pulse">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <h3 className="text-base font-black text-stone-900">
            מנתח את המוצר ברמזור קליני...
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            בודק שום, בצל, גלוטן, לקטוז ופרוקטנים לפי פרוטוקול שלב 1
          </p>
        </div>
      )}

      {/* Traffic Light Result Display */}
      {analysisResult && (
        <div className="space-y-4">
          <TrafficLightResult
            result={analysisResult}
            currentPhase={currentPhase}
            onReset={() => {
              onClearResult();
              setActiveScanMode('idle');
            }}
            onSaveToDiary={() => {}}
            isSaved={false}
          />

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClearResult();
                setActiveScanMode('idle');
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
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
