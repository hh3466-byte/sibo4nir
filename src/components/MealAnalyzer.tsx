import React, { useState, useRef, useEffect } from 'react';
import { SiboPhase } from '../types';
import {
  ChefHat,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Camera,
  Upload,
  Mic,
  MicOff,
  Image as ImageIcon,
  RotateCcw,
  X,
  FileText,
  Volume2,
} from 'lucide-react';

interface MealAnalyzerProps {
  currentPhase: SiboPhase;
  onAnalyzeRecipe: (payload: { textPrompt?: string; imageBase64?: string; mimeType?: string }) => Promise<void>;
  isLoading: boolean;
}

export const MealAnalyzer: React.FC<MealAnalyzerProps> = ({
  currentPhase,
  onAnalyzeRecipe,
  isLoading,
}) => {
  const [recipeInput, setRecipeInput] = useState('');
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [stagedMimeType, setStagedMimeType] = useState<string>('image/jpeg');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // File Inputs for Photo & Camera
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // 100% Safe SIBO Chef Recipes (0% Garlic, 0% Onion, 0% Gluten, 0% Fermentation)
  const safeChefRecipes = [
    {
      title: '🍲 מוקפץ עוף אסייתי בטוח ל-SIBO',
      badge: '0% שום • 0% בצל • 0% גלוטן',
      text: 'חזה עוף מוקפץ בשמן זית מושרה שום (Garlic Oil), עלי בצל ירוק (ירוק בלבד), קישוא, מקלות גזר, ג׳ינג׳ר טרי ורוטב תמרי ללא גלוטן',
    },
    {
      title: '🥗 סלט ירקות וטחינה בטוח',
      badge: 'ללא בצל • 0% תסיסה',
      text: 'מלפפונים קלופים, עגבנייה קלופה, עלי שמיר, פטרוזיליה, שמן זית, מיץ לימון וטחינה גולמית 100% (ללא בצל וללא שום)',
    },
    {
      title: '🥣 מרק עוף זהוב מרגיע בטן',
      badge: 'ללא בצל • ללא אבקות מרק',
      text: 'כרעי עוף טריים, גזר, קישוא, ג׳ינג׳ר טרי, ענף שמיר, מלח ים ושמן שום מושרה (ללא בצל וללא אבקות מרק)',
    },
    {
      title: '🍳 ארוחת בוקר קלה ומזינה',
      badge: '0% לקטוז • עשיר בחלבון',
      text: 'שתי ביצי עין בשמן זית, מקלות מלפפון, תותים טריים, חלב שקדים ללא סוכר וגבינת פרמזן מיושנת (0% לקטוז)',
    },
    {
      title: '🍳 שקשוקה ביתית בטוחה ל-SIBO',
      badge: 'ללא בצל • שמן שום מושרה',
      text: 'עגבניות טריות מרוסקות, שמן זית מושרה שום (Garlic Oil), עלי בצל ירוק (ירוק בלבד), כמון, פפריקה ו-2 ביצים טריות',
    },
    {
      title: '🐟 פילה סלמון עסיסי בעשבי תיבול',
      badge: 'אומגה 3 • דל FODMAP',
      text: 'פילה סלמון טרי עם שמן זית, עשבי תיבול טריים (שמיר ופטרוזיליה), מיץ לימון, מלח ים ואורז בסמטי',
    },
  ];

  // Common Trigger Dishes for Testing the Scanner (To see how SIBO AI detects forbidden items & fixes them)
  const testTriggerRecipes = [
    {
      title: 'מוקפץ עוף רגיל במסעדה (מכיל שום, בצל, פטריות ונודלס מחיטה)',
      expectedStatus: '🔴 בדיקת איתור שום, בצל וגלוטן',
      text: 'חזה עוף מוקפץ עם שום, בצל, קישוא, פטריות שמפיניון, רוטב סויה, כרובית ונודלס מחיטה',
    },
    {
      title: 'סלט ישראלי רגיל (מכיל בצל חי וגרגרי חומוס)',
      expectedStatus: '🔴 בדיקת איתור בצל חי וקטניות',
      text: 'עגבניות, מלפפונים, בצל סגול, פטרוזיליה, שמן זית, מיץ לימון, טחינה גולמית וגרגרי חומוס',
    },
    {
      title: 'מרק עוף מסורתי (מכיל בצל שלם ושיני שום)',
      expectedStatus: '🔴 בדיקת איתור שום ובצל במרק',
      text: 'כרעי עוף, גזר, קישוא, שורש סלרי, בצל שלם, שיני שום, פטרוזיליה ושמיר',
    },
  ];

  // Speech Recognition Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Web Speech API for Hebrew Voice Dictation
  const handleToggleVoiceInput = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError('הדפדפן שלך אינו תומך בהקראה קולית ישירה. מומלץ להשתמש ב-Google Chrome או Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.lang = 'he-IL';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim()) {
          setRecipeInput((prev) => {
            if (!prev.trim()) return transcript.trim();
            // If already ends with punctuation or space, append cleanly
            const separator = prev.endsWith(' ') || prev.endsWith(',') ? '' : ', ';
            return `${prev}${separator}${transcript.trim()}`;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error in recipe checker:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('יש לאשר גישה למיקרופון בהגדרות הדפדפן כדי להקריא מתכון.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('לא נקלט קול, לחצי שוב על המיקרופון ודברי.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      setSpeechError('שגיאה בהפעלת המיקרופון. אנא נסי שוב.');
    }
  };

  // Process selected file (High-Res for OCR readability)
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setStagedImage(compressedDataUrl);
          setStagedMimeType('image/jpeg');
        } else {
          setStagedImage(rawDataUrl);
          setStagedMimeType(file.type || 'image/jpeg');
        }
      };
      img.onerror = () => {
        setStagedImage(rawDataUrl);
        setStagedMimeType(file.type || 'image/jpeg');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (stagedImage) {
      onAnalyzeRecipe({
        imageBase64: stagedImage,
        mimeType: stagedMimeType,
        textPrompt: recipeInput.trim() || undefined,
      });
      return;
    }

    if (!recipeInput.trim()) return;
    onAnalyzeRecipe({ textPrompt: recipeInput.trim() });
  };

  return (
    <div id="meal-analyzer-container" className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
          <ChefHat className="w-4 h-4 text-emerald-700" />
          <span>בדיקת מתכונים • המלצת שֵׁף דַּלָּה פּוּפוּ 👨‍🍳</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          בודק מנות, מתכונים ותפריטים — המלצת שֵׁף דַּלָּה פּוּפוּ 🍳
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          מתכננת לבשל מנה או מזמינה במסעדה? הקלידי, הקריאי במיקרופון או צלמי את המתכון / התפריט — המערכת תפרק כל רכיב, תסמן באור אדום את מה שמתסיס ותציע חלופות מותאמות לניר.
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-stone-200 shadow-md space-y-5">
        {/* Action Toolbar: Camera, Gallery, Microphone Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-stone-100/90 rounded-2xl border border-stone-200/80">
          <span className="text-xs font-bold text-stone-700 px-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>איך תרצי להזין את המתכון?</span>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Camera Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-2 bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 border border-stone-300 hover:border-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>📸 צלמי מתכון / תפריט</span>
            </button>

            {/* Gallery Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 border border-stone-300 hover:border-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>🖼️ העלאת תמונה</span>
            </button>

            {/* Microphone Dictation Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-500/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-bounce" />
                  <span>⏹️ סיום הקראה</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-emerald-200" />
                  <span>🎙️ הקראה קולית</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Listening Banner when Mic Active */}
        {isListening && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border-2 border-rose-300 flex items-center justify-between gap-3 text-rose-950 text-xs sm:text-sm animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <strong className="font-extrabold">מקשיב עכשיו...</strong>
              <span>דברי חופשי (למשל: &quot;סלט עם חסה, מלפפון, גבינת פטה ורוטב שמן זית&quot;)</span>
            </div>
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0"
            >
              סיום
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
            <span>⚠️ {speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-amber-800 font-bold hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* Staged Image Preview (When User Takes Photo / Uploads Image) */}
        {stagedImage && (
          <div className="p-4 rounded-2xl bg-stone-50 border-2 border-emerald-400 space-y-3 animate-scaleIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>התמונה נקלטה בהצלחה! צפי בתצוגה המקדימה:</span>
              </span>
              <button
                type="button"
                onClick={() => setStagedImage(null)}
                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-all cursor-pointer"
              >
                ✕ הסר תמונה
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden max-h-64 sm:max-h-80 bg-black flex items-center justify-center">
              <img
                src={stagedImage}
                alt="מתכון מצולם"
                className="max-h-64 sm:max-h-80 w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              <span className="text-xs text-stone-500">
                💡 המערכת תקרא את הטקסט בתמונה ותנתח כל רכיב מול פרוטוקול SIBO.
              </span>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>מנתח תמונה...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>בדוק מתכון מצולם זה 🚦</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Text Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="recipe-textarea"
                className="block text-xs font-extrabold text-stone-800 uppercase tracking-wider"
              >
                {stagedImage ? 'הוסיפי הערות או פירוט למתכון המצולם (אופציונלי):' : 'רשימת הרכיבים או תיאור המנה:'}
              </label>
              {recipeInput && (
                <button
                  type="button"
                  onClick={() => setRecipeInput('')}
                  className="text-[11px] text-stone-400 hover:text-stone-700 font-bold"
                >
                  נקה טקסט
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                id="recipe-textarea"
                rows={4}
                value={recipeInput}
                onChange={(e) => setRecipeInput(e.target.value)}
                placeholder="למשל: סלט עם חסה, עגבניות שרי, מלפפון, בצל ירוק, גבינת פטה, אגוזי מלך ורוטב שמן זית ולימון..."
                className="w-full p-4 bg-stone-50 focus:bg-white border-2 border-stone-300 focus:border-emerald-500 rounded-2xl text-sm sm:text-base focus:ring-4 focus:ring-emerald-500/10 focus:outline-hidden transition-all resize-none font-medium text-stone-900 leading-relaxed"
              />

              {/* Quick Inline Action Pills inside textarea corner */}
              <div className="absolute left-3 bottom-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`p-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-stone-200 hover:bg-emerald-600 hover:text-white text-stone-700'
                  }`}
                  title="הקראה קולית"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-2 rounded-xl bg-stone-200 hover:bg-emerald-600 hover:text-white text-stone-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="צילום במצלמה"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-xs text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>ניתוח רכיב-אחר-רכיב מול פרוטוקול ד&quot;ר סיבקר וד&quot;ר ג׳קובי</span>
            </span>

            <button
              type="submit"
              disabled={isLoading || (!recipeInput.trim() && !stagedImage)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:from-stone-300 disabled:to-stone-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>מנתח מתכון...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5" />
                  <span>בדוק והתאם ל-SIBO 🚦</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* 100% SIBO-Safe Chef Recommendations */}
        <div className="pt-6 border-t border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-emerald-600" />
              <span>מתכוני שֵׁף דַּלָּה פּוּפוּ בטוחים ב-100% (ללא שום, ללא בצל, 0% תסיסה):</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              0% פרוקטנים
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {safeChefRecipes.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRecipeInput(item.text);
                  setStagedImage(null);
                  onAnalyzeRecipe({ textPrompt: item.text });
                }}
                className="text-right p-3.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-500 transition-all text-xs space-y-1.5 group cursor-pointer shadow-2xs hover:shadow-sm active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 group-hover:text-emerald-950">
                    {item.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-[-2px] rtl:rotate-180 transition-transform shrink-0" />
                </div>
                <span className="inline-block text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {item.badge}
                </span>
                <p className="text-stone-600 text-[11px] line-clamp-2 leading-relaxed">{item.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostic / Testing Section for Scanner Detection */}
        <div className="pt-4 border-t border-dashed border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>דוגמאות לבדיקת יכולת הזיהוי של הסורק (מנות רגילות עם שום, בצל או גלוטן):</span>
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              בדיקת רמזור אדום 🚦
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {testTriggerRecipes.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRecipeInput(item.text);
                  setStagedImage(null);
                  onAnalyzeRecipe({ textPrompt: item.text });
                }}
                className="text-right p-3 rounded-xl bg-stone-50 hover:bg-rose-50/60 border border-stone-200 hover:border-rose-300 transition-all text-xs space-y-1 group cursor-pointer shadow-2xs active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 group-hover:text-rose-950 text-[11px]">
                    {item.title}
                  </span>
                </div>
                <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                  {item.expectedStatus}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
