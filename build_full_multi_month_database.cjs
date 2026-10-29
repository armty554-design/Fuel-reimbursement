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

// 1. Read existing seedData for official 18 branches, drivers & staff accounts
const oldSeed = JSON.parse(fs.readFileSync('./src/data/seedData.json', 'utf8'));
const branches = oldSeed.branches;
const driversMap = {};
oldSeed.drivers.forEach(d => {
  driversMap[d.empId] = d;
});
const staffUsers = oldSeed.staffUsers;

const monthDefs = [
  { key: '03', name: 'มีนาคม 2569', shortName: 'มี.ค. 2569', year: 2026, monthIndex: 2, days: 31 },
  { key: '04', name: 'เมษายน 2569', shortName: 'เม.ย. 2569', year: 2026, monthIndex: 3, days: 30 },
  { key: '05', name: 'พฤษภาคม 2569', shortName: 'พ.ค. 2569', year: 2026, monthIndex: 4, days: 31 },
  { key: '06', name: 'มิถุนายน 2569', shortName: 'มิ.ย. 2569', year: 2026, monthIndex: 5, days: 30 },
  { key: '07', name: 'กรกฎาคม 2569', shortName: 'ก.ค. 2569', year: 2026, monthIndex: 6, days: 31 },
  { key: '08', name: 'สิงหาคม 2569', shortName: 'ส.ค. 2569', year: 2026, monthIndex: 7, days: 31 },
  { key: '09', name: 'กันยายน 2569', shortName: 'ก.ย. 2569', year: 2026, monthIndex: 8, days: 30 },
  { key: '10', name: 'ตุลาคม 2569', shortName: 'ต.ค. 2569', year: 2026, monthIndex: 9, days: 31 }
];

const allFuelPrices = {};
const allDailyOfficial = {};
const allDriverSummaries = {};
const allMonthRecords = {};

// Parse daily summary from doc2_comp_XX.csv
monthDefs.forEach(m => {
  const mKey = m.key;
  allFuelPrices[mKey] = {};
  allDailyOfficial[mKey] = [];
  const compFile = `doc2_comp_${mKey}.csv`;

  if (fs.existsSync(compFile)) {
    const rows = parseCsv(fs.readFileSync(compFile, 'utf8'));
    
    // Month 03 has different header (starts directly with headers at row 0)
    if (mKey === '03') {
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || !row[0] || row[0].includes('ผลรวม')) continue;
        const dateStr = row[0]; // e.g. 18/03/2026
        const day = parseInt(dateStr.split('/')[0]);
        const km = cleanNum(row[1]);
        const litres = cleanNum(row[2]);
        const price = cleanNum(row[3]);
        const compRate = cleanNum(row[4]);
        const comp = cleanNum(row[5]);
        const tanks = cleanNum(row[6]);
        const perTank = cleanNum(row[7]);

        if (day) {
          allFuelPrices[mKey][day] = price;
          allDailyOfficial[mKey].push({
            day,
            dateStr,
            km,
            litres,
            price,
            compRate,
            comp,
            tanks,
            perTank
          });
        }
      }
    } else {
      // Months 04 to 10
      for (let r = 2; r < rows.length; r++) {
        const row = rows[r];
        if (!row || !row[1] || row[1].includes('ผลรวม') || row[0].includes('ผลรวม')) continue;
        const dayName = row[0];
        const dateStr = row[1]; // e.g. 01/04/2026
        const day = parseInt(dateStr.split('/')[0]);
        const km = cleanNum(row[2]);
        const litres = cleanNum(row[3]);
        const price = cleanNum(row[4]);
        const compRate = cleanNum(row[5]);
        const comp = cleanNum(row[6]);
        const tanks = cleanNum(row[7]);
        const perTank = cleanNum(row[8]);

        if (day) {
          allFuelPrices[mKey][day] = price;
          allDailyOfficial[mKey].push({
            day,
            dayName,
            dateStr,
            km,
            litres,
            price,
            compRate,
            comp,
            tanks,
            perTank
          });
        }
      }
    }
  }

  // Parse doc2_diff_XX.csv for driver summaries and daily records
  const diffFile = `doc2_diff_${mKey}.csv`;
  allDriverSummaries[mKey] = [];
  allMonthRecords[mKey] = {};

  if (fs.existsSync(diffFile)) {
    const rows = parseCsv(fs.readFileSync(diffFile, 'utf8'));
    const days = m.days;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || !row[1] || isNaN(parseInt(row[1]))) continue;
      const empId = row[1].trim();
      const vehicleNo = row[2] ? row[2].trim() : '';
      const firstName = row[3] ? row[3].trim() : '';
      const lastName = row[4] ? row[4].trim() : '';
      const diffType = row[9] ? row[9].trim() : '';

      if (diffType !== 'DIFF. + 10%') continue;

      // Extract daily values
      allMonthRecords[mKey][empId] = {};
      for (let d = 1; d <= days; d++) {
        const colIdx = 9 + d;
        const val = row[colIdx] ? row[colIdx].trim() : '';
        allMonthRecords[mKey][empId][d] = {
          crm: val,
          history: val,
          tripReport: '',
          deliveryUnits: 0
        };
      }

      // Extract summary stats from row
      // Cols: 41=totalKm, 42=workingDays, 43=avgKm, 44=vehicleType, 45=fuelConsumption, 46=litres, 47=comp, 66=role, 67=branchName, 69=tanks
      const totalKm = cleanNum(row[41]);
      const workingDays = cleanNum(row[42]);
      const vehicleType = row[44] ? row[44].trim() : 'กระบะ 4 ล้อ';
      const fuelConsumption = cleanNum(row[45]) || 11.0;
      const totalLitres = cleanNum(row[46]);
      const totalCompensation = cleanNum(row[47]);
      const branchName = row[67] ? row[67].trim() : '';
      const deliveryUnits = cleanNum(row[7]) || cleanNum(row[69]) || 0;
      const compPerTank = deliveryUnits > 0 ? totalCompensation / deliveryUnits : 0;

      // Match branch ID from vehicleNo (first 2 digits)
      const branchId = vehicleNo.length >= 2 ? vehicleNo.substring(0, 2) : '10';
      const existingDriver = driversMap[empId] || {};

      allDriverSummaries[mKey].push({
        empId,
        vehicleNo,
        licensePlate: existingDriver.licensePlate || '-',
        fullName: `${firstName} ${lastName}`.trim(),
        branch: branchId,
        branchName: branchName || existingDriver.branchName || '',
        vehicleType,
        fuelConsumption,
        workingDays,
        totalKm,
        totalLitres,
        totalCompensation,
        deliveryUnits,
        compPerTank: parseFloat(compPerTank.toFixed(2))
      });
    }
  }

  console.log(`Month ${mKey} (${m.name}): ${allDailyOfficial[mKey].length} daily rows, ${allDriverSummaries[mKey].length} drivers`);
});

const cleanSeed = {
  branches,
  drivers: oldSeed.drivers,
  staffUsers,
  monthList: monthDefs,
  allFuelPrices,
  allDailyOfficial,
  allDriverSummaries,
  allMonthRecords,
  fuelPrices: allFuelPrices['10'],
  records: allMonthRecords['10']
};

fs.writeFileSync('./src/data/seedData.json', JSON.stringify(cleanSeed, null, 2), 'utf8');
console.log('Successfully written full multi-month database to ./src/data/seedData.json');
