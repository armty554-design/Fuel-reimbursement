const fs = require('fs');

const tab1 = fs.readFileSync('sheet1.csv', 'utf8');
console.log('=== TAB คำแนะนำ ===');
console.log(tab1);
