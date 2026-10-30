const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve);
      }
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

const base = 'https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/export?format=csv&gid=';

async function main() {
  const janSheets = [
    { name: 'ค่าชดเชย 1', file: 'doc2_comp_01.csv', gid: '1705387900' },
    { name: 'เลขไมล์ Diff 1', file: 'doc2_diff_01.csv', gid: '2144916075' },
    { name: 'ยอดส่ง 1', file: 'doc2_tanks_01.csv', gid: '1580669641' },
    { name: 'รายละเอียดชดเชยน้ำมัน ม.ค.', file: 'doc2_detail_01.csv', gid: '277935568' }
  ];

  for (const s of janSheets) {
    console.log(`Downloading ${s.name} (GID: ${s.gid})...`);
    const csv = await fetchUrl(base + s.gid);
    fs.writeFileSync(s.file, csv, 'utf8');
    console.log(`  Saved ${s.file} (${csv.length} bytes)`);
    const firstLines = csv.split('\n').slice(0, 5).join('\n');
    console.log(`  Preview:\n${firstLines}\n`);
  }
}

main().catch(console.error);
