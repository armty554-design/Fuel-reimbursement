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

function cleanNum(val) {
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// 1. Analyze doc2_comp_11
const compRows = parseCsv(fs.readFileSync('doc2_comp_11.csv', 'utf8'));
console.log('--- COMP ROWS 11 ---');
compRows.forEach((r, idx) => {
  if (idx < 2) return;
  console.log(`Row ${idx}: Day=${r[0]}, Date=${r[1]}, Km=${r[2]}, Litres=${r[3]}, Price=${r[4]}, CompRate=${r[5]}, Comp=${r[6]}, Tanks=${r[7]}, PerTank=${r[8]}`);
});

// 2. Sum tanks per day from doc2_tanks_11.csv
const tankRows = parseCsv(fs.readFileSync('doc2_tanks_11.csv', 'utf8'));
const totalTankRow = tankRows.find(r => r[0] && r[0].startsWith('Total ผปก')) || tankRows.find(r => r[0] && r[0].toLowerCase().includes('total'));
console.log('\n--- TOTAL TANK ROW ---');
console.log(totalTankRow ? totalTankRow.slice(0, 10) : 'Not found');

// 3. Sum diff per day from doc2_diff_11.csv
const diffRows = parseCsv(fs.readFileSync('doc2_diff_11.csv', 'utf8'));
const dailyDiffKm = Array(31).fill(0);
diffRows.forEach(r => {
  if (r[9] && r[9].trim() === 'DIFF. + 10%') {
    for (let d = 1; d <= 30; d++) {
      const val = cleanNum(r[9 + d]);
      if (val > 0) dailyDiffKm[d] += val;
    }
  }
});
console.log('\n--- DAILY DIFF KM ---');
for (let d = 1; d <= 30; d++) {
  if (dailyDiffKm[d] > 0) {
    console.log(`Day ${d}/11: ${dailyDiffKm[d].toFixed(2)} km`);
  }
}
