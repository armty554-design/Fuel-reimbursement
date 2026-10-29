const fs = require('fs');

const lines = fs.readFileSync('doc1_tab_10.csv', 'utf8').split('\n');
function parseCsvLine(line) {
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
}

let count = 0;
for (let r = 5; r < lines.length - 4; r += 5) {
  if (!lines[r] || !lines[r+4]) continue;
  const crm = parseCsvLine(lines[r]);
  const hist = parseCsvLine(lines[r+1]);
  const trip = parseCsvLine(lines[r+2]);
  const comp = parseCsvLine(lines[r+3]);
  const diff = parseCsvLine(lines[r+4]);

  for (let d = 1; d <= 31; d++) {
    const cVal = parseFloat(crm[9 + d]);
    const hVal = parseFloat(hist[9 + d]);
    const dVal = parseFloat(diff[9 + d]);
    const pVal = comp[9 + d];

    if (!isNaN(cVal) && !isNaN(hVal) && !isNaN(dVal)) {
      // test: if comp is negative vs positive
      // let pct = (hVal - cVal) / cVal
      // In the sheet: Day 1: CRM=31, Hist=31.19 => Comp = -1% -> DIFF = 31.2 (History)
      // Day 2: CRM=50, Hist=45.00 => Comp = 10% -> DIFF = 45.0 (History)
      // Day 3: CRM=60, Hist=47.60 => Comp = 21% -> DIFF = 60.0 (CRM) !!
      // In tab คำแนะนำ:
      // Day 1: CRM=31, Hist=31.19 -> DIFF=31.2 (History)
      // Day 2: CRM=50, Hist=45.00 -> DIFF=45.0 (History)
      // Day 3: CRM=60, Hist=47.60 -> DIFF=60.0 (CRM)
      // Day 9: CRM=30, Hist=empty -> DIFF=30.0 (CRM)
      if (count < 25 && (cVal > hVal || hVal > cVal * 1.1)) {
        console.log(`Driver ${crm[3]} d${d}: CRM=${cVal}, Hist=${hVal}, DIFF=${dVal}, Comp=${pVal}`);
        count++;
      }
    }
  }
}
