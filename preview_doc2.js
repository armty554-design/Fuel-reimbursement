const fs = require('fs');

function showPreview(filename, linesCount = 20) {
  console.log('=== ' + filename + ' ===');
  const content = fs.readFileSync(filename, 'utf8');
  const lines = content.split('\n');
  lines.slice(0, linesCount).forEach((l, i) => {
    console.log(`L${i+1}: ${l.slice(0, 150)}`);
  });
}

showPreview('doc2_tab_detail_oct.csv', 15);
showPreview('doc2_tab_comp_oct.csv', 20);
showPreview('doc2_tab_diff_oct.csv', 15);
