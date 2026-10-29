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
  const csvUrl = 'https://docs.google.com/spreadsheets/d/1DDE_KjfxmuSY_AtLdEd__0ruvU9FbGJSVQxNQWaTmf8/export?format=csv&gid=2107217482';
  console.log('Fetching contractor sheet CSV...');
  try {
    const data = await fetchUrl(csvUrl);
    fs.writeFileSync('contractors.csv', data, 'utf8');
    console.log('Saved contractors.csv size:', data.length);
    const lines = data.split('\n');
    console.log('Total lines:', lines.length);
    lines.slice(0, 15).forEach((l, i) => console.log(`L${i+1}:`, l.slice(0, 150)));
  } catch (e) {
    console.error('Error fetching CSV:', e.message);
  }
})();
