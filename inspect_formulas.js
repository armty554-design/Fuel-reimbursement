const fs = require('fs');

function inspectFormulas(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== FORMULAS IN ' + filename + ' ===');
  // Match IMPORTRANGE or formulas
  const matches = [...content.matchAll(/IMPORTRANGE[^\"]*\"([^\"]+)\"[^\"]*\"([^\"]+)\"/gi)];
  console.log('IMPORTRANGE matches:', matches.length);
  matches.forEach(m => console.log('Range:', m[1], '-->', m[2]));

  // Find sheet references like "!A" or "!B"
  const sheetRefs = [...content.matchAll(/([ก-๙a-zA-Z0-9_\-\.\s\+]+)![A-Z]+[0-9]*/g)];
  console.log('Sheet refs count:', sheetRefs.length);
  const uniqueRefs = [...new Set(sheetRefs.map(m => m[0]))];
  console.log('Unique refs:', uniqueRefs.slice(0, 30));
}

inspectFormulas('doc2.html');
inspectFormulas('doc1.html');
