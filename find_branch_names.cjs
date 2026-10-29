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

// Find lines that might have branch names
diffLines.forEach((r, idx) => {
  const joined = r.join(' ');
  if (joined.includes('สาขา') || joined.includes('คลัง') || joined.includes('บางพลี') || joined.includes('กิ่งแก้ว') || joined.includes('เชียงใหม่')) {
    console.log(`Row ${idx}:`, r.slice(0, 10).filter(x => x.length > 0));
  }
});
