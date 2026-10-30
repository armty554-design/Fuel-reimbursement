const fs = require('fs');
const html = fs.readFileSync('doc2_fresh.html', 'utf8');

const targets = [
  'ยอดส่ง 2',
  'รายละเอียดชดเชยน้ำมัน ก.พ.',
  'เลขไมล์ Diff 2',
  'ค่าชดเชย 2',
  'ยอดส่ง 02',
  'เลขไมล์ Diff 02',
  'ค่าชดเชย 02'
];

targets.forEach(t => {
  let pos = 0;
  let count = 0;
  while ((pos = html.indexOf(t, pos)) !== -1) {
    count++;
    console.log(`\n=== Found "${t}" at pos ${pos} ===`);
    const start = Math.max(0, pos - 100);
    const end = Math.min(html.length, pos + 100);
    console.log(html.substring(start, end));
    pos += t.length;
  }
  if (count === 0) {
    console.log(`Not found: "${t}"`);
  }
});
