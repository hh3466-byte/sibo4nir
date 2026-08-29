const fs = require('fs');
const path = require('path');
const serverContent = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
console.log('Includes gemini-2.5-flash:', serverContent.includes('gemini-2.5-flash'));
const lines = serverContent.split('\n');
lines.forEach((l, i) => {
  if (l.includes('2.5-flash')) console.log(`Line ${i+1}: ${l}`);
});
