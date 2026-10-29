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

// 1. Build initial fuel prices from doc2
const doc2Prices = {};
try {
  const lines = fs.readFileSync('sheet2.csv', 'utf8').split('\n');
  // Row 2 is headers, row 3..33 is daily
  for (let i = 2; i < lines.length; i++) {
    const parts = lines[i].split(',');
    // col 21, 22 is Oct: "01/10/26", "41.44"
    if (parts.length >= 23) {
      const dStr = parts[22] ? parts[22].trim() : '';
      const pStr = parts[23] ? parts[23].trim() : '';
      if (dStr && pStr && !isNaN(parseFloat(pStr))) {
        // e.g. 01/10/26 -> day 1
        const day = parseInt(dStr.split('/')[0]);
        if (day) doc2Prices[day] = parseFloat(pStr);
      }
    }
  }
} catch (e) {
  console.log('Error reading fuel prices', e);
}

// 2. Extract drivers from doc1_tab_10.csv
const drivers = [];
const records = {};

try {
  const rows = parseCsv(fs.readFileSync('doc1_tab_10.csv', 'utf8'));
  for (let r = 5; r < rows.length - 4; r += 5) {
    const crmRow = rows[r];
    const histRow = rows[r+1];
    const tripRow = rows[r+2];
    const compRow = rows[r+3];
    const diffRow = rows[r+4];

    if (!crmRow || !crmRow[1] || isNaN(parseInt(crmRow[1]))) continue;

    const empId = crmRow[1];
    const vehicleNo = crmRow[2];
    const firstName = crmRow[3];
    const lastName = crmRow[4];

    const driverObj = {
      empId,
      vehicleNo,
      firstName,
      lastName,
      branch: '10',
      branchName: 'บางพลี',
      fuelConsumption: 11.0, // km/L
      overridePolicy: 'auto' // 'auto' | 'history' | 'crm'
    };
    drivers.push(driverObj);

    // Daily records for 31 days
    records[empId] = {};
    for (let d = 1; d <= 31; d++) {
      records[empId][d] = {
        crm: crmRow[9 + d] || '',
        history: histRow[9 + d] || '',
        tripReport: tripRow[9 + d] || '',
        deliveryUnits: 0 // can fill if available
      };
    }
  }
} catch (e) {
  console.log('Error reading doc1_tab_10.csv', e);
}

console.log(`Extracted ${drivers.length} drivers for branch 10`);

// Also add a list of all branches
const branches = [
  { id: '10', name: 'บางพลี' },
  { id: '11', name: 'กิ่งแก้ว' },
  { id: '12', name: 'ปทุมธานี' },
  { id: '13', name: 'ดอนเมือง' },
  { id: '14', name: 'บางบัวทอง' },
  { id: '15', name: 'ประชาชื่น' },
  { id: '16', name: 'กรุงเทพกรีฑา' },
  { id: '17', name: 'บุคคโล' },
  { id: '18', name: 'พระราม 2' },
  { id: '20', name: 'ชลบุรี' },
  { id: '30', name: 'ระยอง' },
  { id: '40', name: 'อยุธยา' },
  { id: '50', name: 'นครราชสีมา' },
  { id: '60', name: 'ขอนแก่น' },
  { id: '70', name: 'เชียงใหม่' },
  { id: '80', name: 'พิษณุโลก' },
  { id: '90', name: 'สุราษฎร์ธานี' },
  { id: '98', name: 'หาดใหญ่' }
];

const seedData = {
  branches,
  drivers,
  records,
  fuelPrices: doc2Prices
};

fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/seedData.json', JSON.stringify(seedData, null, 2), 'utf8');
console.log('Successfully saved src/data/seedData.json');
