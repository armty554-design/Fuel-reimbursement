const fs = require('fs');

const tabCompare = fs.readFileSync('doc1_tab_compare.csv', 'utf8');
console.log('=== doc1_tab_compare.csv ===');
console.log(tabCompare);
