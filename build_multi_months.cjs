const fs = require('fs');

function parseCsv(content) {
  const lines = content.split('\n');
  return lines.map(line => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else cur += c;
    }
    result.push(cur.trim());
    return result;
  });
}

// 1. Build Fuel Prices for all months (03 to 10)
const s2Lines = parseCsv(fs.readFileSync('sheet2.csv', 'utf8'));
const monthPriceCols = {
  '03': { colDate: 0, colPrice: 1, days: 31, name: 'มีนาคม 2569' },
  '04': { colDate: 3, colPrice: 4, days: 30, name: 'เมษายน 2569' },
  '05': { colDate: 6, colPrice: 7, days: 31, name: 'พฤษภาคม 2569' },
  '06': { colDate: 9, colPrice: 10, days: 30, name: 'มิถุนายน 2569' },
  '07': { colDate: 12, colPrice: 13, days: 31, name: 'กรกฎาคม 2569' },
  '08': { colDate: 15, colPrice: 16, days: 31, name: 'สิงหาคม 2569' },
  '09': { colDate: 18, colPrice: 19, days: 30, name: 'กันยายน 2569' },
  '10': { colDate: 21, colPrice: 22, days: 31, name: 'ตุลาคม 2569' }
};

const allFuelPrices = {};
Object.keys(monthPriceCols).forEach(mKey => {
  allFuelPrices[mKey] = {};
  const { colDate, colPrice, days } = monthPriceCols[mKey];
  for (let r = 2; r < s2Lines.length; r++) {
    const row = s2Lines[r];
    if (row && row.length > colPrice) {
      const dStr = row[colDate] ? row[colDate].trim() : '';
      const pStr = row[colPrice] ? row[colPrice].trim() : '';
      if (dStr && pStr && !isNaN(parseFloat(pStr))) {
        const dayNum = parseInt(dStr.split('/')[0]);
        if (dayNum >= 1 && dayNum <= days) {
          allFuelPrices[mKey][dayNum] = parseFloat(pStr);
        }
      }
    }
  }
});

console.log('Fuel prices sample:');
console.log('Month 03 day 1:', allFuelPrices['03'][1], 'day 31:', allFuelPrices['03'][31]);
console.log('Month 10 day 1:', allFuelPrices['10'][1], 'day 31:', allFuelPrices['10'][31]);

// 2. Load existing seedData for official branches, drivers & contractors
const seedData = JSON.parse(fs.readFileSync('./src/data/seedData.json', 'utf8'));
const drivers = seedData.drivers;
const branches = seedData.branches;
const staffUsers = seedData.staffUsers;

// 3. Process diff records for each month
// Structure of allMonthRecords[monthKey][empId][day] = { crm, history, tripReport, deliveryUnits }
const allMonthRecords = {};

const monthKeys = ['03', '04', '05', '06', '07', '08', '09', '10'];

monthKeys.forEach(mKey => {
  allMonthRecords[mKey] = {};
  const daysInMonth = monthPriceCols[mKey].days;
  const fileName = `doc2_diff_${mKey}.csv`;

  if (fs.existsSync(fileName)) {
    console.log(`Parsing records from ${fileName}...`);
    const diffRows = parseCsv(fs.readFileSync(fileName, 'utf8'));
    let recordCount = 0;

    for (let r = 10; r < diffRows.length; r++) {
      const row = diffRows[r];
      if (!row || !row[1] || isNaN(parseInt(row[1]))) continue;

      const empId = row[1].trim();
      const diffIndicator = row[9] ? row[9].trim() : '';
      if (diffIndicator !== 'DIFF. + 10%') continue;

      if (!allMonthRecords[mKey][empId]) {
        allMonthRecords[mKey][empId] = {};
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const val = row[9 + d] || '';
        allMonthRecords[mKey][empId][d] = {
          crm: val,
          history: val,
          tripReport: '',
          deliveryUnits: 0
        };
      }
      recordCount++;
    }
    console.log(`  Month ${mKey}: Loaded ${recordCount} drivers records`);
  }
});

// Also merge month 10 records from existing seedData (which has tab 10 detailed CRM & History)
if (seedData.records) {
  Object.keys(seedData.records).forEach(empId => {
    if (!allMonthRecords['10'][empId]) {
      allMonthRecords['10'][empId] = seedData.records[empId];
    } else {
      // merge
      for (let d = 1; d <= 31; d++) {
        if (seedData.records[empId][d]?.crm) {
          allMonthRecords['10'][empId][d] = seedData.records[empId][d];
        }
      }
    }
  });
}

// 4. Build Month Definitions List
const monthList = [
  { key: '03', name: 'มีนาคม 2569', year: 2026, monthIndex: 2, days: 31 },
  { key: '04', name: 'เมษายน 2569', year: 2026, monthIndex: 3, days: 30 },
  { key: '05', name: 'พฤษภาคม 2569', year: 2026, monthIndex: 4, days: 31 },
  { key: '06', name: 'มิถุนายน 2569', year: 2026, monthIndex: 5, days: 30 },
  { key: '07', name: 'กรกฎาคม 2569', year: 2026, monthIndex: 6, days: 31 },
  { key: '08', name: 'สิงหาคม 2569', year: 2026, monthIndex: 7, days: 31 },
  { key: '09', name: 'กันยายน 2569', year: 2026, monthIndex: 8, days: 30 },
  { key: '10', name: 'ตุลาคม 2569', year: 2026, monthIndex: 9, days: 31 }
];

const newSeed = {
  branches,
  drivers,
  staffUsers,
  monthList,
  allFuelPrices,
  allMonthRecords,
  // backwards compatibility defaults for current month
  fuelPrices: allFuelPrices['10'],
  records: allMonthRecords['10']
};

fs.writeFileSync('./src/data/seedData.json', JSON.stringify(newSeed, null, 2), 'utf8');
console.log('Successfully written all 8 months (มี.ค. - ต.ค. 2569) to seedData.json!');
