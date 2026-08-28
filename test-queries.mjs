import { analyzeFoodClinically } from './src/services/siboClinicalEngine.ts';

const queries = [
  'אני רוצה להכין סלט באיזה ירקות אני יכול להשתמש',
  'אני רוצה להכין סלט איזה ירקות אני יכול להשתמש',
  'אני רוצה להכין סלט איזה ירקות אני יכולה להשתמש',
  'באיזה ירקות אני יכול להשתמש לסלט',
  'באיזה ירקות מותר להשתמש',
  'איזה ירקות מותר בסלט',
  'ירקות מותרים לסלט',
  'מה אפשר לשים בסלט',
  'סלט לסיבו',
  'איך מכינים סלט לסיבו',
  'ירקות לסלט',
  'איזה ירקות מותר לאכול',
  'מה מותר לאכול',
  'איזה ירקות מותרים בשלב 1',
  'איזה ירקות אפשר לאכול',
  'מה אפשר להכין לאכול',
  'איזה סלט מותר',
  'סלט ירקות',
  'סלט ירוק',
  'סלט'
];

console.log('--- TESTING EXACT PHRASINGS ---');
for (const q of queries) {
  const res = analyzeFoodClinically(q, 'phase1_strict');
  console.log((res.status === 'GREEN' ? '🟢' : res.status === 'YELLOW' ? '🟡' : '🔴'), `"${q}" -> ${res.foodName} [${res.status}]`);
}
