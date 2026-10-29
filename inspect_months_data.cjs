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

// Inspect sheet2.csv for all months diesel prices
const s2Lines = parseCsv(fs.readFileSync('sheet2.csv', 'utf8'));
console.log('Row 0 length:', s2Lines[0]?.length);
s2Lines[0]?.forEach((col, idx) => {
  if (col && col.includes('เดือน')) {
    console.log(`Col ${idx}: ${col}`);
  }
});

// Check diff csv format for March (03) and April (04)
const d03 = parseCsv(fs.readFileSync('doc2_diff_03.csv', 'utf8'));
console.log('\nMonth 03 diff rows:', d03.length);
console.log('Row 0:', d03[0]?.slice(0, 15));
console.log('Row 1:', d03[1]?.slice(0, 15));
console.log('Row 14:', d03[14]?.slice(0, 15));
