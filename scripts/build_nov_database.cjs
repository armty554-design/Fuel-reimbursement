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

// 1. Build allDailyOfficial for 11
const compRows = parseCsv(fs.readFileSync('doc2_comp_11.csv', 'utf8'));
const dayCompMap = {};
for (let r = 2; r < compRows.length; r++) {
  const row = compRows[r];
  if (!row || !row[1] || row[1].includes('ผลรวม') || row[0].includes('ผลรวม')) continue;
  const parts = row[1].split('/');
  const day = parseInt(parts[0], 10);
  if (day) {
    dayCompMap[day] = {
      dayName: row[0],
      dateStr: row[1],
      km: cleanNum(row[2]),
      litres: cleanNum(row[3]),
      price: cleanNum(row[4]),
      compRate: cleanNum(row[5]),
      comp: cleanNum(row[6]),
      tanks: cleanNum(row[7]),
      perTank: cleanNum(row[8])
    };
  }
}

const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
const dailyOfficial11 = [];
const fuelPrices11 = {};

for (let d = 1; d <= 30; d++) {
  const date = new Date(2026, 10, d); // Nov 2026
  const dayName = thaiDays[date.getDay()];
  const dateStr = `${String(d).padStart(2, '0')}/11/2569`;
  const isSunday = dayName === 'อาทิตย์';

  const entry = dayCompMap[d] || {
    dayName,
    dateStr,
    km: 0,
    litres: 0,
    price: 0,
    compRate: 0,
    comp: 0,
    tanks: 0,
    perTank: 0
  };

  const price = entry.price > 0 ? entry.price : (d <= 4 ? 42.54 : 0);
  const compRate = price > 30 ? parseFloat((price - 30).toFixed(2)) : 0;

  if (price > 0) {
    fuelPrices11[d] = price;
  }

  dailyOfficial11.push({
    day: d,
    dayName,
    dateStr,
    km: entry.km,
    litres: entry.litres,
    price,
    compRate,
    comp: entry.comp,
    tanks: entry.tanks,
    perTank: entry.perTank,
    isSunday
  });
}

console.log('Daily rows built:', dailyOfficial11.length);
console.log('Days with km > 0:', dailyOfficial11.filter(d => d.km > 0).map(d => `${d.day} (${d.km} km, ฿${d.comp}, ${d.tanks} tanks)`));

// 2. Build driver summaries from doc2_detail_11.csv and doc2_diff_11.csv
const detailRows = parseCsv(fs.readFileSync('doc2_detail_11.csv', 'utf8'));
const driverDetailMap = {};

for (let r = 1; r < detailRows.length; r++) {
  const row = detailRows[r];
  if (!row || !row[0] || isNaN(parseInt(row[0]))) continue;
  const empId = row[0].trim();
  const km = cleanNum(row[5]);
  const comp = cleanNum(row[7]);
  const litres = cleanNum(row[10]);
  const tanks = cleanNum(row[12]);

  if (!driverDetailMap[empId]) {
    driverDetailMap[empId] = {
      empId,
      vehicleNo: row[1]?.trim() || '',
      firstName: row[2]?.trim() || '',
      lastName: row[3]?.trim() || '',
      branchName: row[14]?.trim() || '',
      workingDays: 0,
      totalKm: 0,
      totalLitres: 0,
      totalCompensation: 0,
      deliveryUnits: 0
    };
  }

  if (km > 0) {
    driverDetailMap[empId].workingDays += 1;
    driverDetailMap[empId].totalKm += km;
    driverDetailMap[empId].totalLitres += litres;
    driverDetailMap[empId].totalCompensation += comp;
    driverDetailMap[empId].deliveryUnits += tanks;
  }
}

// Read diff_11 to get all 343 drivers and daily history
const diffRows = parseCsv(fs.readFileSync('doc2_diff_11.csv', 'utf8'));
const seed = JSON.parse(fs.readFileSync('./src/data/seedData.json', 'utf8'));
const masterDrivers = {};
seed.drivers.forEach(d => masterDrivers[d.empId] = d);

const driverSummaries11 = [];
const records11 = {};

for (let r = 1; r < diffRows.length; r++) {
  const row = diffRows[r];
  if (!row || !row[1] || isNaN(parseInt(row[1]))) continue;
  const empId = row[1].trim();
  const diffType = row[9] ? row[9].trim() : '';
  if (diffType !== 'DIFF. + 10%') continue;

  const vehicleNo = row[2] ? row[2].trim() : '';
  const firstName = row[3] ? row[3].trim() : '';
  const lastName = row[4] ? row[4].trim() : '';
  const diffTotalKm = cleanNum(row[41]);
  const diffWorkDays = cleanNum(row[42]);
  const vehicleType = row[44] ? row[44].trim() : 'กระบะ 4 ล้อ';
  const fuelConsumption = cleanNum(row[45]) || 11.0;

  const detailInfo = driverDetailMap[empId] || {};
  const totalKm = detailInfo.totalKm !== undefined ? parseFloat(detailInfo.totalKm.toFixed(2)) : diffTotalKm;
  const workingDays = detailInfo.workingDays || diffWorkDays || 0;
  const totalLitres = detailInfo.totalLitres !== undefined ? parseFloat(detailInfo.totalLitres.toFixed(2)) : cleanNum(row[46]);
  const totalCompensation = detailInfo.totalCompensation !== undefined ? parseFloat(detailInfo.totalCompensation.toFixed(2)) : 0;
  const deliveryUnits = detailInfo.deliveryUnits || cleanNum(row[7]) || cleanNum(row[69]) || 0;
  const compPerTank = deliveryUnits > 0 ? parseFloat((totalCompensation / deliveryUnits).toFixed(2)) : 0;

  const branchId = vehicleNo.length >= 2 ? vehicleNo.substring(0, 2) : '10';
  const master = masterDrivers[empId] || {};

  driverSummaries11.push({
    empId,
    vehicleNo,
    licensePlate: master.licensePlate || '-',
    fullName: `${firstName} ${lastName}`.trim(),
    branch: branchId,
    branchName: detailInfo.branchName || row[67]?.trim() || master.branchName || '',
    vehicleType,
    fuelConsumption,
    workingDays,
    totalKm,
    totalLitres,
    totalCompensation,
    deliveryUnits,
    compPerTank
  });

  // Daily records
  records11[empId] = {};
  for (let d = 1; d <= 30; d++) {
    const val = row[9 + d] ? row[9 + d].trim() : '';
    records11[empId][d] = {
      crm: val,
      history: val,
      tripReport: '',
      deliveryUnits: 0
    };
  }
}

console.log('Driver summaries 11 count:', driverSummaries11.length);
const sumKm = driverSummaries11.reduce((s, d) => s + d.totalKm, 0);
const sumLitres = driverSummaries11.reduce((s, d) => s + d.totalLitres, 0);
const sumComp = driverSummaries11.reduce((s, d) => s + d.totalCompensation, 0);
const sumTanks = driverSummaries11.reduce((s, d) => s + d.deliveryUnits, 0);

console.log(`Driver Totals: Km=${sumKm.toFixed(2)}, Litres=${sumLitres.toFixed(2)}, Comp=฿${sumComp.toFixed(2)}, Tanks=${sumTanks}`);
