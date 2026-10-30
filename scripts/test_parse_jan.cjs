const fs = require('fs');
const content = fs.readFileSync('doc2_diff_01.csv', 'utf8');

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

const rows = parseCsv(content);
console.log('Total parsed rows:', rows.length);
console.log('Header:', rows[0].slice(0, 15));
const diffRows = rows.filter(r => r[9] && r[9].includes('DIFF'));
console.log('DIFF rows count:', diffRows.length);
if (diffRows.length > 0) {
  console.log('First diff row (0-10):', diffRows[0].slice(0, 10));
  console.log('Cols 40-50:', diffRows[0].slice(40, 50));
  console.log('Cols 65-70:', diffRows[0].slice(65, 70));
}
