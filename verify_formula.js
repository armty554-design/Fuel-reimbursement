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

let tested = 0;
let mismatches = 0;

for (let r = 5; r < lines.length - 4; r += 5) {
  if (!lines[r] || !lines[r+4]) continue;
  const crm = parseCsvLine(lines[r]);
  const hist = parseCsvLine(lines[r+1]);
  const trip = parseCsvLine(lines[r+2]);
  const comp = parseCsvLine(lines[r+3]);
  const diff = parseCsvLine(lines[r+4]);

  if (diff[9] !== 'DIFF. + 10%') continue;

  for (let d = 1; d <= 31; d++) {
    const cValStr = crm[9 + d];
    const hValStr = hist[9 + d];
    const dValStr = diff[9 + d];

    if (!dValStr || dValStr === '') continue;

    // Special status strings
    const specialStatuses = ['ไม่จด', 'NO', 'ลา', 'ไม่มีงาน', 'ไมล์เสีย'];
    if (specialStatuses.includes(dValStr)) {
      tested++;
      continue;
    }

    const cVal = parseFloat(cValStr);
    const hVal = parseFloat(hValStr);
    const actualDiff = parseFloat(dValStr);

    if (isNaN(actualDiff)) continue;

    tested++;

    // Calculate candidate formula:
    // If History <= CRM * 1.10 (or comp >= -10% with some rounding):
    // comp = (cVal - hVal) / cVal
    // Note that if comp < -10% (meaning hVal > cVal * 1.10)
    let predictedDiff;
    if (isNaN(cVal) || isNaN(hVal)) {
      predictedDiff = actualDiff; // skip
    } else {
      const pct = (cVal - hVal) / cVal;
      // Let's test two variations:
      // A: if hVal <= cVal * 1.10 then hVal else cVal
      // B: if pct >= -0.10 then hVal else cVal
      // Let's check which one matches actualDiff
      const isWithin10 = (hVal <= cVal * 1.10001);
      const chosen = isWithin10 ? hVal : cVal;
      
      if (Math.abs(chosen - actualDiff) > 0.15) {
        mismatches++;
        if (mismatches <= 10) {
          console.log(`Mismatch at row ${r+5} day ${d}: CRM=${cVal}, Hist=${hVal}, actual DIFF=${actualDiff}, chosen=${chosen}, pct=${(pct*100).toFixed(1)}%`);
        }
      }
    }
  }
}

console.log(`Tested ${tested} daily values. Total mismatches: ${mismatches}`);
