import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, XCircle, Heart } from 'lucide-react';

interface SiboPrinciplesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiboPrinciplesModal: React.FC<SiboPrinciplesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">מדריך עקרונות SIBO עבור ניר</h3>
              <p className="text-xs text-stone-500">למה התזונה הקפדנית כה חשובה וכיצד היא מרפאה את המעי</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* SIBO 101 */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>מה זה בעצם סיבו (SIBO)?</span>
            </h4>
            <p>
              במצב תקין, רוב חיידקי המעיים חיים ב<strong>מעי הגס</strong>. ב-SIBO (צמיחת יתר של חיידקים במעי הדק),
              חיידקים נודדים למעלה אל <strong>המעי הדק</strong>, שבו המזון עדיין מתעכל. כשהם פוגשים סוכרים מתסיסים
              (FODMAPs), הם זוללים אותם ופולטים גזים (מימן ומתאן) שגורמים לנפיחות, עוויתות, שלשול או עצירות.
            </p>
          </div>

          {/* Traffic light rules */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-stone-900">משמעות אורות הרמזור באפליקציה:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>אור ירוק 🟢</span>
                </span>
                <span>מאכל בטוח לחלוטין (0 FODMAP). מרעיב את החיידקים ומאפשר החלמה.</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="font-bold block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>אור צהוב 🟡</span>
                </span>
                <span>מותר רק בכמות קטנה ומדודה, או מיועד לשלב שילוב מחדש (שלב 2).</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                <span className="font-bold block mb-1 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>אור אדום 🔴</span>
                </span>
                <span>אסור בתכלית! עשיר בסוכרים מתסיסים, שום, בצל, חיטה או לקטוז.</span>
              </div>
            </div>
          </div>

          {/* Golden Rules */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-stone-900">3 כללי הזהב של ניר:</h4>
            <ul className="space-y-1.5 list-disc list-inside text-stone-700">
              <li>
                <strong>מרווח של 4 שעות בין ארוחות:</strong> לא לנשנש בין הארוחות כדי לאפשר למנגנון הניקוי
                (MMC) לעבוד.
              </li>
              <li>
                <strong>שמן מושרה שום במקום שום:</strong> נותן טעם אמיתי של שום בלי אף מולקולת פרוקטן מתסיסה.
              </li>
              <li>
                <strong>בישול יסודי וריכוך:</strong> ירקות מבושלים ורכים קלים בהרבה לעיכול מירקות חיים וקשים.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
          >
            הבנתי, תודה!
          </button>
        </div>
      </div>
    </div>
  );
};
