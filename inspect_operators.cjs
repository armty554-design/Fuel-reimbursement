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

const rows = parseCsv(fs.readFileSync('tab_operators.csv', 'utf8'));
console.log('Total rows:', rows.length);
console.log('Header Row 1:', rows[1]);

// Check unique branches and count
const branchCounts = {};
const contractors = [];

for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1] || isNaN(parseInt(r[1]))) continue;
  
  const empId = r[1].trim();
  const vehicleNo = r[2].trim();
  const branchName = r[3].trim();
  const prefixTitle = r[4].trim();
  const firstName = r[5].trim();
  const lastName = r[6].trim();
  const startDate = r[7].trim();
  const licensePlate = r[8].trim();
  const zone = r[9].trim();

  branchCounts[branchName] = (branchCounts[branchName] || 0) + 1;
  contractors.push({
    empId,
    vehicleNo,
    branchName,
    prefixTitle,
    firstName,
    lastName,
    startDate,
    licensePlate,
    zone
  });
}

console.log(`\nValid contractors found: ${contractors.length}`);
console.log('\nContractor counts by branch:');
console.log(branchCounts);
console.log('\nSample 5 records:', contractors.slice(0, 5));
