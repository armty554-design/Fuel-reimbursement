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

const months = ['03', '04', '05', '06', '07', '08', '09', '10'];

months.forEach(m => {
  const f = `doc2_comp_${m}.csv`;
  if (fs.existsSync(f)) {
    const rows = parseCsv(fs.readFileSync(f, 'utf8'));
    console.log(`=== Month ${m} (${rows.length} rows) ===`);
    rows.slice(0, 3).forEach((r, idx) => console.log(`  row ${idx}:`, r.slice(0, 9)));
    const totalRow = rows.find(r => r.some(c => c.includes('ผลรวม')));
    console.log(`  totalRow:`, totalRow ? totalRow.slice(0, 9) : 'NOT FOUND');
  }
});
