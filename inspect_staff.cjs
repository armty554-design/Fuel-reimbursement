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

const rows = parseCsv(fs.readFileSync('contractors.csv', 'utf8'));
console.log('Total rows:', rows.length);
console.log('Header Row 1:', rows[1]);

// Let's inspect unique positions and sample rows
const positions = new Set();
const staffList = [];

for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1] || isNaN(parseInt(r[1]))) continue;
  const empId = r[1].trim();
  const zone = r[3].trim();
  const branchName = r[4].trim();
  const prefixTitle = r[5].trim();
  const firstName = r[6].trim();
  const lastName = r[7].trim();
  const position = r[8].trim();
  const startDate = r[9] ? r[9].trim() : '';

  positions.add(position);
  staffList.push({
    empId,
    zone,
    branchName,
    prefixTitle,
    firstName,
    lastName,
    position,
    startDate
  });
}

console.log(`Valid staff count: ${staffList.length}`);
console.log('Unique positions:', [...positions]);
console.log('Sample 10 staff:', staffList.slice(0, 10));
