const https = require('https');
const fs = require('fs');

function getHtml(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return getHtml(res.headers.location).then(resolve);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
  });
}

(async () => {
  const html = await getHtml('https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/edit');
  fs.writeFileSync('doc2.html', html, 'utf8');
  console.log('Saved doc2.html, size:', html.length);

  const html1 = await getHtml('https://docs.google.com/spreadsheets/d/19Mf5jnes2u5Z3IXz0vZyq1teHnmw0kHFzzDICHGP02k/edit');
  fs.writeFileSync('doc1.html', html1, 'utf8');
  console.log('Saved doc1.html, size:', html1.length);
})();
