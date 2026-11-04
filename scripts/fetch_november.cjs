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

const novConfig = {
  key: '11',
  name: 'พฤศจิกายน 2569',
  compGid: '965952839',    // ค่าชดเชย 11
  diffGid: '822357899',    // เลขไมล์ Diff 11
  tanksGid: '1330045554',  // ยอดส่ง 11
  detailGid: '861334704'   // รายละเอียดชดเชยน้ำมัน พ.ย.
};

async function main() {
  const base = 'https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/export?format=csv&gid=';
  console.log(`Downloading November 2569 sheets...`);

  const compCsv = await fetchUrl(base + novConfig.compGid);
  fs.writeFileSync('doc2_comp_11.csv', compCsv, 'utf8');
  console.log(`Saved doc2_comp_11.csv: ${compCsv.length} bytes`);

  const diffCsv = await fetchUrl(base + novConfig.diffGid);
  fs.writeFileSync('doc2_diff_11.csv', diffCsv, 'utf8');
  console.log(`Saved doc2_diff_11.csv: ${diffCsv.length} bytes`);

  const tanksCsv = await fetchUrl(base + novConfig.tanksGid);
  fs.writeFileSync('doc2_tanks_11.csv', tanksCsv, 'utf8');
  console.log(`Saved doc2_tanks_11.csv: ${tanksCsv.length} bytes`);

  const detailCsv = await fetchUrl(base + novConfig.detailGid);
  fs.writeFileSync('doc2_detail_11.csv', detailCsv, 'utf8');
  console.log(`Saved doc2_detail_11.csv: ${detailCsv.length} bytes`);

  console.log('November download complete!');
}

main().catch(console.error);
