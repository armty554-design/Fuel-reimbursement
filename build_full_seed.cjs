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

// Map warehouse names to clean IDs
const nameToId = {
  'บางพลี': '10',
  'กิ่งแก้ว': '11',
  'สุขุมวิท 50': '11',
  'ปทุมธานี': '12',
  'ดอนเมือง': '13',
  'บางบัวทอง': '14',
  'ประชาชื่น': '15',
  'กรุงเทพกรีฑา': '16',
  'บุคคโล': '17',
  'ราษฎร์บูรณะ': '17',
  'พระราม 2': '18',
  'สำโรง': '19',
  'วังน้อย': '40',
  'รามอินทรา': '13'
};

function cleanName(raw) {
  if (!raw) return 'บางพลี';
  const clean = raw.replace(/[^\u0E00-\u0E7F0-9\s]/g, '').trim();
  for (const k of Object.keys(nameToId)) {
    if (clean.includes(k) || k.includes(clean)) return k;
  }
  return clean || 'บางพลี';
}

const d2Rows = parseCsv(fs.readFileSync('doc2_tab_detail_oct.csv', 'utf8'));
const driversMap = new Map();
const records = {};

// Also load initial fuelPrices
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

// 1. First populate from doc1_tab_10.csv (has both CRM, History, and Trip)
try {
  const rows = parseCsv(fs.readFileSync('doc1_tab_10.csv', 'utf8'));
  for (let r = 5; r < rows.length - 4; r += 5) {
    const crmRow = rows[r];
    const histRow = rows[r+1];
    const tripRow = rows[r+2];

    if (!crmRow || !crmRow[1] || isNaN(parseInt(crmRow[1]))) continue;

    const empId = crmRow[1];
    const vehicleNo = crmRow[2];
    const firstName = crmRow[3];
    const lastName = crmRow[4];

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
} catch (e) {}

// 2. Populate remaining from doc2
for (let i = 3; i < d2Rows.length; i++) {
  const row = d2Rows[i];
  if (!row || !row[0]) continue;
  const empId = row[0].trim();
  if (!empId || isNaN(parseInt(empId))) continue;

  const vehicleNo = row[1] ? row[1].trim() : '';
  const firstName = row[2] ? row[2].trim() : '';
  const lastName = row[3] ? row[3].trim() : '';
  const dateStr = row[4] ? row[4].trim() : '';
  const mileage = row[5] ? row[5].trim() : '';
  const kmPerL = parseFloat(row[6]) || 11.0;
  const deliveryUnits = parseInt(row[12]) || 0;
  const rawBranchName = row[14] ? row[14].trim() : '';
  const cleanBranch = cleanName(rawBranchName);
  const branchId = nameToId[cleanBranch] || '10';

  if (!driversMap.has(empId)) {
    driversMap.set(empId, {
      empId,
      vehicleNo,
      firstName,
      lastName,
      branch: branchId,
      branchName: cleanBranch,
      fuelConsumption: kmPerL,
      overridePolicy: 'auto'
    });
  }

  if (!records[empId]) {
    records[empId] = {};
  }

  if (dateStr) {
    const day = parseInt(dateStr.split('/')[0]);
    if (day >= 1 && day <= 31) {
      if (!records[empId][day]) {
        records[empId][day] = {
          crm: mileage,
          history: mileage,
          tripReport: '',
          deliveryUnits
        };
      } else {
        if (deliveryUnits > 0) records[empId][day].deliveryUnits = deliveryUnits;
        if (!records[empId][day].crm && mileage) {
          records[empId][day].crm = mileage;
          records[empId][day].history = mileage;
        }
      }
    }
  }
}

const allDrivers = Array.from(driversMap.values());
console.log(`Total Drivers: ${allDrivers.length}`);

// Unique branches
const branchMap = new Map();
allDrivers.forEach(d => {
  if (!branchMap.has(d.branch)) {
    branchMap.set(d.branch, { id: d.branch, name: d.branchName });
  }
});
const branches = Array.from(branchMap.values()).sort((a,b) => parseInt(a.id) - parseInt(b.id));

console.log('Branches in system:', branches);

const seedData = {
  branches,
  drivers: allDrivers,
  records,
  fuelPrices
};

fs.writeFileSync('./src/data/seedData.json', JSON.stringify(seedData, null, 2), 'utf8');
console.log('Successfully saved src/data/seedData.json with all branches and drivers!');
