const https = require('https');
const fs = require('fs');

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchCsv(res.headers.location).then(resolve);
      }
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  const doc1Base = 'https://docs.google.com/spreadsheets/d/19Mf5jnes2u5Z3IXz0vZyq1teHnmw0kHFzzDICHGP02k/export?format=csv&gid=';
  const doc2Base = 'https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/export?format=csv&gid=';

  // Key tabs to examine:
  // Doc 1:
  // 816992290 => สาขา 10
  // 159714516 => ชดเชย DIFF. + 10%
  // 2006412254 => เปรียบเทียบ
  // 256833113 => ผู้รับผิดชอบ
  // 1657763973 => คำแนะนำ

  // Doc 2:
  // 29931557 => รายละเอียดชดเชยน้ำมัน ต.ค.
  // 1923881986 => ค่าชดเชย 10
  // 1173352041 => เลขไมล์ Diff 10
  // 375387489 => ยอดส่ง 10
  // 1027179135 => ค่าชดเชยน้ำมันย้อนหลัง 3 ปี

  const targets = [
    { name: 'doc1_tab_10.csv', url: doc1Base + '816992290' },
    { name: 'doc1_tab_diff.csv', url: doc1Base + '159714516' },
    { name: 'doc1_tab_compare.csv', url: doc1Base + '2006412254' },
    { name: 'doc2_tab_detail_oct.csv', url: doc2Base + '29931557' },
    { name: 'doc2_tab_comp_oct.csv', url: doc2Base + '1923881986' },
    { name: 'doc2_tab_diff_oct.csv', url: doc2Base + '1173352041' }
  ];

  for (const t of targets) {
    console.log('Fetching', t.name);
    try {
      const data = await fetchCsv(t.url);
      fs.writeFileSync(t.name, data, 'utf8');
      console.log('Saved', t.name, 'size:', data.length);
    } catch (e) {
      console.error('Error fetching', t.name, e);
    }
  }
}

main();
