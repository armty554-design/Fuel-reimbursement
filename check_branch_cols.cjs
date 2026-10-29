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

// Check columns for a few rows with prefix 10, 11, 70, 98
[14, 38, 40, 65, 327, 403].forEach(idx => {
  const r = diffLines[idx];
  if (r) {
    console.log(`\nRow ${idx}: Car=${r[2]}, Emp=${r[3]}`);
    r.forEach((val, c) => {
      if (val && (val.includes('บาง') || val.includes('สุขุม') || val.includes('คลัง') || val.includes('สาขา') || val.includes('สาย 1') || val.includes('ประเวศ') || val.includes('เชียงใหม่') || val.includes('หาดใหญ่'))) {
        console.log(`  Col ${c}: ${val}`);
      }
    });
  }
});
