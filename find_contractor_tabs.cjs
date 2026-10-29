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
  const html = await fetchUrl('https://docs.google.com/spreadsheets/d/1DDE_KjfxmuSY_AtLdEd__0ruvU9FbGJSVQxNQWaTmf8/edit');
  fs.writeFileSync('doc_contractors.html', html, 'utf8');
  console.log('Saved doc_contractors.html, size:', html.length);

  // Search tabs
  const regex = /<div class="goog-inline-block docs-sheet-tab-caption">([^<]+)<\/div>/g;
  let match;
  const tabs = [];
  while ((match = regex.exec(html)) !== null) {
    tabs.push(match[1]);
  }
  console.log('Tabs found:', tabs);

  // Find GIDs for these tabs
  const gidRegex = /\[\d+,\s*0,\s*\\\"([0-9]+)\\\",\s*\[\{\\\"1\\\":\s*\[\[0,\s*0,\s*\\\"([^\\\"]+)\\\"/g;
  let gMatch;
  const tabGids = [];
  while ((gMatch = gidRegex.exec(html)) !== null) {
    tabGids.push({ gid: gMatch[1], name: gMatch[2] });
  }
  console.log('Tab GIDs:', tabGids);
})();
