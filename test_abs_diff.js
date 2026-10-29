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

// Let's test the hypothesis:
// abs((CRM - Hist) / CRM) <= 0.10  => History
// else => CRM

let tested = 0;
let matchCount = 0;
let errors = [];

for (let r = 5; r < lines.length - 4; r += 5) {
  if (!lines[r] || !lines[r+4]) continue;
  const crm = parseCsvLine(lines[r]);
  const hist = parseCsvLine(lines[r+1]);
  const diff = parseCsvLine(lines[r+4]);

  if (diff[9] !== 'DIFF. + 10%') continue;

  for (let d = 1; d <= 31; d++) {
    const cStr = crm[9 + d];
    const hStr = hist[9 + d];
    const dStr = diff[9 + d];

    if (!dStr) continue;
    if (['ไม่จด', 'NO', 'ลา', 'ไม่มีงาน', 'ไมล์เสีย'].includes(dStr)) continue;

    const c = parseFloat(cStr);
    const h = parseFloat(hStr);
    const actual = parseFloat(dStr);

    if (isNaN(actual)) continue;

    tested++;

    // Formula test:
    let pred;
    if (isNaN(c) && !isNaN(h)) pred = h;
    else if (!isNaN(c) && isNaN(h)) pred = c;
    else if (!isNaN(c) && !isNaN(h)) {
      if (c === 0) {
        pred = (h === 0) ? 0 : 0; // or c
      } else {
        const diffRatio = (c - h) / c; // e.g. -0.05 or +0.05
        // if diff is between -10% and +10% (-0.10 <= diffRatio <= 0.10)
        // or Math.abs(diffRatio) <= 0.1001
        if (Math.abs(diffRatio) <= 0.10001) {
          pred = h;
        } else {
          pred = c;
        }
      }
    }

    if (Math.abs(pred - actual) <= 0.15) {
      matchCount++;
    } else {
      errors.push({ driver: crm[3], day: d, c, h, actual, pred, ratio: ((c-h)/c*100).toFixed(1) + '%' });
    }
  }
}

console.log(`Tested ${tested} values: Matches = ${matchCount} (${(matchCount/tested*100).toFixed(2)}%), Errors = ${errors.length}`);
if (errors.length > 0) {
  console.log('Sample errors:', errors.slice(0, 15));
}
