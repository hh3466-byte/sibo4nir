const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/siboMealSuggestions.ts'), 'utf8');

// Extract JSON or count objects
const matches = content.match(/"id":/g);
console.log('Total SIBO_MEAL_SUGGESTIONS recipes:', matches ? matches.length : 0);
