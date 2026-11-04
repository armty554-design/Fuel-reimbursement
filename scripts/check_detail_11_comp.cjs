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

const detailRows = parseCsv(fs.readFileSync('doc2_detail_11.csv', 'utf8'));
console.log('Detail header:', detailRows[0]);

let totalKm = 0;
let totalComp = 0;
let totalLitres = 0;
let totalTanks = 0;

const driverDetailMap = {};

for (let r = 1; r < detailRows.length; r++) {
  const row = detailRows[r];
  if (!row || !row[0] || isNaN(parseInt(row[0]))) continue;
  const empId = row[0].trim();
  const km = cleanNum(row[5]);
  const comp = cleanNum(row[7]);
  const litres = cleanNum(row[10]);
  const tanks = cleanNum(row[12]);

  totalKm += km;
  totalComp += comp;
  totalLitres += litres;
  totalTanks += tanks;

  if (!driverDetailMap[empId]) {
    driverDetailMap[empId] = {
      empId,
      vehicleNo: row[1],
      fullName: `${row[2]} ${row[3]}`.trim(),
      branchName: row[14],
      totalKm: 0,
      totalComp: 0,
      totalLitres: 0,
      totalTanks: 0,
      days: 0
    };
  }
  if (km > 0) {
    driverDetailMap[empId].totalKm += km;
    driverDetailMap[empId].totalComp += comp;
    driverDetailMap[empId].totalLitres += litres;
    driverDetailMap[empId].totalTanks += tanks;
    driverDetailMap[empId].days += 1;
  }
}

console.log('Detail Totals:');
console.log('Total Km:', totalKm.toFixed(2));
console.log('Total Comp:', totalComp.toFixed(2));
console.log('Total Litres:', totalLitres.toFixed(2));
console.log('Total Tanks:', totalTanks);

const activeDrivers = Object.values(driverDetailMap).filter(d => d.totalKm > 0);
console.log('Active drivers with km > 0:', activeDrivers.length);
