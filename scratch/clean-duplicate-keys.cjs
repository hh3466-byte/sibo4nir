const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/israeliSupermarketDatabase.ts');
let content = fs.readFileSync(dbPath, 'utf8');

// Match all key blocks
const lines = content.split('\n');
const seenKeys = new Set();
const cleanLines = [];
let skipUntilNextKey = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const keyMatch = line.match(/^\s*'([0-9]+)':\s*\{/);

  if (keyMatch) {
    const key = keyMatch[1];
    if (seenKeys.has(key)) {
      console.log(`Duplicate key found and removed: ${key} at line ${i + 1}`);
      skipUntilNextKey = true;
      continue;
    } else {
      seenKeys.add(key);
      skipUntilNextKey = false;
    }
  }

  if (skipUntilNextKey) {
    if (/^\s*\},?\s*$/.test(line)) {
      skipUntilNextKey = false;
    }
    continue;
  }

  cleanLines.push(line);
}

fs.writeFileSync(dbPath, cleanLines.join('\n'), 'utf8');
console.log(`Finished! Total unique keys: ${seenKeys.size}`);
