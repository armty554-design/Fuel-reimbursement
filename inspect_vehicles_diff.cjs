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

const diffLines = parseCsv(fs.readFileSync('doc1_tab_diff.csv', 'utf8'));

// Search for branch names or vehicle prefixes
const vehicles = [];
diffLines.forEach((r, idx) => {
  if (r[1] && !isNaN(parseInt(r[1])) && r[2]) {
    vehicles.push({
      row: idx,
      empId: r[1],
      vehicleNo: r[2],
      name: `${r[3]} ${r[4]}`,
      col22: r[21], // Check what is in columns
      col23: r[22]
    });
  }
});

console.log(`Total drivers in doc1_tab_diff: ${vehicles.length}`);
console.log('Sample vehicles:', vehicles.slice(0, 10));

// Check vehicle prefix distribution (e.g. 10101 -> 10, 11201 -> 11, etc.)
const prefixCounts = {};
vehicles.forEach(v => {
  const prefix = v.vehicleNo.slice(0, 2);
  prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
});
console.log('Vehicle 2-digit prefix distribution:');
console.log(prefixCounts);
