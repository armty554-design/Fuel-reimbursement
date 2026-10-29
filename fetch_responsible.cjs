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

(async () => {
  const url = 'https://docs.google.com/spreadsheets/d/19Mf5jnes2u5Z3IXz0vZyq1teHnmw0kHFzzDICHGP02k/export?format=csv&gid=256833113';
  const data = await fetchCsv(url);
  fs.writeFileSync('doc1_tab_responsible.csv', data, 'utf8');
  console.log('Saved doc1_tab_responsible.csv size:', data.length);
  console.log(data);
})();
