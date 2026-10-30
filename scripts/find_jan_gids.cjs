const https = require('https');
const fs = require('fs');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location).then(resolve);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching Google Sheet HTML...');
  const html = await fetchHtml('https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/edit?gid=277935568');
  console.log('HTML length:', html.length);
  fs.writeFileSync('doc2_fresh.html', html, 'utf8');

  // Search for the 4 names
  const targets = [
    'ยอดส่ง 1',
    'รายละเอียดชดเชยน้ำมัน ม.ค.',
    'เลขไมล์ Diff 1',
    'ค่าชดเชย 1',
    'ยอดส่ง 01',
    'เลขไมล์ Diff 01',
    'ค่าชดเชย 01'
  ];

  targets.forEach(t => {
    let pos = 0;
    while ((pos = html.indexOf(t, pos)) !== -1) {
      console.log(`\n=== Found "${t}" at pos ${pos} ===`);
      const start = Math.max(0, pos - 150);
      const end = Math.min(html.length, pos + 150);
      console.log(html.substring(start, end));
      pos += t.length;
    }
  });
}

main().catch(console.error);
