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

const branchColCounts = {};
diffLines.forEach(r => {
  if (r[1] && !isNaN(parseInt(r[1])) && r[2]) {
    const bName = r[67] || 'ไม่ระบุ';
    const prefix = r[2].slice(0, 2);
    const key = `Col67: [${bName}] <--> CarPrefix: [${prefix}]`;
    branchColCounts[key] = (branchColCounts[key] || 0) + 1;
  }
});

console.log(branchColCounts);
