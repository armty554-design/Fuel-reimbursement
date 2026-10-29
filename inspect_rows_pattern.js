const fs = require('fs');

const tab10 = fs.readFileSync('doc1_tab_10.csv', 'utf8').split('\n');

// Find rows for employee 1 (lines 6-10) and employee 2 (lines 11-15) and others
for (let i = 0; i < 40; i++) {
  if (tab10[i]) {
    const parts = tab10[i].split(',');
    console.log(`L${i+1}: [${parts[1]}] [${parts[2]}] [${parts[3]}] [${parts[5]}] [${parts[9]}] d1=${parts[10]} d2=${parts[11]} d3=${parts[12]} d5=${parts[14]} d6=${parts[15]}`);
  }
}
