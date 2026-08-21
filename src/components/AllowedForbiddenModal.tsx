import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Layers,
} from 'lucide-react';
import { SiboPhase } from '../types';

interface AllowedForbiddenModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: SiboPhase;
}

export const AllowedForbiddenModal: React.FC<AllowedForbiddenModalProps> = ({
  isOpen,
  onClose,
  currentPhase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const isPhase1 = currentPhase === 'phase1_strict';

  const categories = [
    { id: 'all', label: 'הכל מרוכז' },
    { id: 'proteins', label: 'חלבונים ובשרים 🥩' },
    { id: 'veggies', label: 'ירקות ועשבים 🥦' },
    { id: 'fruits', label: 'פירות 🍓' },
    { id: 'dairy', label: 'מוצרי חלב ותחליפים 🧀' },
    { id: 'grains', label: 'דגנים ופחמימות 🍚' },
    { id: 'oils_spices', label: 'שמנים ותבלינים 🌿' },
    { id: 'nuts', label: 'אגוזים וזרעים 🥜' },
  ];

  const allowedList = [
    {
      cat: 'proteins',
      item: 'עוף, הודו, בקר טחון ודגים טריים (סלמון, לברק, דניס, טונה)',
      note: 'חלבון טהור, 0% תסיסה. להכין ללא בצל או שום רגיל.',
    },
    {
      cat: 'proteins',
      item: 'ביצים (קשות, עין, חביתה)',
      note: 'מעולות לניר, קלות לעיכול, 0 גרם FODMAP.',
    },
    {
      cat: 'proteins',
      item: 'טופו מוצק (Firm Tofu)',
      note: 'בתהליך ייצור הטופו המוצק הפחמימות המתסיסות נשטפות במים.',
    },
    {
      cat: 'veggies',
      item: 'מלפפון, גזר מבושל או טרי',
      note: 'בטוחים לחלוטין ללא הגבלת כמות.',
    },
    {
      cat: 'veggies',
      item: 'קישוא (עד 1/2 כוס), עלי תרד, חסה, רוקט',
      note: 'עדיף לאכול ירקות מבושלים או רכים לעיכול קל יותר.',
    },
    {
      cat: 'veggies',
      item: 'העלים הירוקים של בצל ירוק (ללא החלק הלבן!)',
      note: 'החלק הירוק נקי מפרוקטנים ומעניק טעם בצל אמיתי ללא גזים!',
    },
    {
      cat: 'veggies',
      item: 'נבטים סיניים, במיה, פלפל אדום (עד 1/3 פלפל)',
      note: 'טריים, פריכים ודלי תסיסה.',
    },
    {
      cat: 'fruits',
      item: 'תות שדה טרי (עד 5-6 יחידות)',
      note: 'מקור מעולה לוויטמין C, דל פרוקטוז.',
    },
    {
      cat: 'fruits',
      item: 'אוכמניות (עד 1/4 כוס), פטל (עד 30 גרם)',
      note: 'פירות יער עשירים בנוגדי חמצון.',
    },
    {
      cat: 'fruits',
      item: 'בננה ירוקה ולא בשלה, קלמנטינה, תפוז (יחידה אחת)',
      note: 'בננה ירוקה מכילה עמילן עמיד ואינה מכילה סוכרים מתסיסים.',
    },
    {
      cat: 'oils_spices',
      item: 'שמן זית מושרה שום (Garlic-Infused Oil) ⭐️',
      note: 'הפטנט של ניר! כל הארומה של שום ללא אף מולקולת פרוקטן (כי פרוקטן מסיס רק במים ולא בשמן).',
    },
    {
      cat: 'oils_spices',
      item: 'שמן זית כתית מעולה, שמן קוקוס, גהי (חמאה מזוקקת)',
      note: 'שומנים טהורים 0% FODMAP, מרגיעים את רירית המעי.',
    },
    {
      cat: 'oils_spices',
      item: 'ג׳ינג׳ר טרי מגורר, כורכום, מלח ים, רוזמרין, טימין, שמיר',
      note: 'ג׳ינג׳ר מאיץ את גל הניקיון (MMC) ומפחית נפיחות.',
    },
    {
      cat: 'dairy',
      item: 'גבינות קשות מיושנות (פרמזן, צ׳דר, מנצ׳גו, פקורינו)',
      note: 'בתהליך היישון כל הלקטוז מתפרק (פחות מ-0.1 גרם לקטוז).',
    },
    {
      cat: 'dairy',
      item: 'חלב שקדים טבעי (ללא סוכר מוסף או חומרי עיבוי כמו גוארגאם)',
      note: 'תחליף חלב מעולה לקפה או לדייסה.',
    },
    {
      cat: 'grains',
      item: isPhase1
        ? 'קינואה מדודה, פריכיות אורז (בשלב 1 עדיף להמעיט בדגנים)'
        : 'אורז בסמטי לבן, שיבולת שועל ללא גלוטן, תפוחי אדמה מבושלים וקלופים',
      note: isPhase1
        ? 'בשלב 1 הקפדני מומלץ למזער דגנים כדי להרעיב את החיידקים.'
        : 'בשלב 2 אורז לבן נספג במהירות בחלק העליון של המעי ללא תסיסה.',
    },
    {
      cat: 'nuts',
      item: 'אגוזי מלך (עד 8-10 חצאים), זרעי צ׳יה (עד כף)',
      note: 'שומן איכותי ומשביע במנות קטנות ומדודות.',
    },
  ];

  const forbiddenList = [
    {
      cat: 'oils_spices',
      item: 'שום ובצל (טרי, מבושל, מטוגן, אבקת שום, אבקת בצל)',
      reason: 'עשיר ביותר בפרוקטנים. מזין ומרבה את חיידקי ה-SIBO בתוך דקות בודדות!',
    },
    {
      cat: 'grains',
      item: 'חיטה ומוצרי גלוטן: לחם רגיל, פיתות, חלות, פסטה, בורקס, עוגות',
      reason: 'עשירים בפרוקטנים מרוכזים שמתסיסים קשות את המעי הדק.',
    },
    {
      cat: 'proteins',
      item: 'קטניות: גרגרי חומוס, ממרח חומוס, שעועית, עדשים, פולי סויה',
      reason: 'מכילים GOS (גלקטו-אוליגוסכרידים) שמתפרקים לגזים מרובים.',
    },
    {
      cat: 'dairy',
      item: 'חלב פרה רגיל, גבינה לבנה, קוטג׳, ריקוטה, יוגורט רגיל, גלידות',
      reason: 'עשירים בלקטוז (סוכר החלב) שמתסיס ומייצר גזים ואי-נוחות.',
    },
    {
      cat: 'veggies',
      item: 'כרובית, פטריות שמפיניון/פורטובלו, שורש סלרי בכמות גדולה, ארטישוק',
      reason: 'עשירים במניטול, סורביטול ופרוקטנים.',
    },
    {
      cat: 'fruits',
      item: 'תפוחים, אגסים, מנגו, אבטיח, דובדבנים, תמרים וכל הפירות היבשים',
      reason: 'עשירים בפרוקטוז חופשי ובסורביטול שגורמים לתפיחות בטנית.',
    },
    {
      cat: 'oils_spices',
      item: 'ממתיקים מלאכותיים (קסיליטול, סורביטול, מניטול, אריתריטול)',
      reason: 'סוכרים אלכוהוליים שמגיעים ישר לחיידקים ומייצרים גזים.',
    },
    {
      cat: 'oils_spices',
      item: 'דבש, סירופ תירס עתיר פרוקטוז, רטבים קנויים עם סירופ גלוקוז/שום',
      reason: 'פרוקטוז מרוכז המזין חיידקי מעי דק.',
    },
    {
      cat: 'dairy',
      item: 'משקאות מוגזים, בירה, מיצי פירות סחוטים, מסטיקים (גם ללא סוכר)',
      reason: 'הגזים והסוכרים האלכוהוליים משתקים את פעולת ה-MMC ומנפחים.',
    },
  ];

  const filterItems = (list: any[]) => {
    return list.filter((item) => {
      const matchCat = activeCategory === 'all' || item.cat === activeCategory;
      if (!matchCat) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        item.item.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q))
      );
    });
  };

  const filteredAllowed = filterItems(allowedList);
  const filteredForbidden = filterItems(forbiddenList);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>מדריך מהיר ומרוכז לגורגורילה</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              מה מותר ומה אסור ב-SIBO 🚦
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              כל המאכלים מחולקים לירוק (מותר ובטוח לחלוטין) ולאדום (אסור ומתסיס).
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-base transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש מהיר של מאכל או תבלין (למשל: שום, עוף, קישוא, שמן, פרמזן, דבש)..."
              className="w-full pl-4 pr-11 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeCategory === c.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Allowed & Forbidden Cards Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* ALLOWED (GREEN) */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base sm:text-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>מה מותר לאכול (אור ירוק 🟢)</span>
                </div>
                <span className="text-xs bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  {filteredAllowed.length} מאכלים
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredAllowed.length > 0 ? (
                  filteredAllowed.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 sm:p-3.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1"
                    >
                      <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{item.item}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed pr-4">
                        {item.note}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 text-center py-4">לא נמצאו מאכלים מותרים לחיפוש זה</p>
                )}
              </div>
            </div>

            {/* FORBIDDEN (RED) */}
            <div className="bg-rose-50/70 border-2 border-rose-300 rounded-3xl p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-base sm:text-lg">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>מה אסור לאכול (אור אדום 🔴)</span>
                </div>
                <span className="text-xs bg-rose-200/80 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                  {filteredForbidden.length} מאכלים
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredForbidden.length > 0 ? (
                  filteredForbidden.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 sm:p-3.5 rounded-2xl border border-rose-200 shadow-2xs space-y-1"
                    >
                      <div className="font-bold text-stone-900 text-xs sm:text-sm flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">✕</span>
                        <span>{item.item}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-rose-700 leading-relaxed pr-4">
                        <strong className="font-semibold">מדוע אסור: </strong>
                        {item.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 text-center py-4">לא נמצאו מאכלים אסורים לחיפוש זה</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-100 pt-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
            💡 טיפ זהב: שמן זית מושרה שום מותר ומומלץ! כל הארומה בלי אף גרם פרוקטן.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
