const fs = require('fs');

// Read doc1_tab_10.csv
const lines = fs.readFileSync('doc1_tab_10.csv', 'utf8').split('\n');

// Parse CSV simple
function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

// Check row 11-15: ธีรยุทธ
// L11: CRM
// L12: History
// L13: รายงานค่าเที่ยวรถ.
// L14: เปรียบเทียบ( CRM/History)
// L15: DIFF. + 10%

for (let r = 5; r < 40; r += 5) {
  if (!lines[r]) continue;
  const crm = parseCsvLine(lines[r]);
  const hist = parseCsvLine(lines[r+1]);
  const trip = parseCsvLine(lines[r+2]);
  const comp = parseCsvLine(lines[r+3]);
  const diff = parseCsvLine(lines[r+4]);

  console.log(`\n=== Driver: ${crm[3]} ${crm[4]} (${crm[1]} / ${crm[2]}) ===`);
  // Inspect days 1 to 15 (columns index 10 to 25)
  for (let d = 1; d <= 10; d++) {
    // day d column
    // let's find column of day d
    const cVal = crm[9 + d];
    const hVal = hist[9 + d];
    const tVal = trip[9 + d];
    const pVal = comp[9 + d];
    const dVal = diff[9 + d];
    console.log(`Day ${d}: CRM=${cVal}, Hist=${hVal}, Trip=${tVal}, Comp=${pVal} ==> DIFF+10%=${dVal}`);
  }
}
