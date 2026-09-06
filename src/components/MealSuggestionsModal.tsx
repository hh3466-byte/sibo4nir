import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Sparkles,
  ChefHat,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Coffee,
  Sun,
  Moon,
  Search,
  X,
  Mic,
  MicOff,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { SiboRecipe, SIBO_MEAL_SUGGESTIONS, findMatchingRecipes } from '../data/siboMealSuggestions';
import { SiboPhase } from '../types';
import { CategoryCarousel } from './CategoryCarousel';
// High-entropy 32-bit FNV-1a PRNG for true, rich, non-repeating roulette shuffling
function getSeededScore(id: string, seed: number): number {
  let h = 0x811c9dc5;
  const s = `${id}_${seed}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

interface MealSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: SiboPhase;
  initialSearchQuery?: string | null;
  initialRecipeId?: string | null;
}

export const MealSuggestionsModal: React.FC<MealSuggestionsModalProps> = ({
  isOpen,
  onClose,
  currentPhase,
  initialSearchQuery = null,
  initialRecipeId = null,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<SiboRecipe | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Favorites & 5-Star Ratings State with LocalStorage Persistence
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sibo_recipe_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sibo_recipe_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Checked Ingredients State (Interactive check pills, persisted across sessions)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sibo_checked_ingredients');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Collapsed recipes override (by default all recipes are open, user can collapse if desired)
  const [collapsedRecipes, setCollapsedRecipes] = useState<Record<string, boolean>>({});

  // Pagination for smooth 60fps rendering of 200+ recipes
  const [visibleCount, setVisibleCount] = useState<number>(15);

  const toggleIngredientCheck = (key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCheckedIngredients((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('sibo_checked_ingredients', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleCollapse = (recipeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCollapsedRecipes((prev) => ({
      ...prev,
      [recipeId]: !prev[recipeId],
    }));
  };

  const handleToggleFavorite = (recipeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [recipeId]: !prev[recipeId] };
      try {
        localStorage.setItem('sibo_recipe_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSetRating = (recipeId: string, rating: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRatings((prev) => {
      const current = prev[recipeId] || 0;
      const nextVal = current === rating ? 0 : rating;
      const next = { ...prev, [recipeId]: nextVal };
      try {
        localStorage.setItem('sibo_recipe_ratings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Dynamic Shuffling seed per category so each category can be shuffled independently!
  const [categorySeeds, setCategorySeeds] = useState<Record<string, number>>(() => ({
    all: Math.floor(Math.random() * 1000),
  }));
  const [isShuffling, setIsShuffling] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleShuffleRecipes = () => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 500);
    setCategorySeeds((prev) => ({
      ...prev,
      [selectedMealType]: (prev[selectedMealType] || Math.floor(Math.random() * 1000)) + 1,
    }));
    setSelectedRecipe(null);
    setVisibleCount(15);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset pagination when query, category, or shuffle changes
  useEffect(() => {
    setVisibleCount(15);
  }, [searchQuery, selectedMealType, categorySeeds]);

  // Synchronize initial query and recipe ID when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedRecipe(null);
      setSearchQuery('');
      setSelectedMealType('all');
      setIsListening(false);
      setSpeechError(null);
      return;
    }

    setCategorySeeds((prev) => ({
      ...prev,
      all: (prev.all || 0) + 1,
    }));

    if (initialRecipeId) {
      const found = SIBO_MEAL_SUGGESTIONS.find((r) => r.id === initialRecipeId);
      if (found) {
        setSelectedRecipe(found);
        setSelectedMealType(found.mealType as any);
        return;
      }
    }

    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchQuery(initialSearchQuery.trim());
      setSelectedMealType('all');
      const matches = findMatchingRecipes(initialSearchQuery, 1);
      if (matches.length === 1 && (initialSearchQuery.includes('מרק') || initialSearchQuery.includes('שקשוקה'))) {
        setSelectedRecipe(matches[0]);
      }
    } else {
      setSearchQuery('');
      setSelectedRecipe(null);
      setSelectedMealType('all');
    }
  }, [isOpen, initialRecipeId, initialSearchQuery]);

  // Speech Recognition Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Toggle Voice Input Recognition (Hebrew)
  const handleToggleVoiceInput = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('הדפדפן אינו תומך בזיהוי קולי ישיר. ניתן להקליד חופשי בתיבת החיפוש.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
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
          setSearchQuery(transcript);
          if (selectedRecipe) setSelectedRecipe(null);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('גישה למיקרופון נחסמה. אנא אשרי הרשאת מיקרופון בדפדפן.');
        } else if (event.error === 'no-speech') {
          setSpeechError('לא נקלט קול, אנא נסי שוב.');
        } else {
          setSpeechError('שגיאת זיהוי קולי: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError('לא ניתן להפעיל מיקרופון: ' + (err?.message || 'שגיאה כללית'));
    }
  };

  // Counts by all categories and meal types
  const favoritesCount = useMemo(() => {
    return Object.values(favorites).filter(Boolean).length;
  }, [favorites]);

  const categoryCounts = useMemo(() => {
    const raw = SIBO_MEAL_SUGGESTIONS;
    return {
      all: raw.length,
      favorites: favoritesCount,
      prep_3min: raw.filter((m) => {
        const num = m.prepTime ? m.prepTime.match(/\d+/) : null;
        return num && parseInt(num[0], 10) <= 3;
      }).length,
      prep_7min: raw.filter((m) => {
        const num = m.prepTime ? m.prepTime.match(/\d+/) : null;
        const val = num ? parseInt(num[0], 10) : 5;
        return (
          (val >= 4 && val <= 7) ||
          m.prepTime.includes('7 דקות') ||
          m.prepTime.includes('6 דקות') ||
          m.prepTime.includes('5 דקות') ||
          m.prepTime.includes('4 דקות')
        );
      }).length,
      meat: raw.filter((m) => m.category === 'meat').length,
      steaks: raw.filter((m) => m.category === 'steaks').length,
      fish: raw.filter((m) => m.category === 'fish').length,
      bowls: raw.filter((m) => m.category === 'bowls').length,
      soups: raw.filter((m) => m.category === 'soups').length,
      wraps: raw.filter((m) => m.category === 'wraps').length,
      pancakes: raw.filter((m) => m.category === 'pancakes').length,
      sweet: raw.filter((m) => m.category === 'sweet').length,
      chia_puddings: raw.filter((m) => m.category === 'chia_puddings').length,
      cheese: raw.filter((m) => m.category === 'cheese').length,
      eggs: raw.filter((m) => m.category === 'eggs').length,
      salads: raw.filter((m) => m.category === 'salads').length,
      smoothies: raw.filter((m) => m.category === 'smoothies').length,
      instant: raw.filter((m) => m.category === 'instant').length,
      breakfast: raw.filter((m) => m.mealType === 'breakfast').length,
      lunch: raw.filter((m) => m.mealType === 'lunch').length,
      dinner: raw.filter((m) => m.mealType === 'dinner').length,
      dessert: raw.filter(
        (m) =>
          m.mealType === 'dessert' ||
          m.category === 'sweet' ||
          m.category === 'chia_puddings'
      ).length,
    };
  }, [favoritesCount]);

  const categoryItems = useMemo(
    () => [
      { id: 'favorites', label: 'אהבתי', icon: '❤️', count: categoryCounts.favorites },
      { id: 'prep_3min', label: '3 דקות הכנה', icon: '⏱️', count: categoryCounts.prep_3min },
      { id: 'prep_7min', label: '7 דקות הכנה', icon: '🍳', count: categoryCounts.prep_7min },
      { id: 'meat', label: 'בשר ופרגיות', icon: '🍗', count: categoryCounts.meat },
      { id: 'steaks', label: 'סטייקים ובקר', icon: '🥩', count: categoryCounts.steaks },
      { id: 'fish', label: 'דגי ים וסלמון', icon: '🐟', count: categoryCounts.fish },
      { id: 'bowls', label: 'קומפיר וקערות', icon: '🥔', count: categoryCounts.bowls },
      { id: 'soups', label: 'מרקים ותבשילים', icon: '🥣', count: categoryCounts.soups },
      { id: 'wraps', label: 'דפי אורז ולאפה', icon: '🌯', count: categoryCounts.wraps },
      { id: 'pancakes', label: 'פנקייק שקדים', icon: '🥞', count: categoryCounts.pancakes },
      { id: 'sweet', label: 'סניקרס ושוקולד', icon: '🍫', count: categoryCounts.sweet },
      { id: 'chia_puddings', label: 'פודינג צ׳יה', icon: '🍮', count: categoryCounts.chia_puddings },
      { id: 'cheese', label: 'גבינות 0% לקטוז', icon: '🧀', count: categoryCounts.cheese },
      { id: 'eggs', label: 'ביצים ושקשוקה', icon: '🍳', count: categoryCounts.eggs },
      { id: 'salads', label: 'סלטים קראנץ׳', icon: '🥗', count: categoryCounts.salads },
      { id: 'smoothies', label: 'שייקים וריפוי', icon: '🥤', count: categoryCounts.smoothies },
      { id: 'instant', label: 'נשנושי בזק', icon: '⚡', count: categoryCounts.instant },
      { id: 'breakfast', label: 'ארוחות בוקר', icon: '☀️', count: categoryCounts.breakfast },
      { id: 'lunch', label: 'ארוחות צהריים', icon: '🍽️', count: categoryCounts.lunch },
      { id: 'dinner', label: 'ארוחות ערב', icon: '🌙', count: categoryCounts.dinner },
      { id: 'dessert', label: 'קינוחים ומתוק', icon: '🍓', count: categoryCounts.dessert },
    ],
    [categoryCounts]
  );

  // Filter and sort meals: rated/favorite meals float to the top of the category!
  const filteredMeals = useMemo(() => {
    let list = SIBO_MEAL_SUGGESTIONS;

    const filterBySelected = (items: SiboRecipe[]) => {
      if (selectedMealType === 'all') return items;
      if (selectedMealType === 'favorites') {
        return items.filter((m) => favorites[m.id] || (ratings[m.id] && ratings[m.id] > 0));
      }
      if (selectedMealType === 'prep_3min') {
        return items.filter((m) => {
          const num = m.prepTime ? m.prepTime.match(/\d+/) : null;
          return num && parseInt(num[0], 10) <= 3;
        });
      }
      if (selectedMealType === 'prep_7min') {
        return items.filter((m) => {
          const num = m.prepTime ? m.prepTime.match(/\d+/) : null;
          const val = num ? parseInt(num[0], 10) : 5;
          return (
            (val >= 4 && val <= 7) ||
            m.prepTime.includes('7 דקות') ||
            m.prepTime.includes('6 דקות') ||
            m.prepTime.includes('5 דקות') ||
            m.prepTime.includes('4 דקות')
          );
        });
      }
      if (['breakfast', 'lunch', 'dinner'].includes(selectedMealType)) {
        return items.filter((m) => m.mealType === selectedMealType);
      }
      if (selectedMealType === 'dessert') {
        return items.filter(
          (m) =>
            m.mealType === 'dessert' ||
            m.category === 'sweet' ||
            m.category === 'chia_puddings'
        );
      }
      return items.filter((m) => (m.category as string) === selectedMealType);
    };

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matched = findMatchingRecipes(q, 200);
      if (matched.length > 0) {
        list = filterBySelected(matched);
      } else {
        list = filterBySelected(
          list.filter(
            (m) =>
              m.title.toLowerCase().includes(q) ||
              m.description.toLowerCase().includes(q) ||
              m.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
              m.tag.toLowerCase().includes(q)
          )
        );
      }
    } else {
      list = filterBySelected(list);
    }

    // Sort by Favorites (❤️) and Highest Star Ratings (⭐⭐⭐⭐⭐) to the TOP of the category!
    return [...list].sort((a, b) => {
      const scoreA = (ratings[a.id] || 0) + (favorites[a.id] ? 10 : 0);
      const scoreB = (ratings[b.id] || 0) + (favorites[b.id] ? 10 : 0);
      if (scoreA !== scoreB) return scoreB - scoreA;

      if (!searchQuery.trim()) {
        const seed = categorySeeds[selectedMealType] || categorySeeds.all || 0;
        const scoreHashA = getSeededScore(a.id, seed);
        const scoreHashB = getSeededScore(b.id, seed);
        return scoreHashA - scoreHashB;
      }
      return 0;
    });
  }, [selectedMealType, searchQuery, favorites, ratings, categorySeeds]);

  const displayedMeals = useMemo(() => {
    return filteredMeals.slice(0, visibleCount);
  }, [filteredMeals, visibleCount]);

  const activeCategoryItem = useMemo(() => {
    if (selectedMealType === 'all') {
      return { id: 'all', label: 'כל המנות', icon: '👨‍🍳' };
    }
    return (
      categoryItems.find((c) => c.id === selectedMealType) || {
        id: selectedMealType,
        label: 'הקטגוריה',
        icon: '🍲',
      }
    );
  }, [selectedMealType, categoryItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex sm:items-center sm:justify-center p-0 sm:p-4 animate-fadeIn overflow-hidden">
      <div
        className="bg-white sm:rounded-3xl w-full max-w-4xl h-[100dvh] sm:h-[92vh] flex flex-col min-h-0 shadow-2xl border-0 sm:border border-stone-200 overflow-hidden"
        dir="rtl"
      >
        {/* Compact Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-3.5 py-2.5 sm:px-6 sm:py-3.5 bg-stone-50/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-black text-stone-900 leading-tight truncate">
                  מתכונים וארוחות — שֵׁף דַּלָּה פּוּפוּ 🍲
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                  0% תסיסה • 0% שום ובצל
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate">
                533 מתכוני שֵׁף ל-SIBO — לחצי על מצרך לסימון אם יש לך
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm sm:text-base transition-colors shrink-0 cursor-pointer active:scale-95 ml-1"
            title="סגור חלון"
          >
            ✕
          </button>
        </div>

        {/* Live Voice & Text Search Bar */}
        <div className="px-3.5 pt-2 sm:px-6 sm:pt-3 space-y-1.5 sm:space-y-2 shrink-0 bg-white">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedRecipe) setSelectedRecipe(null);
              }}
              placeholder="דברי במיקרופון או הקלידי (פרגית, קציצות בקר, סלמון, קומפיר, פנקייק, ארטיק תות)..."
              className="w-full pl-9 pr-10 sm:pr-11 py-2 sm:py-2.5 bg-stone-50 border-2 border-stone-200 focus:border-emerald-500 focus:bg-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all shadow-2xs"
            />

            {/* Embedded Live Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
              }`}
              title={isListening ? 'עצור הקשבה קולית' : 'דברי במיקרופון (זיהוי קולי בעברית)'}
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
              )}
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold bg-stone-200 hover:bg-stone-300 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                title="נקה חיפוש"
              >
                ✕
              </button>
            )}
          </div>

          {/* Listening Live Wave Feedback */}
          {isListening && (
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-100 via-red-100 to-amber-100 border-2 border-rose-400 flex items-center justify-between gap-3 text-rose-950 text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span className="font-black">🎙️ מקשיב לך עכשיו בעברית... אמרי כל מנה או מצרך!</span>
              </div>
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs"
              >
                סיום ✕
              </button>
            </div>
          )}

          {/* Speech Error message */}
          {speechError && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
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

        </div>

        {/* 🎠 Category Carousel for Meal Types & Dietary Categories */}
        <div className="px-3.5 sm:px-6 shrink-0">
          <CategoryCarousel
            items={categoryItems}
            selectedId={selectedMealType}
            onSelect={(id) => {
              setSelectedMealType(id);
              setSelectedRecipe(null);
            }}
            title="סינון לפי סוג מנה / קטגוריה:"
            showAllOption={true}
            allLabel="כל המנות"
            allIcon="👨‍🍳"
            allCount={categoryCounts.all}
            theme="emerald"
          />
        </div>

        {/* 🔀 Single Full-Width Prominent Meal Shuffle Button */}
        {!selectedRecipe && (
          <div className="px-2.5 sm:px-6 space-y-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShuffleRecipes}
              className="w-full py-3.5 sm:py-4 px-3 sm:px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-500 hover:to-amber-400 text-amber-950 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg border-2 border-amber-300 ring-2 ring-amber-400/20 transition-all cursor-pointer active:scale-98 group select-none"
              title={`סחרר והגרל מנות חדשות ב-${activeCategoryItem.label}`}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-950 shrink-0 transition-transform duration-500 ${isShuffling ? 'rotate-180' : 'group-hover:rotate-180'}`} />
              <span className="whitespace-nowrap font-black">
                🎲 סחרר מנות ברולטה: {activeCategoryItem.label} ({filteredMeals.length}) 🔀
              </span>
            </button>

            <div className="flex items-center justify-between gap-2 px-1 text-stone-600 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5 font-bold truncate">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">
                  {activeCategoryItem.icon} מנות מובילות ב{activeCategoryItem.label} ({filteredMeals.length}):
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-stone-400 font-medium shrink-0">
                לחצי על מצרך לסימון
              </span>
            </div>
          </div>
        )}

        {/* Content Body: Full Inline Recipes List or Focused Single Recipe */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-6 py-2 space-y-3">
          {selectedRecipe ? (
            /* FOCUSED SINGLE RECIPE VIEW (if deep-linked or specifically selected) */
            <div className="bg-stone-50 rounded-3xl p-4 sm:p-6 border-2 border-emerald-300 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-stone-950 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>חזרה לכל המתכונים</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(selectedRecipe.id, e)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                      favorites[selectedRecipe.id]
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-rose-50 border-stone-300'
                    }`}
                  >
                    <span>{favorites[selectedRecipe.id] ? '❤️ שמור במועדפים' : '🤍 הוספי למועדפים'}</span>
                  </button>

                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full">
                    {selectedRecipe.tag}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {selectedRecipe.prepTime} • ~{selectedRecipe.caloriesApprox} קלוריות
                  </span>
                </div>
              </div>

              <div className="border-b border-stone-200 pb-3 space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">{selectedRecipe.title}</h3>
                <p className="text-sm text-stone-600 font-medium">{selectedRecipe.description}</p>

                {/* Rating Bar */}
                <div className="pt-2 flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200">
                  <span className="text-xs font-bold text-stone-700">דרגי מתכון זה:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={(e) => handleSetRating(selectedRecipe.id, star, e)}
                        className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                          (ratings[selectedRecipe.id] || 0) >= star
                            ? 'text-amber-400'
                            : 'text-stone-300 hover:text-amber-300'
                        }`}
                        title={`דרג ${star} כוכבים`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {ratings[selectedRecipe.id] ? (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      דירוג שלך: {ratings[selectedRecipe.id]}/5 ⭐
                    </span>
                  ) : null}
                </div>
              </div>

              {/* SIBO Safety Notes Banner */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">יתרונות קליניים ובטיחות ל-SIBO:</span>
                  <span className="text-emerald-900 font-medium">
                    {selectedRecipe.benefits && selectedRecipe.benefits.length > 0
                      ? selectedRecipe.benefits.join(' • ')
                      : '0% שום, 0% בצל, 0% גלוטן ולקטוז — בטוח לחלוטין ל-SIBO'}
                  </span>
                </div>
              </div>

              {/* Ingredients & Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
                    🛒 מצרכים (לחצי כדי לסמן):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecipe.ingredients.map((ing, i) => {
                      const key = `${selectedRecipe.id}-${i}`;
                      const isChecked = !!checkedIngredients[key];
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => toggleIngredientCheck(key, e)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                            isChecked
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 line-through opacity-80'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                          }`}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                          )}
                          <span>{ing}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
                    👨‍🍳 הוראות הכנה קצרות ופשוטות:
                  </h4>
                  <ol className="space-y-2 text-xs sm:text-sm text-stone-700">
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            /* FULL INLINE RECIPES LIST (Just like 'I am hungry'!) */
            <div className="space-y-3.5">
              {filteredMeals.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
                  <div className="text-4xl">🍲</div>
                  <h4 className="text-base font-extrabold text-stone-800">לא נמצאו מתכונים תואמים</h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    {selectedMealType === 'favorites'
                      ? 'עדיין לא סימנת מתכונים במועדפים. לחצי על הלב ❤️ או דרגי בכוכבים ⭐ בכל מתכון כדי שהוא יופיע כאן ובראש הרשימה!'
                      : 'נסי לחפש מילה אחרת או לחצי על אחד מכפתורי החיפוש המהיר.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMealType('all');
                    }}
                    className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
                  >
                    הצג את כל המתכונים
                  </button>
                </div>
              ) : (
                displayedMeals.map((recipe, idx) => {
                  const isFav = !!favorites[recipe.id];
                  const currentRating = ratings[recipe.id] || 0;
                  const isCollapsed = !!collapsedRecipes[recipe.id];

                  return (
                    <div
                      key={recipe.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all space-y-3 text-right"
                    >
                      {/* Card Header: Option Tag, Prep Time, Stars & Favorite Heart */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            אופציה {idx + 1}
                          </span>
                          {recipe.tag && (
                            <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                              {recipe.tag}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{recipe.prepTime}</span>
                          </div>
                          {recipe.caloriesApprox ? (
                            <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                              ~{recipe.caloriesApprox} קק״ל
                            </span>
                          ) : null}
                        </div>

                        {/* Interactive Ratings, Favorite Heart & Collapse Toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* 5-Star Rating */}
                          <div className="flex items-center gap-0.5" title="דרגי מתכון זה">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={(e) => handleSetRating(recipe.id, star, e)}
                                className={`text-sm transition-transform hover:scale-125 cursor-pointer ${
                                  currentRating >= star ? 'text-amber-400' : 'text-stone-300 hover:text-amber-300'
                                }`}
                                title={`דרגי ${star} כוכבים`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          {/* Favorite Heart */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(recipe.id, e)}
                            className={`p-1.5 rounded-full transition-transform hover:scale-110 cursor-pointer ${
                              isFav
                                ? 'text-rose-600 bg-rose-50 ring-1 ring-rose-200'
                                : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100'
                            }`}
                            title={isFav ? 'שמור במועדפים' : 'הוסיפי למועדפים'}
                          >
                            <span className="text-sm">{isFav ? '❤️' : '🤍'}</span>
                          </button>

                          {/* Collapse / Expand Toggle */}
                          <button
                            type="button"
                            onClick={(e) => toggleCollapse(recipe.id, e)}
                            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                            title={isCollapsed ? 'הצג מתכון מלא' : 'כווץ מתכון'}
                          >
                            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Recipe Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                          {recipe.title}
                        </h4>
                        {recipe.description && (
                          <p className="text-xs text-stone-500 font-medium leading-relaxed">
                            {recipe.description}
                          </p>
                        )}
                      </div>

                      {/* Full Recipe Content (Open by default!) */}
                      {!isCollapsed && (
                        <div className="space-y-3 pt-1">
                          {/* 🛒 What's needed: Interactive Ingredients Pills */}
                          <div className="space-y-1.5">
                            <span className="text-xs font-black text-stone-700 block">
                              🛒 מה צריך (לחצי כדי לסמן):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {recipe.ingredients.map((ing, i) => {
                                const key = `${recipe.id}-${i}`;
                                const isChecked = !!checkedIngredients[key];
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => toggleIngredientCheck(key, e)}
                                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                      isChecked
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 line-through opacity-80'
                                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                                    }`}
                                  >
                                    {isChecked ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                                    )}
                                    <span>{ing}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* ⚡ How to make: Numbered Steps */}
                          <div className="space-y-1.5 bg-stone-50/80 p-3 rounded-xl border border-stone-100">
                            <span className="text-xs font-black text-stone-700 block">
                              ⚡ איך מכינים (קצר ופשוט):
                            </span>
                            <ol className="space-y-1 text-xs text-stone-800 font-medium">
                              {recipe.instructions.map((step, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                    {sIdx + 1}
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* SIBO Safety & Benefits Box */}
                          <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-bold flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>
                              {recipe.benefits && recipe.benefits.length > 0
                                ? recipe.benefits.join(' • ')
                                : '0% שום ובצל • 0% תסיסה • בטוח ומאושר ל-SIBO'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Load More Button if there are remaining recipes */}
              {filteredMeals.length > visibleCount && (
                <div className="pt-2 pb-3 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 15)}
                    className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-200 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <ChevronDown className="w-4 h-4 text-emerald-700" />
                    <span>
                      👇 הצג עוד 15 מתכונים (נשארו עוד {filteredMeals.length - visibleCount} מתכונים מתוך {filteredMeals.length})
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-3.5 py-2 sm:px-6 sm:py-2.5 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-[10px] sm:text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate">🍽️ 533 מתכוני שֵׁף מדורגים ל-SIBO • מתכונים שדירגת ⭐ או סימנת ב-❤️ בראש הרשימה</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-all cursor-pointer text-xs shrink-0 active:scale-95 ml-2"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
};