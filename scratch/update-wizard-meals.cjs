const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/HungerRescueWizard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the remnant static items between matchedFromInput?: string;\n} and // 🚗 Driving
const searchBlockStart = '  matchedFromInput?: string;\n}';
const searchBlockEnd = '// 🚗 Driving & Gas Station Rescue Meals (8+ options)';

const startIndex = content.indexOf(searchBlockStart);
const endIndex = content.indexOf(searchBlockEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find start or end block! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const replacementHeader = `  matchedFromInput?: string;
}

// 🏠 Massive Master Catalog of 230+ Verified SIBO-Safe Rescue Meals for Home / Kitchen
export const HOME_RESCUE_MEALS: SuggestedRescueMeal[] = SIBO_MEAL_SUGGESTIONS.map((rec) => {
  const numMatch = rec.prepTime ? rec.prepTime.match(/\\d+/) : null;
  const prepMinutes = numMatch ? parseInt(numMatch[0], 10) : 5;
  return {
    id: rec.id,
    title: rec.title,
    category: rec.category as MealCategory,
    timeToMake: rec.prepTime || '5 דקות',
    prepMinutes: prepMinutes,
    ingredients: rec.ingredients,
    simpleSteps: rec.instructions,
    satietyReason: rec.benefits && rec.benefits.length > 0 ? rec.benefits.join(' • ') : rec.description,
    tag: rec.tag,
    isQuickNoCook: rec.mealType === 'quick' || prepMinutes <= 2,
  };
});

`;

content = content.substring(0, startIndex) + replacementHeader + content.substring(endIndex);
console.log('Step 1 applied: replaced static items with 230+ meals mapping.');

// 2. Update categoryCounts & mealCategoryItems
const oldCountsMarker = '  // Category counts for badges\n  const categoryCounts = useMemo(() => {';
const oldCountsEndMarker = '  // Carousel scenario items for location carousel';

const countsStart = content.indexOf(oldCountsMarker);
const countsEnd = content.indexOf(oldCountsEndMarker);

if (countsStart === -1 || countsEnd === -1) {
  console.error('Could not find counts block! countsStart:', countsStart, 'countsEnd:', countsEnd);
  process.exit(1);
}

const newCountsAndCarousel = `  // Category counts for badges across 14 diverse categories
  const categoryCounts = useMemo(() => {
    const raw = chefResult?.suggestedMeals || [];
    return {
      all: raw.length,
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
      instant: raw.filter((m) => m.category === 'instant' || m.isQuickNoCook).length,
    };
  }, [chefResult?.suggestedMeals]);

  // Carousel category items with all 14 rich categories
  const mealCategoryItems: CategoryCarouselItem[] = useMemo(() => {
    return [
      { id: 'meat', label: 'בשר, פרגית ועוף', icon: '🍗', count: categoryCounts.meat },
      { id: 'steaks', label: 'סטייקים ובשר פרימיום', icon: '🥩', count: categoryCounts.steaks },
      { id: 'fish', label: 'דגי ים, סלמון וטונה', icon: '🐟', count: categoryCounts.fish },
      { id: 'bowls', label: 'קומפיר, זודלס וקערות', icon: '🥔', count: categoryCounts.bowls },
      { id: 'soups', label: 'מרקי החלמה וקולגן', icon: '🥣', count: categoryCounts.soups },
      { id: 'wraps', label: 'דפי אורז ולאפה', icon: '🌯', count: categoryCounts.wraps },
      { id: 'pancakes', label: 'פנקייק ומאפי שקדים', icon: '🥞', count: categoryCounts.pancakes },
      { id: 'sweet', label: 'סניקרס ושוקולד', icon: '🍫', count: categoryCounts.sweet },
      { id: 'chia_puddings', label: 'פודינג צ׳יה וקינוחים', icon: '🍮', count: categoryCounts.chia_puddings },
      { id: 'cheese', label: 'גבינות 0% לקטוז', icon: '🧀', count: categoryCounts.cheese },
      { id: 'eggs', label: 'ביצים ושקשוקות', icon: '🍳', count: categoryCounts.eggs },
      { id: 'salads', label: 'סלטים וירקות קראנץ׳', icon: '🥗', count: categoryCounts.salads },
      { id: 'smoothies', label: 'שייקים ומשקאות ריפוי', icon: '🥤', count: categoryCounts.smoothies },
      { id: 'instant', label: 'נשנושי בזק וטוסטים', icon: '⚡', count: categoryCounts.instant },
    ];
  }, [categoryCounts]);

  `;

content = content.substring(0, countsStart) + newCountsAndCarousel + content.substring(countsEnd);
console.log('Step 2 applied: updated categoryCounts and 14 categories carousel.');

// 3. Update scenario home count
content = content.replace(
  "{ id: 'home', label: 'בבית / במטבח', icon: '🏠', count: 35 }",
  "{ id: 'home', label: 'בבית / במטבח', icon: '🏠', count: HOME_RESCUE_MEALS.length }"
);

// 4. Update home scenario message
content = content.replace(
  "scenarioTitle: 'בופה שובע עשיר בבית (35+ אופציות מגוונות) 🏠'",
  "scenarioTitle: `בופה שובע עשיר בבית (${HOME_RESCUE_MEALS.length}+ אופציות מגוונות) 🏠`"
);

content = content.replace(
  "הנה שפע אדיר של ארוחות בזק מגוונות: בשרים, שיפודים, דגי ים, זודלס, דפי אורז, פנקייקים וקינוחי צ׳יה.",
  "הנה שפע אדיר של 230+ ארוחות בזק מגוונות ב-14 קטגוריות: בשרים, סטייקים, דגי ים, זודלס, מרקי קולגן, דפי אורז, פנקייקים, קינוחים, גבינות וביצים."
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HungerRescueWizard.tsx with all 230+ meals and 14 categories!');
