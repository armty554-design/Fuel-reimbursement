const fs = require('fs');

function parseCsv(content) {
  const result = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (c === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(cur.trim());
      result.push(row);
      row = [];
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur || row.length) {
    row.push(cur.trim());
    result.push(row);
  }
  return result;
}

['03', '04', '05', '06', '07', '08', '09'].forEach(m => {
  const f = `doc2_diff_${m}.csv`;
  if (fs.existsSync(f)) {
    const rows = parseCsv(fs.readFileSync(f, 'utf8'));
    console.log(`Month ${m}: rows=${rows.length}, colCount=${rows[0]?.length}`);
    console.log(`  Row 1: empId=${rows[1]?.[1]}, vehicle=${rows[1]?.[2]}, name=${rows[1]?.[3]} ${rows[1]?.[4]}, type=${rows[1]?.[9]}`);
    console.log(`  Days start col: ${rows[0]?.[10]}, day 1 val: ${rows[1]?.[10]}`);
  }
});
