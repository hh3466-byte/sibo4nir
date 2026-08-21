import React, { useState } from 'react';
import { SIBO_MEDICAL_ARTICLES } from '../data/siboArticles';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const MedicalGuideView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'articles' | 'summary_tables' | 'faq'>('articles');

  return (
    <div id="medical-guide-view" className="w-full max-w-5xl mx-auto space-y-8">
      {/* Hero Intro */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ספרות ומחקרים רפואיים קליניים</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          עקרונות התזונה ומאמרים רפואיים ל-SIBO
        </h2>
        <p className="text-sm text-stone-600 max-w-2xl mx-auto">
          כל המידע באפליקציה מבוסס על פרוטוקולים בינלאומיים של גדולי המומחים לגסטרואנטרולוגיה: פרוטוקול
          ד״ר סיבקר, הדיאטה הדו-שלבית של ד״ר ג׳קובי, מחקרי אוניברסיטת מונאש והנחיות ACG.
        </p>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('articles')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'articles' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600'
            }`}
          >
            סקירת מאמרים ומחקרים 📚
          </button>
          <button
            onClick={() => setActiveSubTab('summary_tables')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'summary_tables' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600'
            }`}
          >
            טבלת מותר ואסור מרוכזת 📋
          </button>
          <button
            onClick={() => setActiveSubTab('faq')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeSubTab === 'faq' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600'
            }`}
          >
            שאלות ותשובות רפואיות 💡
          </button>
        </div>
      </div>

      {/* 1. ARTICLES REVIEW TAB */}
      {activeSubTab === 'articles' && (
        <div className="space-y-6">
          {SIBO_MEDICAL_ARTICLES.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900">{article.titleHe}</h3>
                  <p className="text-xs text-stone-400">{article.titleEn}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {article.year} | {article.source}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">{article.authors}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                  {article.summaryHe}
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>עקרונות מפתח קליניים:</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                  {article.keyTakeawaysHe.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical Impact */}
              <div className="text-xs text-emerald-900 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">השפעה טיפולית עבור ניר: </span>
                  <span>{article.clinicalImpactHe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. SUMMARY TABLES TAB */}
      {activeSubTab === 'summary_tables' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <h3 className="text-xl font-bold text-stone-900 border-b pb-3">
              מדריך מהיר: מה מותר ומה אסור לניר על פי הרפואה
            </h3>

            {/* Side-by-Side Allowed vs Forbidden */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ALLOWED (GREEN) */}
              <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base border-b border-emerald-200 pb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>מאכלים מותרים ובטוחים (אור ירוק 🟢)</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-stone-800">
                  <div>
                    <strong className="text-emerald-900 block font-semibold mb-1">חלבונים טהורים (0 תסיסה):</strong>
                    <p className="text-stone-600">חזה עוף טרי, הודו, דגים טריים (סלמון, לברק, דניס), ביצים, בקר טחון איכותי, טופו מוצק.</p>
                  </div>

                  <div>
                    <strong className="text-emerald-900 block font-semibold mb-1">ירקות דלי FODMAP:</strong>
                    <p className="text-stone-600">מלפפון, גזר מבושל, קישוא (עד 1/2 כוס), עלי תרד, חסה, עלי בצל ירוק (ירוקים בלבד!), עשבי תיבול טריים.</p>
                  </div>

                  <div>
                    <strong className="text-emerald-900 block font-semibold mb-1">שמנים ותבלינים בטוחים:</strong>
                    <p className="text-stone-600">שמן זית כתית מעולה, <strong>שמן זית מושרה שום (פטנט מעולה לטעם ללא פרוקטן)</strong>, ג׳ינג׳ר טרי, מלח, פלפל, טימין, רוזמרין.</p>
                  </div>

                  <div>
                    <strong className="text-emerald-900 block font-semibold mb-1">מוצרי חלב מותרים:</strong>
                    <p className="text-stone-600">חמאה מזוקקת (גהי), גבינות קשות מיושנות (פרמזן, צ׳דר, גאודה - ללא לקטוז), חלב שקדים לא ממותק.</p>
                  </div>

                  <div>
                    <strong className="text-emerald-900 block font-semibold mb-1">פירות בטוחים במנה מדודה:</strong>
                    <p className="text-stone-600">תות שדה (עד 6 יחידות), אוכמניות, תפוז, קלמנטינה, בננה ירוקה לא בשלה.</p>
                  </div>
                </div>
              </div>

              {/* FORBIDDEN (RED) */}
              <div className="bg-rose-50/50 border-2 border-rose-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-base border-b border-rose-200 pb-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>מאכלים אסורים בתכלית (אור אדום 🔴)</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-stone-800">
                  <div>
                    <strong className="text-rose-900 block font-semibold mb-1">שום ובצל (טרי, מבושל, אבקה):</strong>
                    <p className="text-stone-600">האויב מספר 1 של סיבו. עשיר בפרוקטנים שמזינים ומכפילים את החיידקים תוך דקות.</p>
                  </div>

                  <div>
                    <strong className="text-rose-900 block font-semibold mb-1">דגני חיטה וגלוטן:</strong>
                    <p className="text-stone-600">לחם רגיל, פיתות, חלות, פסטה רגילה, עוגות, ביסקוויטים ובורקסים.</p>
                  </div>

                  <div>
                    <strong className="text-rose-900 block font-semibold mb-1">קטניות וסויה:</strong>
                    <p className="text-stone-600">גרגרי חומוס, ממרח חומוס, שעועית, עדשים, פולי סויה (עשירים ב-GOS שמתסיס בטירוף).</p>
                  </div>

                  <div>
                    <strong className="text-rose-900 block font-semibold mb-1">חלב ניגר ולקטוז:</strong>
                    <p className="text-stone-600">חלב פרה רגיל, יוגורט רגיל, גלידות, גבינה לבנה, קוטג׳, ריקוטה.</p>
                  </div>

                  <div>
                    <strong className="text-rose-900 block font-semibold mb-1">פירות עתירי פרוקטוז וסורביטול:</strong>
                    <p className="text-stone-600">תפוחים, אגסים, אבטיח, מנגו, דובדבנים, תמרים וכל הפירות היבשים.</p>
                  </div>

                  <div>
                    <strong className="text-rose-900 block font-semibold mb-1">ממתיקים מלאכותיים וסוכרים:</strong>
                    <p className="text-stone-600">דבש, סירופ תירס, קסיליטול, סורביטול, מניטול, מסטיקים ללא סוכר, חטיפי דיאט.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FAQ TAB */}
      {activeSubTab === 'faq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-stone-900 border-b pb-3">
            שאלות ותשובות קריטיות לטיפול בסיבו של ניר
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>מדוע חשוב לשמור על 4 שעות מרווח בין ארוחות (מנגנון ה-MMC)?</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                המעי הדק מנקה את עצמו באמצעות גל שטיפה חשמלי שנקרא <strong>MMC (Migrating Motor Complex)</strong>.
                גל זה פועל אך ורק כאשר הקיבה והמעי ריקים במשך 90-120 דקות לפחות. אם ניר מנשנשת אפילו חתיכת פרי קטנה
                או לועסת מסטיק, גל הניקיון נעצר מיד, ושרידי המזון והחיידקים נשארים תקועים במעי הדק.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>מדוע שום אסור לחלוטין, אך שמן זית מושרה שום מותר?</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                מולקולות הפרוקטן (הסוכר המתסיס שבשום) הן <strong>הידרופיליות (מסיסות במים בלבד)</strong>. הן אינן מסיסות בשמן.
                לכן, כאשר משרים שיני שום בשמן זית ומסננים את החלקיקים המוצקים, מקבלים את הארומה והטעם הנהדרים של השום
                מבלי שאף מולקולת פרוקטן תעבור לשמן! זהו פתרון קסם שמשנה את חוויית האוכל עבור ניר.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>מדוע גבינות קשות מיושנות כמו פרמזן מותרות לחולי סיבו?</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                בתהליך היישון של גבינות קשות (כמו פרמזן, צ׳דר אמיתי, מנצ׳גו), החיידקים הטבעיים של הגבינה צורכים ומפרקים
                את כל סוכר הלקטוז. בגבינה מיושנת נותרו פחות מ-0.1 גרם לקטוז ל-100 גרם, מה שהופך אותה לדלת FODMAP לחלוטין.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>מה לעשות אם ניר אכלה בטעות מאכל אסור עם שום או בצל?</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                מומלץ לשתות חליטת ג׳ינג׳ר טרי או תה מנטה (מרפה שריר חלק ומאיץ ריקון קיבה), לבצע הליכה קלה, להימנע
                מארוחה נוספת עד שהבטן נרגעת, ולהניח כרית חימום על הבטן. אין סיבה לפאניקה - הגוף יתנקה תוך 24-48 שעות.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
