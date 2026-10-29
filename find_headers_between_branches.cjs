const fs = require('fs');

function parseCsv(content) {
  const lines = content.split('\n');
  return lines.map(line => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else cur += c;
    }
    result.push(cur.trim());
    return result;
  });
}

const diffLines = parseCsv(fs.readFileSync('doc1_tab_diff.csv', 'utf8'));

// Check when vehicle prefix changes
let curPrefix = '';
diffLines.forEach((r, idx) => {
  if (r[1] && !isNaN(parseInt(r[1])) && r[2]) {
    const p = r[2].slice(0, 2);
    if (p !== curPrefix) {
      curPrefix = p;
      // print 2 lines before this
      const prev1 = diffLines[idx - 1] ? diffLines[idx - 1].filter(x => x).join(' | ') : '';
      const prev2 = diffLines[idx - 2] ? diffLines[idx - 2].filter(x => x).join(' | ') : '';
      console.log(`\n--- Transition to Prefix ${p} at row ${idx} (Car: ${r[2]}, Emp: ${r[3]} ${r[4]}) ---`);
      if (prev2) console.log('  Row -2:', prev2);
      if (prev1) console.log('  Row -1:', prev1);
    }
  }
});
