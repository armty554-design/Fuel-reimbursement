const fs = require('fs');

function showPreview(filename, linesCount = 20) {
  console.log('=== ' + filename + ' ===');
  const content = fs.readFileSync(filename, 'utf8');
  const lines = content.split('\n');
  lines.slice(0, linesCount).forEach((l, i) => {
    console.log(`L${i+1}: ${l.slice(0, 140)}`);
  });
}

showPreview('doc1_tab_10.csv', 25);
showPreview('doc1_tab_diff.csv', 15);
showPreview('doc1_tab_compare.csv', 20);
