const fs = require('fs');
const path = require('path');

const srcDir = 'g:\\האחסון שלי\\חגי הילמן - פרטי\\רפואי\\sibo-safe---סורק-מזון-לסיבו-עבור-ניר';
const destDir = 'g:\\האחסון שלי\\חגי הילמן - פרטי\\רפואי\\אפליקציית הללא גלוטן של פיתי';

const filesToSync = [
  'src/App.tsx',
  'src/components/HungerRescueWizard.tsx',
  'src/components/MealSuggestionsModal.tsx',
  'src/components/SupermarketSelfScanView.tsx',
  'src/components/TrafficLightResult.tsx',
];

filesToSync.forEach(relPath => {
  const src = path.join(srcDir, relPath);
  const dest = path.join(destDir, relPath);
  if (fs.existsSync(src)) {
    let content = fs.readFileSync(src, 'utf8');
    content = content.replace(/עבור ניר/g, 'עבור פיתי');
    content = content.replace(/לניר/g, 'לפיתי');
    content = content.replace(/אני רעבה/g, 'אני רעב');
    content = content.replace(/ניר/g, 'פיתי');
    fs.writeFileSync(dest, content, 'utf8');
    console.log(`✅ Synced: ${relPath}`);
  }
});
console.log('🏁 All files synced to Piti GF!');
