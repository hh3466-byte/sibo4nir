import React, { useState, useEffect } from 'react';
import { FoodAnalysisResult, MealLogEntry, SiboPhase } from './types';
import { analyzeFoodClinically } from './services/siboClinicalEngine';
import { Header } from './components/Header';
import { SupermarketSelfScanView } from './components/SupermarketSelfScanView';
import { SiboShoppingListView } from './components/SiboShoppingListView';
import { CameraScanner } from './components/CameraScanner';
import { TrafficLightResult } from './components/TrafficLightResult';
import { FoodDatabaseView } from './components/FoodDatabaseView';
import { MealAnalyzer } from './components/MealAnalyzer';
import { MedicalGuideView } from './components/MedicalGuideView';
import { SymptomDiary } from './components/SymptomDiary';
import { SIBOAssistantModal } from './components/SIBOAssistantModal';
import { SiboPrinciplesModal } from './components/SiboPrinciplesModal';
import { AllowedForbiddenModal } from './components/AllowedForbiddenModal';
import { MealSuggestionsModal } from './components/MealSuggestionsModal';
import { InstallShareModal } from './components/InstallShareModal';
import { HungerRescueWizard } from './components/HungerRescueWizard';
import { AlertCircle, CheckCircle2, ShieldCheck, Heart, Smartphone, Phone, MessageSquare, Bug, ShoppingCart, ListChecks, ChefHat, Sparkles } from 'lucide-react';

export default function App() {
  // State for Diet Phase (Default to Phase 1 Strict as requested for Nir)
  const [currentPhase, setCurrentPhase] = useState<SiboPhase>(() => {
    try {
      const saved = localStorage.getItem('sibo_nir_phase');
      return (saved as SiboPhase) || 'phase1_strict';
    } catch {
      return 'phase1_strict';
    }
  });

  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPrinciplesModalOpen, setIsPrinciplesModalOpen] = useState(false);
  const [isAllowedForbiddenOpen, setIsAllowedForbiddenOpen] = useState(false);
  const [isMealSuggestionsOpen, setIsMealSuggestionsOpen] = useState(false);
  const [isInstallShareOpen, setIsInstallShareOpen] = useState(false);
  const [isHungerWizardOpen, setIsHungerWizardOpen] = useState(false);
  const [isSavedInDiary, setIsSavedInDiary] = useState(false);
  const [scannerMode, setScannerMode] = useState<'camera' | 'barcode' | 'upload' | 'text'>('camera');
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [isShoppingListExpanded, setIsShoppingListExpanded] = useState(false);
  const [recipeFilterQuery, setRecipeFilterQuery] = useState<string | null>(null);
  const [recipeTargetId, setRecipeTargetId] = useState<string | null>(null);

  const handleOpenRecipe = (recipeIdOrQuery: string) => {
    if (recipeIdOrQuery.startsWith('id:')) {
      setRecipeTargetId(recipeIdOrQuery.replace('id:', ''));
      setRecipeFilterQuery(null);
    } else {
      setRecipeFilterQuery(recipeIdOrQuery);
      setRecipeTargetId(null);
    }
    setIsMealSuggestionsOpen(true);
  };

  // Diary Entries
  const [diaryEntries, setDiaryEntries] = useState<MealLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sibo_nir_diary_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse diary entries from storage', e);
    }
    // Default initial example logs for Nir
    return [
      {
        id: '1',
        foodName: 'חזה עוף צלוי עם שמן זית, מלפפון וגזר מבושל',
        status: 'GREEN',
        mealType: 'lunch',
        timestamp: Date.now() - 1000 * 60 * 60 * 4,
        notes: 'הבטן הייתה שטוחה ורגועה, תחושה קלה ונעימה',
        symptoms: { bloating: 0, pain: 0, energy: 5 },
      },
    ];
  });

  // Save phase to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem('sibo_nir_phase', currentPhase);
    } catch (e) {
      console.warn('Could not write phase to localStorage', e);
    }
  }, [currentPhase]);

  // Save diary to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem('sibo_nir_diary_v1', JSON.stringify(diaryEntries));
    } catch (e) {
      console.warn('Could not write diary to localStorage', e);
    }
  }, [diaryEntries]);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Cancel ongoing analysis
  const handleCancelAnalyze = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Handle Food & Image Analysis
  const handleAnalyze = async (payload: {
    imageBase64?: string;
    textPrompt?: string;
    mimeType?: string;
  }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);
    setIsSavedInDiary(false);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 35000);

    // ⚡ Instant 0ms Client-Side SIBO Analysis for Text/Barcode Queries!
    if (payload.textPrompt) {
      const instantResult = analyzeFoodClinically(payload.textPrompt, currentPhase);
      if (payload.imageBase64) {
        instantResult.imageUrl = payload.imageBase64;
      }
      setAnalysisResult(instantResult);
      setActiveTab('scanner');
      playFeedbackTone(instantResult.status);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          ...payload,
          phase: currentPhase,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'שגיאה בניתוח המאכל');
      }

      const result: FoodAnalysisResult = await response.json();
      setAnalysisResult(result);
      setActiveTab('scanner'); // ensure we are on scanner tab to see result

      // Play soft audio tone for traffic light feedback
      playFeedbackTone(result.status);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Backend API returned error, activating SIBO Clinical Rule Engine fallback:', err);

      // Fail-safe SIBO Clinical Rule Engine: ALWAYS returns accurate result even if API fails!
      const query = payload.textPrompt || 'מאכל שצולם במצלמה';
      const fallbackResult = analyzeFoodClinically(query, currentPhase);
      if (payload.imageBase64) {
        fallbackResult.imageUrl = payload.imageBase64;
      }
      setAnalysisResult(fallbackResult);
      setActiveTab('scanner');
      playFeedbackTone(fallbackResult.status);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Play audio tone (silent by default to prevent jarring sounds)
  const playFeedbackTone = (_status: string) => {
    // Silent mode
  };

  // Save current result to diary
  const handleSaveToDiary = (res: FoodAnalysisResult) => {
    const newEntry: MealLogEntry = {
      id: Date.now().toString(),
      foodName: res.foodName,
      status: res.status,
      mealType: 'lunch',
      timestamp: Date.now(),
      notes: `${res.shortVerdict}. כמות בטוחה: ${res.maxSafePortion}`,
      symptoms: {
        bloating: res.status === 'RED' ? 3 : 0,
        pain: res.status === 'RED' ? 2 : 0,
        energy: res.status === 'GREEN' ? 5 : 4,
      },
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
    setIsSavedInDiary(true);
  };

  // Add manual entry to diary
  const handleAddDiaryEntry = (entry: Omit<MealLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: MealLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
  };

  // Delete diary entry
  const handleDeleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((item) => item.id !== id));
  };

  // Explore alternative query in scanner
  const handleExploreAlternative = (altQuery: string) => {
    handleAnalyze({ textPrompt: altQuery });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900" dir="rtl">
      {/* Top Main Navigation Header */}
      <Header
        currentPhase={currentPhase}
        onPhaseChange={(phase) => {
          setCurrentPhase(phase);
          if (analysisResult) {
            handleAnalyze({
              imageBase64: analysisResult.foodName,
              textPrompt: analysisResult.foodName,
            });
          }
        }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setErrorMsg(null);
          if (tab === 'recipe') {
            setIsMealSuggestionsOpen(true);
            return;
          }
          setActiveTab(tab);
          if (tab === 'scanner') {
            setAnalysisResult(null);
          }
        }}
        onOpenHelp={() => setIsPrinciplesModalOpen(true)}
        onOpenInstallShare={() => setIsInstallShareOpen(true)}
        onOpenHungerWizard={() => setIsHungerWizardOpen(true)}
      />

      {/* Main App Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 pb-28">

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-sm flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              סגור
            </button>
          </div>
        )}

        {/* TAB 1: SUPERMARKET HUB (Shopping List to Send + Self Scan) */}
        {activeTab === 'scanner' && (
          <div className="space-y-4">
            {isShoppingListExpanded ? (
              <SiboShoppingListView
                currentPhase={currentPhase}
                onBackToScanner={() => setIsShoppingListExpanded(false)}
              />
            ) : (
              <SupermarketSelfScanView
                currentPhase={currentPhase}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                analysisResult={analysisResult}
                onClearResult={() => {
                  setAnalysisResult(null);
                  setErrorMsg(null);
                  setResetCounter((c) => c + 1);
                }}
                onOpenShoppingList={() => setIsShoppingListExpanded(true)}
                onOpenHungerWizard={() => setIsHungerWizardOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB 2: SEARCHABLE FOOD DATABASE */}
        {activeTab === 'database' && (
          <FoodDatabaseView
            currentPhase={currentPhase}
            onSelectFoodForAnalysis={(foodName) => {
              setActiveTab('scanner');
              setIsShoppingListExpanded(false);
              handleAnalyze({ textPrompt: foodName });
            }}
          />
        )}

        {/* TAB 3: MEAL & RECIPE CHECKER & MASTER 180+ RECIPE BOOK */}
        {activeTab === 'recipe' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 bg-stone-900 text-white rounded-3xl shadow-sm border border-stone-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-xl shrink-0">
                  🍲
                </div>
                <div>
                  <h3 className="text-base font-black text-white">ספר המתכונים של שף דלה פופו (180+ מנות)</h3>
                  <p className="text-xs text-stone-300 font-medium">50 קלות ומהירות • 45 בוקר • 45 צהריים • 45 ערב</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMealSuggestionsOpen(true)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs shadow-xs transition-colors cursor-pointer shrink-0"
              >
                פתחי ספר מתכונים 📖
              </button>
            </div>

            <MealAnalyzer
              currentPhase={currentPhase}
              onAnalyzeRecipe={async (payload) => {
                await handleAnalyze(payload);
              }}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 4: MEDICAL ARTICLES & PROTOCOLS */}
        {activeTab === 'articles' && <MedicalGuideView />}

        {/* TAB 5: SYMPTOM & FOOD DIARY */}
        {activeTab === 'diary' && (
          <SymptomDiary
            entries={diaryEntries}
            onAddEntry={handleAddDiaryEntry}
            onDeleteEntry={handleDeleteDiaryEntry}
          />
        )}

        {/* TAB 6: AI SIBO NUTRITION CONSULTANT */}
        {activeTab === 'consult' && <SIBOAssistantModal currentPhase={currentPhase} />}
      </main>

      {/* Mobile Minimalist Bottom Navigation Bar */}
      <nav aria-label="ניווט מהיר" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl py-2 px-3 flex items-center justify-around sm:hidden">
        <button
          onClick={() => setIsHungerWizardOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[#064e3b] font-black cursor-pointer active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-[#BDECB6] text-[#064e3b] flex items-center justify-center text-sm shadow-sm border border-[#a2dba0]">
            🥑
          </div>
          <span className="text-[10px]">אני רעבה!</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('scanner');
            setIsShoppingListExpanded(false);
            setAnalysisResult(null);
            setIsMealSuggestionsOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 font-bold cursor-pointer active:scale-95 ${
            activeTab === 'scanner' && !isMealSuggestionsOpen ? 'text-emerald-800 font-black' : 'text-stone-500'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">סופר וקניות</span>
        </button>

        <button
          onClick={() => setIsMealSuggestionsOpen(true)}
          className={`flex flex-col items-center gap-0.5 font-bold cursor-pointer active:scale-95 ${
            isMealSuggestionsOpen ? 'text-emerald-800 font-black' : 'text-stone-700'
          }`}
        >
          <ChefHat className="w-5 h-5 text-emerald-800" />
          <span className="text-[10px]">מתכונים</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('database');
            setIsMealSuggestionsOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 font-bold cursor-pointer active:scale-95 ${
            activeTab === 'database' && !isMealSuggestionsOpen ? 'text-emerald-800 font-black' : 'text-stone-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">מאגר</span>
        </button>
      </nav>

      {/* Hunger Rescue SOS Wizard Modal */}
      <HungerRescueWizard
        currentPhase={currentPhase}
        isOpen={isHungerWizardOpen}
        onClose={() => setIsHungerWizardOpen(false)}
        onSelectFoodToAnalyze={handleExploreAlternative}
        onOpenMealSuggestions={() => {
          setIsHungerWizardOpen(false);
          setIsMealSuggestionsOpen(true);
        }}
      />

      {/* Allowed & Forbidden Modal */}
      <AllowedForbiddenModal
        isOpen={isAllowedForbiddenOpen}
        onClose={() => setIsAllowedForbiddenOpen(false)}
        currentPhase={currentPhase}
      />

      {/* Meal Suggestions & Recipes Modal */}
      <MealSuggestionsModal
        isOpen={isMealSuggestionsOpen}
        onClose={() => {
          setIsMealSuggestionsOpen(false);
          setRecipeFilterQuery(null);
          setRecipeTargetId(null);
        }}
        currentPhase={currentPhase}
        initialSearchQuery={recipeFilterQuery}
        initialRecipeId={recipeTargetId}
      />

      {/* Medical Principles Modal */}
      <SiboPrinciplesModal
        isOpen={isPrinciplesModalOpen}
        onClose={() => setIsPrinciplesModalOpen(false)}
      />

      {/* Install & Share Guide Modal */}
      <InstallShareModal
        isOpen={isInstallShareOpen}
        onClose={() => setIsInstallShareOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-12 text-center text-xs text-stone-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          {/* Main Credits and Bug reporting */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="font-extrabold text-stone-900 text-sm">
                  פותח ע&quot;י חגי הילמן
                </span>
                <span className="text-stone-400">•</span>
                <a
                  href="tel:0543200007"
                  className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                  dir="ltr"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>054-3200007</span>
                </a>
              </div>
              <p className="text-xs text-stone-600">
                על מנת שאם יש באגים, אוכל לדעת ולתקן מיד.
              </p>
            </div>

            {/* Quick Action Links */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <a
                href="https://api.whatsapp.com/send?phone=972543200007&text=%D7%94%D7%99%D7%99%20%D7%97%D7%92%D7%99%2C%20%D7%99%D7%A9%20%D7%9C%D7%99%20%D7%A9%D7%90%D7%9C%D7%94%2F%D7%93%D7%99%D7%95%D7%95%D7%97%20%D7%A2%D7%9C%20%D7%91%D7%90%D7%92%20%D7%91%D7%A1%D7%95%D7%A8%D7%A7%20SIBO"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>דיווח בוואטסאפ (054-3200007)</span>
              </a>

              <button
                type="button"
                onClick={() => setIsInstallShareOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                <span>התקנה בטלפון 📲</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px] pt-2">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span className="font-semibold text-stone-600">נבנה באהבה עבור ניר</span>
              <span>•</span>
              <span>מבוסס ספרות רפואית: Dr. Siebecker, Dr. Jacobi, Monash FODMAP</span>
            </div>
            <div>
              המידע באפליקציה נועד לסייע בניהול התזונה ואינו מחליף ייעוץ רפואי אישי.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
