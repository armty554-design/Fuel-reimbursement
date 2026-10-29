const fs = require('fs');

function findJSMetadata(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== ' + filename + ' ===');
  // Search for the tab captions in javascript strings
  const idx = content.indexOf('ค่าชดเชย 10');
  if (idx !== -1) {
    console.log('Context of "ค่าชดเชย 10":', content.slice(Math.max(0, idx - 100), idx + 200));
  }
  const idx1 = content.indexOf('ชดเชย DIFF. + 10%');
  if (idx1 !== -1) {
    console.log('Context of "ชดเชย DIFF. + 10%":', content.slice(Math.max(0, idx1 - 100), idx1 + 200));
  }
}

findJSMetadata('doc1.html');
findJSMetadata('doc2.html');
