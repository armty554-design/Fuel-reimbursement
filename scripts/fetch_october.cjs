const fs = require('fs');
const https = require('https');

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

const octConfig = {
  key: '10',
  name: 'ตุลาคม 2569',
  compGid: '1923881986',   // ค่าชดเชย 10
  diffGid: '1173352041',   // เลขไมล์ Diff 10
  tanksGid: '375387489',   // ยอดส่ง 10
  detailGid: '29931557'    // รายละเอียดชดเชยน้ำมัน ต.ค.
};

async function main() {
  const base = 'https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/export?format=csv&gid=';
  console.log(`Downloading October 2569 sheets...`);

  const compCsv = await fetchUrl(base + octConfig.compGid);
  fs.writeFileSync('doc2_comp_10.csv', compCsv, 'utf8');
  console.log(`Saved doc2_comp_10.csv: ${compCsv.length} bytes`);

  const diffCsv = await fetchUrl(base + octConfig.diffGid);
  fs.writeFileSync('doc2_diff_10.csv', diffCsv, 'utf8');
  console.log(`Saved doc2_diff_10.csv: ${diffCsv.length} bytes`);

  const tanksCsv = await fetchUrl(base + octConfig.tanksGid);
  fs.writeFileSync('doc2_tanks_10.csv', tanksCsv, 'utf8');
  console.log(`Saved doc2_tanks_10.csv: ${tanksCsv.length} bytes`);

  const detailCsv = await fetchUrl(base + octConfig.detailGid);
  fs.writeFileSync('doc2_detail_10.csv', detailCsv, 'utf8');
  console.log(`Saved doc2_detail_10.csv: ${detailCsv.length} bytes`);

  console.log('October download complete!');
}

main().catch(console.error);
