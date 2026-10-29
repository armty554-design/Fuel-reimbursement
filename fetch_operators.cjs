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

(async () => {
  const url = 'https://docs.google.com/spreadsheets/d/1DDE_KjfxmuSY_AtLdEd__0ruvU9FbGJSVQxNQWaTmf8/export?format=csv&gid=0';
  console.log('Downloading tab ผู้ประกอบการ (gid=0)...');
  const data = await fetchUrl(url);
  fs.writeFileSync('tab_operators.csv', data, 'utf8');
  console.log('Saved tab_operators.csv, size:', data.length);
  const lines = data.split('\n');
  console.log('Total rows in ผู้ประกอบการ:', lines.length);
  lines.slice(0, 20).forEach((l, i) => console.log(`Row ${i}: ${l.slice(0, 160)}`));
})();
