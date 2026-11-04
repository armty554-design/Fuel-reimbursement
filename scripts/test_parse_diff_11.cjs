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

const diffRows = parseCsv(fs.readFileSync('doc2_diff_11.csv', 'utf8'));
console.log('Total diff rows:', diffRows.length);
console.log('Header columns:');
diffRows[0].forEach((col, idx) => {
  if (idx <= 12 || idx >= 38) {
    console.log(`Col ${idx}: ${col}`);
  }
});

let diffCount = 0;
let totalKmSum = 0;
let totalCompSum = 0;
let totalLitresSum = 0;
let workingDaysSum = 0;

for (let r = 1; r < diffRows.length; r++) {
  const row = diffRows[r];
  if (!row || !row[1] || isNaN(parseInt(row[1]))) continue;
  const empId = row[1].trim();
  const diffType = row[9] ? row[9].trim() : '';
  if (diffType !== 'DIFF. + 10%') continue;

  diffCount++;
  const totalKm = cleanNum(row[41]);
  const workingDays = cleanNum(row[42]);
  const totalLitres = cleanNum(row[46]);
  const totalComp = cleanNum(row[47]);

  totalKmSum += totalKm;
  workingDaysSum += workingDays;
  totalLitresSum += totalLitres;
  totalCompSum += totalComp;

  if (totalKm > 0) {
    console.log(`Driver ${empId} (${row[3]} ${row[4]} - ${row[2]}): totalKm=${totalKm}, workDays=${workingDays}, litres=${totalLitres}, comp=${totalComp}`);
  }
}

console.log(`\nSummary of DIFF drivers in diff_11:`);
console.log(`Count: ${diffCount}`);
console.log(`Total Km: ${totalKmSum.toFixed(2)}`);
console.log(`Total Litres: ${totalLitresSum.toFixed(2)}`);
console.log(`Total Comp: ${totalCompSum.toFixed(2)}`);
console.log(`Total Working Days: ${workingDaysSum}`);
