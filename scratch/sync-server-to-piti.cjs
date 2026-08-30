const fs = require('fs');
const path = require('path');

const srcServer = 'g:\\האחסון שלי\\חגי הילמן - פרטי\\רפואי\\sibo-safe---סורק-מזון-לסיבו-עבור-ניר\\server.ts';
const destServer = 'g:\\האחסון שלי\\חגי הילמן - פרטי\\רפואי\\אפליקציית הללא גלוטן של פיתי\\server.ts';

let content = fs.readFileSync(srcServer, 'utf8');
content = content.replace(/עבור ניר/g, 'עבור פיתי');
content = content.replace(/לניר/g, 'לפיתי');
content = content.replace(/אני רעבה/g, 'אני רעב');
content = content.replace(/סורק רמזור מזון לסיבו/g, 'מסע הלל״ג של פיתי');

fs.writeFileSync(destServer, content, 'utf8');
console.log('✅ server.ts copied and adapted to Piti App!');
