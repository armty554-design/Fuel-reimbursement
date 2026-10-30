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
  { key: '01', name: 'มกราคม 2569', shortName: 'ม.ค. 2569', year: 2026, monthIndex: 0, days: 31 },
  { key: '02', name: 'กุมภาพันธ์ 2569', shortName: 'ก.พ. 2569', year: 2026, monthIndex: 1, days: 28 },
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

// Parse daily summary from doc2_comp_XX.csv or baseline
monthDefs.forEach(m => {
  const mKey = m.key;
  allFuelPrices[mKey] = {};
  allDailyOfficial[mKey] = [];
  const compFile = `doc2_comp_${mKey}.csv`;

  if (mKey === '02' && !fs.existsSync(compFile)) {
    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
    const workDays = 24;
    const dailyKm = parseFloat((517322 / workDays).toFixed(2));
    const dailyLitres = parseFloat((dailyKm / 11.0).toFixed(2));
    const dailyTanks = Math.round(1306838 / workDays);

    for (let d = 1; d <= 28; d++) {
      const date = new Date(2026, 1, d);
      const dayName = thaiDays[date.getDay()];
      const isSun = date.getDay() === 0;
      const dateStr = `${String(d).padStart(2, '0')}/02/2569`;
      const price = 29.94;
      allFuelPrices['02'][d] = price;
      allDailyOfficial['02'].push({
        day: d,
        dayName,
        dateStr,
        km: isSun ? 0 : dailyKm,
        litres: isSun ? 0 : dailyLitres,
        price,
        compRate: 0,
        comp: 0,
        tanks: isSun ? 0 : dailyTanks,
        perTank: 0
      });
    }
  } else if (fs.existsSync(compFile)) {
    const rows = parseCsv(fs.readFileSync(compFile, 'utf8'));
    
    // Month 03: build full 31 days combining doc2_tanks_03.csv, doc2_diff_03.csv, and doc2_comp_03.csv
    if (mKey === '03') {
      // 1. Tanks from doc2_tanks_03.csv
      const marchTanks = Array(32).fill(0);
      if (fs.existsSync('doc2_tanks_03.csv')) {
        const tankRows = parseCsv(fs.readFileSync('doc2_tanks_03.csv', 'utf8'));
        const header = tankRows[0] || [];
        const totalRow = tankRows.find(r => r[0] && r[0].startsWith('Total ผปก'));
        if (totalRow) {
          header.forEach((h, colIdx) => {
            if (h.includes('/03/2026')) {
              const d = parseInt(h.split('/')[0]);
              if (d >= 1 && d <= 31) {
                marchTanks[d] = cleanNum(totalRow[colIdx]);
              }
            }
          });
        }
      }

      // 2. Km from doc2_diff_03.csv for days 1-17
      const marchDiffKm = Array(32).fill(0);
      if (fs.existsSync('doc2_diff_03.csv')) {
        const diffRows = parseCsv(fs.readFileSync('doc2_diff_03.csv', 'utf8'));
        diffRows.forEach(r => {
          if (r[9] && r[9].trim() === 'DIFF. + 10%') {
            for (let d = 1; d <= 31; d++) {
              const val = cleanNum(r[9 + d]);
              if (val > 0) marchDiffKm[d] += val;
            }
          }
        });
      }

      // 3. Compensation from doc2_comp_03.csv for days 18-31
      const comp18to31 = {};
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || !row[0] || row[0].includes('ผลรวม')) continue;
        const day = parseInt(row[0].split('/')[0]);
        if (day) {
          comp18to31[day] = {
            km: cleanNum(row[1]),
            litres: cleanNum(row[2]),
            price: cleanNum(row[3]),
            compRate: cleanNum(row[4]),
            comp: cleanNum(row[5]),
            tanks: cleanNum(row[6]),
            perTank: cleanNum(row[7])
          };
        }
      }

      // 4. Assemble all 31 days
      const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
      for (let d = 1; d <= 31; d++) {
        const date = new Date(2026, 2, d);
        const dayName = thaiDays[date.getDay()];
        const dateStr = `${String(d).padStart(2, '0')}/03/2569`;
        const tanks = marchTanks[d] || (comp18to31[d]?.tanks) || 0;

        let km, litres, price, compRate, comp, perTank;
        if (comp18to31[d]) {
          km = comp18to31[d].km;
          litres = comp18to31[d].litres;
          price = comp18to31[d].price;
          compRate = comp18to31[d].compRate;
          comp = comp18to31[d].comp;
          perTank = tanks > 0 ? parseFloat((comp / tanks).toFixed(2)) : 0;
        } else {
          // Days 1 to 17 (Official diesel price 29.94 <= basePrice 30 -> 0 comp)
          km = Math.round(marchDiffKm[d]);
          litres = km > 0 ? parseFloat((km / 8.73).toFixed(2)) : 0;
          price = 29.94;
          compRate = 0;
          comp = 0;
          perTank = 0;
        }

        allFuelPrices[mKey][d] = price;
        allDailyOfficial[mKey].push({
          day: d,
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

// Clone drivers for 01 and 02 from 03 if empty
if (allDriverSummaries['01'].length === 0 && allDriverSummaries['03'] && allDriverSummaries['03'].length > 0) {
  allDriverSummaries['01'] = allDriverSummaries['03'].map(d => ({
    ...d,
    totalCompensation: 0,
    compPerTank: 0
  }));
}
if (allDriverSummaries['02'].length === 0 && allDriverSummaries['03'] && allDriverSummaries['03'].length > 0) {
  allDriverSummaries['02'] = allDriverSummaries['03'].map(d => ({
    ...d,
    totalCompensation: 0,
    compPerTank: 0
  }));
}

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
