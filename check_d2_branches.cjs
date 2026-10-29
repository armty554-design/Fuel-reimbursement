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

const d2Rows = parseCsv(fs.readFileSync('doc2_tab_detail_oct.csv', 'utf8'));
console.log('Total rows:', d2Rows.length);
console.log('Header:', d2Rows[0]);
console.log('Row 3:', d2Rows[3]);
console.log('Row 100:', d2Rows[100]);
console.log('Row 1000:', d2Rows[1000]);

// Collect unique branches from columns 13, 14, 15, 16
const branchesFound = new Set();
for (let i = 3; i < Math.min(d2Rows.length, 5000); i++) {
  const r = d2Rows[i];
  if (r && r.length > 14) {
    branchesFound.add(`${r[14]} | col16:${r[16]}`);
  }
}
console.log('Branches found:', [...branchesFound]);
