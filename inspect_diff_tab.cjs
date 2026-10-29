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
console.log('doc1_tab_diff.csv rows count:', diffLines.length);

// Let's inspect first 20 rows
diffLines.slice(0, 20).forEach((r, i) => {
  if (r.length > 5) {
    console.log(`R${i}: [${r[0]}] [${r[1]}] [${r[2]}] [${r[3]}] [${r[4]}] [${r[9]}]`);
  }
});
