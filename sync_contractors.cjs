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

// 18 Official Branches mapping
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

const nameToBranch = new Map();
OFFICIAL_BRANCHES.forEach(b => {
  nameToBranch.set(b.name, b);
});

// Load existing seedData to retain mileage records
const existingSeed = JSON.parse(fs.readFileSync('./src/data/seedData.json', 'utf8'));
const records = existingSeed.records || {};
const fuelPrices = existingSeed.fuelPrices || {};

// Parse new Contractors from tab_operators.csv
const operatorRows = parseCsv(fs.readFileSync('tab_operators.csv', 'utf8'));
const drivers = [];
const processedEmp = new Set();

for (let i = 2; i < operatorRows.length; i++) {
  const r = operatorRows[i];
  if (!r || !r[1] || isNaN(parseInt(r[1]))) continue;

  const empId = r[1].trim();
  const vehicleNo = r[2].trim();
  let rawBranchName = r[3].trim();
  if (rawBranchName.includes('ประเวศ')) rawBranchName = 'ประเวศ';

  const prefixTitle = r[4].trim();
  const firstName = r[5].trim();
  const lastName = r[6].trim();
  const startDate = r[7] ? r[7].trim() : '';
  const licensePlate = r[8] ? r[8].trim() : '';
  const zone = r[9] ? r[9].trim() : '';

  // Determine branch
  let branchObj = nameToBranch.get(rawBranchName);
  if (!branchObj) {
    const p = vehicleNo.slice(0, 2);
    branchObj = OFFICIAL_BRANCHES.find(b => b.id === p) || { id: '10', name: 'บางพลี' };
  }

  drivers.push({
    empId,
    vehicleNo,
    prefixTitle,
    firstName,
    lastName,
    branch: branchObj.id,
    branchName: branchObj.name,
    licensePlate,
    zone,
    startDate,
    fuelConsumption: 11.0,
    overridePolicy: 'auto'
  });
  processedEmp.add(empId);
}

// Also keep any company vehicle/drivers (like S/L trucks) from doc1 if they exist
existingSeed.drivers.forEach(d => {
  if (!processedEmp.has(d.empId) && (d.vehicleNo.includes('S') || d.vehicleNo.includes('L'))) {
    drivers.push(d);
    processedEmp.add(d.empId);
  }
});

console.log(`Integrated ${drivers.length} total vehicles/contractors!`);

// Print counts
const branchSummary = {};
OFFICIAL_BRANCHES.forEach(b => {
  branchSummary[`สาขา ${b.id} - ${b.name}`] = drivers.filter(d => d.branch === b.id).length;
});
console.log('\nContractor counts per branch:');
console.log(branchSummary);

// Save updated seedData
const updatedSeed = {
  branches: OFFICIAL_BRANCHES,
  drivers,
  records,
  fuelPrices
};

fs.writeFileSync('./src/data/seedData.json', JSON.stringify(updatedSeed, null, 2), 'utf8');
console.log('Successfully updated src/data/seedData.json with real contractors from spreadsheet!');
