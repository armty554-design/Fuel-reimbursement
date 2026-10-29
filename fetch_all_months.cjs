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

const monthsToFetch = [
  { key: '03', name: 'มีนาคม 2569', compGid: '1372603448', diffGid: '1766239945' },
  { key: '04', name: 'เมษายน 2569', compGid: '148629339', diffGid: '2074752255' },
  { key: '05', name: 'พฤษภาคม 2569', compGid: '448001912', diffGid: '1427241011' },
  { key: '06', name: 'มิถุนายน 2569', compGid: '403366828', diffGid: '1862188402' },
  { key: '07', name: 'กรกฎาคม 2569', compGid: '845798235', diffGid: '445467613' },
  { key: '08', name: 'สิงหาคม 2569', compGid: '1565238636', diffGid: '1456535403' },
  { key: '09', name: 'กันยายน 2569', compGid: '771609346', diffGid: '582576194' },
  { key: '10', name: 'ตุลาคม 2569', compGid: '1923881986', diffGid: '1173352041' }
];

async function main() {
  const base = 'https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/export?format=csv&gid=';
  for (const m of monthsToFetch) {
    console.log(`Fetching month ${m.name} (${m.key})...`);
    try {
      const compCsv = await fetchUrl(base + m.compGid);
      fs.writeFileSync(`doc2_comp_${m.key}.csv`, compCsv, 'utf8');
      console.log(`  Saved doc2_comp_${m.key}.csv (${compCsv.length} bytes)`);

      const diffCsv = await fetchUrl(base + m.diffGid);
      fs.writeFileSync(`doc2_diff_${m.key}.csv`, diffCsv, 'utf8');
      console.log(`  Saved doc2_diff_${m.key}.csv (${diffCsv.length} bytes)`);
    } catch (e) {
      console.error(`Error month ${m.key}:`, e.message);
    }
  }
}

main();
