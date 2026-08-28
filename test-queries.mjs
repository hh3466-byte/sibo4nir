import { analyzeFoodClinically } from './src/services/siboClinicalEngine.ts';

const queries = [
  'אני רוצה להכין מרק',
  'איך להכין מרק',
  'איזה מרק מותר',
  'מרק עוף',
  'מרק ירקות',
  'מרק כתום',
  'מרק דלעת',
  'ציר מרק עוף',
  'אני רוצה להכין סלט באיזה ירקות אני יכול להשתמש',
  'איזה ירקות מותרים לסלט',
  'מה אפשר לשים בסלט',
  'אני רוצה להכין עוף',
  'איך לתבל עוף',
  'איזה דגים מותר',
  'איך להכין שקשוקה לסיבו',
  'חביתה',
  'איזה גבינות מותר',
  'איזה פסטה מותר',
  'איזה לחם מותר',
  'איזה מתוק מותר',
  'איזה שתייה מותרת',
  'מה לאכול לארוחת צהריים',
  'מה לנשנש'
];

console.log('--- TESTING ALL CULINARY CATEGORIES ---');
for (const q of queries) {
  const res = analyzeFoodClinically(q, 'phase1_strict');
  console.log((res.status === 'GREEN' ? '🟢' : res.status === 'YELLOW' ? '🟡' : '🔴'), `"${q}" -> ${res.foodName} [${res.status}]`);
}
