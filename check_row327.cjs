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

// Check columns for rows around 327 (70101)
const r = diffLines[327];
console.log('Row 327 length:', r.length);
r.forEach((v, i) => {
  if (v && v.length > 0) {
    console.log(`Col ${i}: ${v}`);
  }
});
