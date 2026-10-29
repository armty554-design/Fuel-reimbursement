const fs = require('fs');

function parseCsv(content) {
  const result = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (c === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(cur.trim());
      result.push(row);
      row = [];
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur || row.length) {
    row.push(cur.trim());
    result.push(row);
  }
  return result;
}

const rows = parseCsv(fs.readFileSync('doc2_diff_10.csv', 'utf8'));
console.log('Total proper rows:', rows.length);
console.log('Row 0 length:', rows[0]?.length);
rows[0]?.forEach((col, idx) => {
  if (idx >= 35 && idx <= 55) {
    console.log(`Col ${idx}: ${col.replace(/\n/g, ' ')}`);
  }
});
if (rows[1]) {
  console.log('Row 1 cols 35-55:');
  for (let idx = 35; idx <= 55; idx++) {
    console.log(`Col ${idx} (${rows[0][idx]?.replace(/\n/g, ' ')}): ${rows[1][idx]}`);
  }
}
