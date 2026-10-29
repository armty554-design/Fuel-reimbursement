const fs = require('fs');

const content = fs.readFileSync('doc1.html', 'utf8');

// Search for cell calculations in doc1, specifically rows for อุไรศรี or DIFF. + 10%
const idx = content.indexOf('DIFF. + 10%');
console.log('Snippet around DIFF. + 10%:');
console.log(content.slice(Math.max(0, idx - 100), idx + 300));

// Let's search for formulas like IF, MAX, MIN, ROUND, or similar
const formulas = [...content.matchAll(/\"([=][^\"]+)\"/g)].map(m => m[1]);
console.log('Formulas found:', formulas.length);
console.log(formulas.slice(0, 20));
