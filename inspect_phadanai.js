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

for (let r = 0; r < lines.length; r++) {
  if (lines[r].includes('ภาดนัย')) {
    for (let k = 0; k < 5; k++) {
      console.log(lines[r+k].slice(0, 160));
    }
    break;
  }
}
