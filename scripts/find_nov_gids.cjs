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
  const html = await fetchHtml('https://docs.google.com/spreadsheets/d/1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8/edit?gid=29931557');
  console.log('HTML length:', html.length);
  fs.writeFileSync('doc2_fresh.html', html, 'utf8');

  // Search for the 4 names
  const targets = [
    'รายละเอียดชดเชยน้ำมัน พ.ย.',
    'ยอดส่ง 11',
    'เลขไมล์ Diff 11',
    'ค่าชดเชย 11'
  ];

  targets.forEach(t => {
    let pos = 0;
    let count = 0;
    while ((pos = html.indexOf(t, pos)) !== -1 && count < 5) {
      console.log(`\n=== Found "${t}" at pos ${pos} ===`);
      const start = Math.max(0, pos - 150);
      const end = Math.min(html.length, pos + 150);
      console.log(html.substring(start, end));
      pos += t.length;
      count++;
    }
    if (count === 0) {
      console.log(`\n=== Not found directly: "${t}" ===`);
    }
  });

  // Let's also look for all sheet names in bootstrap data
  // Google Sheets usually has bootstrap data in var bootstrapData or similar
  const sheetMatches = [];
  const regex = /\[(\d{5,12}),\s*null,\s*"([^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    sheetMatches.push({ gid: m[1], name: m[2] });
  }
  if (sheetMatches.length > 0) {
    console.log('\nFound sheets via regex [gid, null, "name"]:', sheetMatches);
  } else {
    // Try another regex
    const regex2 = /"([^"]+)",(?:null|\d+),(?:null|\d+),(\d{6,12})/g;
    while ((m = regex2.exec(html)) !== null) {
      sheetMatches.push({ name: m[1], gid: m[2] });
    }
    console.log('\nFound sheets via regex2:', sheetMatches.slice(0, 30));
  }
}

main().catch(console.error);
