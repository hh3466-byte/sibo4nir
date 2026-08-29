import React, { useState } from 'react';
import { ChefHat, X, Copy, Check, UtensilsCrossed, AlertTriangle, CheckCircle2, Heart } from 'lucide-react';

interface ChefPassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChefPassModal: React.FC<ChefPassModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const chefText = `שלום שף ומלצר יקר! 👨‍🍳
לסועדת יש רגישות רפואית קפדנית במערכת העיכול (SIBO):
נא להכין את המנה (עוף / בקר / דג / ביצים / אורז) על מחבת נקייה בלבד.

⛔ אסור בתכלית (אפילו בכמות מזערית):
• ללא שום כלל (לא כתוש, לא אבקה, לא שמן שום תעשייתי)
• ללא בצל כלל (לא חי, לא מטוגן, לא אבקה)
• ללא אבקות מרק, רטבים קנויים, פטריות או קטניות
• ללא קמח, פירורי לחם או גלוטן

✅ תיבול מותר ובטוח:
• שמן זית טהור, מלח ים, פלפל שחור, לימון טרי סחוט, עשבי תיבול (שמיר, פטרוזיליה, רוזמרין, טימין).

תודה רבה מקרב לב על ההקפדה וההבנה! ❤️`;

  const handleCopy = () => {
    navigator.clipboard.writeText(chefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-emerald-600 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs border border-emerald-600">
              👨‍🍳
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>כרטיס שף ומלצר למסעדה</span>
              </h3>
              <p className="text-xs text-stone-300 font-medium">
                הציגי למלצר או לשף במטבח להזמנה נקייה ובטוחה
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Card Body: The Chef Presentation Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-right">
          {/* Card Presentation Box for Restaurant Staff */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3 text-stone-900 shadow-xs">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="text-xs font-black uppercase text-amber-950 px-2.5 py-0.5 bg-amber-200 rounded-full">
                הנחיות רפואיות למטבח
              </span>
              <UtensilsCrossed className="w-4 h-4 text-amber-800" />
            </div>

            <p className="text-sm font-bold text-stone-800 leading-snug">
              שלום שף ומלצר יקר! 👨‍🍳 לסועדת יש רגישות רפואית קפדנית (SIBO). נודה מקרב לב להקפדה על הכנת המנה על <span className="underline font-black text-emerald-950">מחבת נקייה בלבד</span>:
            </p>

            {/* Forbidden Block */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-rose-950 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-black text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>אסור בתכלית (אפילו לא בכמות מזערית):</span>
              </div>
              <ul className="space-y-1 pr-4 list-disc text-xs sm:text-[13px] font-semibold text-rose-900">
                <li><strong>ללא שום כלל</strong> (לא שום כתוש, לא אבקה, לא שמן שום תעשייתי).</li>
                <li><strong>ללא בצל כלל</strong> (לא חי, לא מטוגן, לא אבקת בצל, לא כרישה).</li>
                <li><strong>ללא אבקות מרק או רטבים קנויים</strong> (ללא טריאקי, ברביקיו או סויה רגילה).</li>
                <li><strong>ללא גלוטן וקמח</strong> (ללא פירורי לחם או ציפויים).</li>
                <li><strong>ללא פטריות, כרובית או קטניות</strong>.</li>
              </ul>
            </div>

            {/* Allowed Block */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-emerald-950 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-black text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>מה מותר ומבורך להכין:</span>
              </div>
              <ul className="space-y-1 pr-4 list-disc text-xs sm:text-[13px] font-semibold text-emerald-900">
                <li><strong>נתח נקי:</strong> חזה עוף / פרגית נקייה / סטייק בקר / פילה דג / ביצים / אורז לבן.</li>
                <li><strong>תיבול בטוח בלבד:</strong> שמן זית טהור, מלח ים, פלפל שחור, לימון טרי סחוט ועשבי תיבול טריים.</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-stone-600 text-xs pt-1 font-medium justify-center">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>תודה רבה מקרב לב על ההבנה וההקפדה!</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'הטקסט הועתק!' : 'העתק טקסט לוואטסאפ 📋'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
