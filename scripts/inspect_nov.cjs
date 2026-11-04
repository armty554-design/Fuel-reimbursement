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

const compRows = parseCsv(fs.readFileSync('doc2_comp_11.csv', 'utf8'));
console.log('=== doc2_comp_11.csv ===');
compRows.slice(0, 15).forEach((r, idx) => console.log(`Row ${idx}:`, r.slice(0, 10).join(' | ')));

const diffRows = parseCsv(fs.readFileSync('doc2_diff_11.csv', 'utf8'));
console.log('\n=== doc2_diff_11.csv ===');
console.log('Total parsed rows:', diffRows.length);
console.log('Header line (first 20 cols):', diffRows[0]?.slice(0, 20).join(' | '));
console.log('Header line (cols 40-50):', diffRows[0]?.slice(40, 50).join(' | '));

const diff10Rows = diffRows.filter(r => r[9] && r[9].includes('DIFF'));
console.log('DIFF rows count:', diff10Rows.length);
if (diff10Rows.length > 0) {
  console.log('Sample row:');
  console.log('Col 0-9:', diff10Rows[0].slice(0, 10));
  console.log('Col 10-15 (Days 1-5):', diff10Rows[0].slice(10, 16));
  console.log('Summary cols around 40-50:');
  for (let c = 38; c <= 50; c++) {
    console.log(`Col ${c} [${diffRows[0][c] || ''}]:`, diff10Rows[0][c]);
  }
}

const tanksRows = parseCsv(fs.readFileSync('doc2_tanks_11.csv', 'utf8'));
console.log('\n=== doc2_tanks_11.csv ===');
console.log('Total tank rows:', tanksRows.length);
console.log('Tank row 0:', tanksRows[0]?.slice(0, 15).join(' | '));
const totalRow = tanksRows.find(r => r[0] && r[0].startsWith('Total ผปก'));
if (totalRow) {
  console.log('Total ผปก row:', totalRow.slice(0, 15).join(' | '));
}

const detailRows = parseCsv(fs.readFileSync('doc2_detail_11.csv', 'utf8'));
console.log('\n=== doc2_detail_11.csv ===');
console.log('Total detail rows:', detailRows.length);
console.log('Detail row 0:', detailRows[0]?.slice(0, 15).join(' | '));
console.log('Detail row 1:', detailRows[1]?.slice(0, 15).join(' | '));
