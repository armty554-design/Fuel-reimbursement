const fs = require('fs');

const tab10 = fs.readFileSync('doc1_tab_10.csv', 'utf8');
const lines = tab10.split('\n');
console.log('Doc1 tab 10 lines count:', lines.length);

// Let's check employee IDs and names in tab 10
const empInTab10 = [];
for (let r = 5; r < lines.length - 4; r += 5) {
  const parts = lines[r].split(',');
  if (parts[1] && !isNaN(parseInt(parts[1]))) {
    empInTab10.push({
      empId: parts[1],
      vehicleNo: parts[2],
      name: parts[3] + ' ' + parts[4]
    });
  }
}
console.log(`Employees in tab 10: ${empInTab10.length}`);
console.log('First 5:', empInTab10.slice(0, 5));
