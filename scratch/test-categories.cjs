const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../src/data/siboMealSuggestions.ts'), 'utf8');

// Strip TypeScript types and exports
const cleanJs = code
  .replace(/export interface[\s\S]*?}\n/g, '')
  .replace(/export function[\s\S]*$/g, '')
  .replace(/export const SIBO_MEAL_SUGGESTIONS: SiboRecipe\[] =/, 'const SIBO_MEAL_SUGGESTIONS =')
  + '\nmodule.exports = SIBO_MEAL_SUGGESTIONS;';

const SIBO_MEAL_SUGGESTIONS = eval(cleanJs);
console.log('Total recipes loaded:', SIBO_MEAL_SUGGESTIONS.length);

function categorizeRecipe(r) {
  const text = (r.title + ' ' + (r.tag || '') + ' ' + r.ingredients.join(' ') + ' ' + (r.description || '')).toLowerCase();
  
  if (r.mealType === 'dessert' || text.includes('סניקרס') || text.includes('שוקולד') || text.includes('ארטיק') || text.includes('גלידה') || text.includes('צ\'יה') || text.includes('עוגי') || text.includes('ממתק') || text.includes('כדורי')) {
    return 'sweet';
  }
  if (text.includes('דג') || text.includes('סלמון') || text.includes('דניס') || text.includes('לברק') || text.includes('טונה') || text.includes('סרדין') || text.includes('ברמונדי') || text.includes('מוסר') || text.includes('פורל')) {
    return 'fish';
  }
  if (text.includes('פרגית') || text.includes('עוף') || text.includes('בקר') || text.includes('סטייק') || text.includes('קציצ') || text.includes('שווארמה') || text.includes('אנטרקוט') || text.includes('שייטל') || text.includes('סינטה') || text.includes('חזה עוף') || text.includes('בשר') || text.includes('שיפוד') || text.includes('בולונז')) {
    return 'meat';
  }
  if (text.includes('דפי אורז') || text.includes('לאפה') || text.includes('פנקייק') || text.includes('טורטיה') || text.includes('רול') || text.includes('קרפ') || text.includes('בלינצ\'ס') || text.includes('קרקר') || text.includes('לחם') || text.includes('בצק')) {
    return 'wraps';
  }
  if (text.includes('ביצ') || text.includes('חבית') || text.includes('אומלט') || text.includes('שקשוקה') || text.includes('עין')) {
    return 'eggs';
  }
  if (text.includes('שייק') || text.includes('סמודי') || text.includes('מיץ') || text.includes('משקה') || text.includes('תה') || text.includes('חליטה')) {
    return 'smoothies';
  }
  if (text.includes('גבינ') || text.includes('פרמזן') || text.includes('גאודה') || text.includes('מוצרלה') || text.includes('קשקבל') || text.includes('צפתית') || text.includes('פטה') || text.includes('מנצ\'גו')) {
    return 'cheese';
  }
  if (text.includes('מרק') || text.includes('קומפיר') || text.includes('תפוח אדמה') || text.includes('תפו"א') || text.includes('זודלס') || text.includes('דלעת') || text.includes('קער') || text.includes('ירקות') || text.includes('סלט')) {
    return 'bowls';
  }
  if (r.mealType === 'quick' || text.includes('דקות') || text.includes('בזק') || text.includes('נשנוש')) {
    return 'instant';
  }
  return 'bowls';
}

const counts = {};
SIBO_MEAL_SUGGESTIONS.forEach(r => {
  const cat = categorizeRecipe(r);
  counts[cat] = (counts[cat] || 0) + 1;
});

console.log('Category breakdown:', counts);
