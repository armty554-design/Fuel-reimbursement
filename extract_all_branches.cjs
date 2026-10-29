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

// 1. Diesel Fuel Prices from sheet2.csv
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
} catch (e) {
  console.error('Error fuel prices:', e);
}

// Ensure 31 days have fuel prices (default 41.44 or 42.19 if missing)
for (let d = 1; d <= 31; d++) {
  if (!fuelPrices[d]) {
    fuelPrices[d] = d <= 8 ? 42.19 : (d <= 20 ? 42.94 : 43.54);
  }
}

// 2. Branches
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

// 3. Extract all drivers and their daily records from doc1_tab_10.csv
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

    // Check if there's special note e.g. "ยึด history"
    let overridePolicy = 'auto';
    if (crmRow.join(' ').includes('ยึด history') || histRow.join(' ').includes('ยึด history')) {
      overridePolicy = 'history';
    }

    drivers.push({
      empId,
      vehicleNo,
      firstName,
      lastName,
      branch: '10',
      branchName: 'บางพลี',
      fuelConsumption: 11.0,
      overridePolicy
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
  console.error('Error doc1_tab_10:', e);
}

// Let's also check doc2_tab_detail_oct.csv to see if other branches exist in doc2!
try {
  const d2Rows = parseCsv(fs.readFileSync('doc2_tab_detail_oct.csv', 'utf8'));
  // L1 headers: รหัสพนักงาน,เบอร์รถ,ชื่อพนักงานส่ง,นามสกุล,วันที่ส่ง,เลขไมล์ (กม.),อัตรากินน้ามัน,ค่าชดเชยน้ำมัน,ราคาน้ำมัน,อัตราค่าชดเชยน้ำมัน,ปริมาณน้ำมันที่ใช้จริง,ค่าใช้จ่ายน้ำมันที่ใช้จริง,ยอดส่ง,เดือน,สาขา
  // Col 0: empId, 1: vehicleNo, 2: firstName, 3: lastName, 4: dateStr (1/10/2026), 5: mileage, 12: deliveryUnits, 14: branchName, 16: branchId
  console.log('Scanning doc2 detail oct for drivers from all branches...');
  const existingEmpIds = new Set(drivers.map(d => d.empId));
  
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
    const deliveryUnits = parseInt(row[12]) || 0;
    const branchName = row[14] ? row[14].trim() : '';
    const branchId = row[16] ? row[16].trim() : '10';

    if (!existingEmpIds.has(empId)) {
      existingEmpIds.add(empId);
      drivers.push({
        empId,
        vehicleNo,
        firstName,
        lastName,
        branch: branchId || '10',
        branchName: branchName || 'สาขา ' + branchId,
        fuelConsumption: 11.0,
        overridePolicy: 'auto'
      });
    }

    if (!records[empId]) {
      records[empId] = {};
    }

    if (dateStr) {
      // dateStr: "1/10/2026" or "01/10/2026"
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
          if (deliveryUnits > 0) {
            records[empId][day].deliveryUnits = deliveryUnits;
          }
        }
      }
    }
  }
} catch (e) {
  console.log('Error scanning doc2 detail:', e.message);
}

console.log(`Total unique drivers extracted: ${drivers.length}`);

// Output summary counts per branch
const branchCounts = {};
drivers.forEach(d => {
  branchCounts[d.branch] = (branchCounts[d.branch] || 0) + 1;
});
console.log('Drivers per branch:', branchCounts);

const seedData = {
  branches,
  drivers,
  records,
  fuelPrices
};

fs.writeFileSync('./src/data/seedData.json', JSON.stringify(seedData, null, 2), 'utf8');
console.log('Updated src/data/seedData.json successfully!');
