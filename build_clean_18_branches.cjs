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

// 18 Standard Branches from Google Sheets
const OFFICIAL_BRANCHES = [
  { id: '10', name: 'บางพลี' },
  { id: '11', name: 'สุขุมวิท 50' },
  { id: '12', name: 'วังน้อย' },
  { id: '13', name: 'รามอินทรา' },
  { id: '14', name: 'ราษฎร์บูรณะ' },
  { id: '15', name: 'สำโรง' },
  { id: '16', name: 'กรุงเทพกรีฑา' },
  { id: '17', name: 'บางบัวทอง' },
  { id: '18', name: 'ประชาชื่น' },
  { id: '20', name: 'พระราม 2' },
  { id: '30', name: 'ปทุมธานี' },
  { id: '40', name: 'บุคคโล' },
  { id: '50', name: 'พระราม 3' },
  { id: '60', name: 'ปากเกร็ด' },
  { id: '70', name: 'กิ่งแก้ว' },
  { id: '80', name: 'พุทธมณฑลสาย 1' },
  { id: '90', name: 'ประเวศ' },
  { id: '98', name: 'ดอนเมือง' }
];

const branchById = new Map(OFFICIAL_BRANCHES.map(b => [b.id, b.name]));

// Read fuel prices
const fuelPrices = {};
try {
  const s2Lines = fs.readFileSync('sheet2.csv', 'utf8').split('\n');
  for (let i = 2; i < s2Lines.length; i++) {
    const parts = s2Lines[i].split(',');
    if (parts.length >= 24) {
      const dStr = parts[22] ? parts[22].trim() : '';
      const pStr = parts[23] ? parts[23].trim() : '';
      if (dStr && pStr && !isNaN(parseFloat(pStr))) {
        const day = parseInt(dStr.split('/')[0]);
        if (day) fuelPrices[day] = parseFloat(pStr);
      }
    }
  }
} catch (e) {}

for (let d = 1; d <= 31; d++) {
  if (!fuelPrices[d]) {
    fuelPrices[d] = d <= 8 ? 42.19 : (d <= 20 ? 42.94 : 43.54);
  }
}

// 1. Read tab 10 (Branch 10 บางพลี) to get detailed CRM, History, and TripReport
const records = {};
const driversMap = new Map();

try {
  const rows = parseCsv(fs.readFileSync('doc1_tab_10.csv', 'utf8'));
  for (let r = 5; r < rows.length - 4; r += 5) {
    const crmRow = rows[r];
    const histRow = rows[r+1];
    const tripRow = rows[r+2];

    if (!crmRow || !crmRow[1] || isNaN(parseInt(crmRow[1]))) continue;

    const empId = crmRow[1].trim();
    const vehicleNo = crmRow[2].trim();
    const firstName = crmRow[3].trim();
    const lastName = crmRow[4].trim();

    driversMap.set(empId, {
      empId,
      vehicleNo,
      firstName,
      lastName,
      branch: '10',
      branchName: 'บางพลี',
      fuelConsumption: 11.0,
      overridePolicy: 'auto'
    });

    records[empId] = {};
    for (let d = 1; d <= 31; d++) {
      records[empId][d] = {
        crm: crmRow[9 + d] || '',
        history: histRow[9 + d] || '',
        tripReport: tripRow[9 + d] || '',
        deliveryUnits: 0
      };
    }
  }
} catch (e) {
  console.error(e);
}

// 2. Read doc1_tab_diff.csv for all 18 branches!
try {
  const diffRows = parseCsv(fs.readFileSync('doc1_tab_diff.csv', 'utf8'));
  for (let i = 14; i < diffRows.length; i++) {
    const r = diffRows[i];
    if (!r || !r[1] || isNaN(parseInt(r[1])) || !r[2]) continue;

    const empId = r[1].trim();
    const vehicleNo = r[2].trim();
    const firstName = r[3].trim();
    const lastName = r[4].trim();

    // The vehicle prefix indicates the true branch ID
    const prefix = vehicleNo.slice(0, 2);
    const branchName = branchById.get(prefix) || 'บางพลี';
    const branchId = branchById.has(prefix) ? prefix : '10';

    const kmPerLitre = parseFloat(r[45]) || 11.0;

    if (!driversMap.has(empId)) {
      driversMap.set(empId, {
        empId,
        vehicleNo,
        firstName,
        lastName,
        branch: branchId,
        branchName: branchName,
        fuelConsumption: kmPerLitre,
        overridePolicy: 'auto'
      });
    }

    if (!records[empId]) {
      records[empId] = {};
    }

    // Days 1 to 31 are in columns 10 to 40 (or check non-empty)
    for (let d = 1; d <= 31; d++) {
      const dailyVal = r[9 + d] || '';
      if (!records[empId][d]) {
        records[empId][d] = {
          crm: dailyVal,
          history: dailyVal,
          tripReport: '',
          deliveryUnits: 0
        };
      } else {
        // If empty in tab 10, fill
        if (!records[empId][d].crm && dailyVal) {
          records[empId][d].crm = dailyVal;
          records[empId][d].history = dailyVal;
        }
      }
    }
  }
} catch (e) {
  console.error(e);
}

const allDrivers = Array.from(driversMap.values());
console.log(`Loaded ${allDrivers.length} drivers total!`);

// Print count per branch
const counts = {};
OFFICIAL_BRANCHES.forEach(b => {
  counts[`สาขา ${b.id} - ${b.name}`] = allDrivers.filter(d => d.branch === b.id).length;
});
console.log('Driver counts per official branch:');
console.log(counts);

const seedData = {
  branches: OFFICIAL_BRANCHES,
  drivers: allDrivers,
  records,
  fuelPrices
};

fs.writeFileSync('./src/data/seedData.json', JSON.stringify(seedData, null, 2), 'utf8');
console.log('Successfully written clean seedData.json with exact 18 official branches!');
