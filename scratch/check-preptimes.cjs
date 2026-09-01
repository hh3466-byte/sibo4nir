const fs = require('fs');
const content = fs.readFileSync('src/data/siboMealSuggestions.ts', 'utf8');
const match = content.match(/"prepTime":\s*"([^"]+)"/g);
const counts = {};
if (match) {
  match.forEach(m => {
    const val = m.split(':')[1].replace(/"/g, '').trim();
    counts[val] = (counts[val] || 0) + 1;
  });
}
console.log('Prep times counts:', counts);
