const fs = require('fs');

const content = fs.readFileSync('doc2.html', 'utf8');
const idx = content.indexOf('ค่าชดเชยน้ำมันย้อนหลัง');
console.log('Context around tabs in doc2:');
console.log(content.slice(Math.max(0, idx - 300), idx + 800));
