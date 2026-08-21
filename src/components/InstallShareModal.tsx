import React, { useState } from 'react';
import { X, Share2, Smartphone, Check, Copy, MessageCircle, Heart, Download } from 'lucide-react';

interface InstallShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallShareModal: React.FC<InstallShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const shareText = `היי, סורק רמזור מזון לסיבו (SIBO) - אפליקציה רפואית לבדיקת מאכלים, מתכונים ותפריטים: ${currentUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">התקנה בטלפון ושיתוף עם חברים</h3>
              <p className="text-xs text-emerald-100">גישה מהירה כמו אפליקציה רגילה ממסך הבית</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Share via WhatsApp & Link */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>1. שליחה ישירה בוואטסאפ לניר ולחברים</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white/30" />
                <span>שליחה בוואטסאפ (WhatsApp)</span>
              </a>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-all border border-stone-300"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'הקישור הועתק!' : 'העתקת קישור'}</span>
              </button>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-600" />
              <span>2. איך מתקינים כאייקון במסך הבית? (ללא צורך בחנות אפליקציות)</span>
            </h4>

            {/* iPhone / iPad */}
            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-sky-900">
                <span className="w-5 h-5 rounded-full bg-sky-200 flex items-center justify-center text-[11px]">🍎</span>
                <span>באייפון (iPhone / Safari):</span>
              </div>
              <ol className="text-xs text-sky-800 space-y-1.5 list-decimal list-inside pr-1">
                <li>פותחים את הקישור בדפדפן <strong>Safari</strong>.</li>
                <li>לוחצים על כפתור <strong>השיתוף</strong> בתחתית המסך (הריבוע עם החץ למעלה ⎋).</li>
                <li>גוללים ובוחרים באפשרות <strong>״הוסף למסך הבית״ (Add to Home Screen ➕)</strong>.</li>
                <li>לוחצים על <strong>הוסף (Add)</strong> – האפליקציה תופיע כאייקון רגיל בטלפון!</li>
              </ol>
            </div>

            {/* Android */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[11px]">🤖</span>
                <span>באנדרואיד (Android / Chrome):</span>
              </div>
              <ol className="text-xs text-amber-800 space-y-1.5 list-decimal list-inside pr-1">
                <li>פותחים את הקישור בדפדפן <strong>Google Chrome</strong>.</li>
                <li>לוחצים על <strong>3 הנקודות</strong> בפינה העליונה (⋮).</li>
                <li>בוחרים באפשרות <strong>״הוסף למסך הבית״</strong> או <strong>״התקן אפליקציה״</strong>.</li>
                <li>מאשרים – והאפליקציה מותקנת במסך הבית!</li>
              </ol>
            </div>
          </div>

          {/* Developer Note */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 text-xs text-stone-600">
            <p className="font-bold text-stone-800">
              פותח ע״י חגי הילמן • 054-3200007
            </p>
            <p className="text-[11px] text-stone-500">
              מצאתם באג? יש מאכל שחסר או רעיון לשיפור? צרו קשר ישיר לתיקון מיידי!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
