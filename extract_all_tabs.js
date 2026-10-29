const fs = require('fs');

function extractAllTabsWithGids(htmlFile) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  console.log('=== TABS FOR ' + htmlFile + ' ===');
  
  // Look for occurrences of sheet tab definitions in JavaScript or HTML
  // In Google Sheets HTML publish/view, tab items often look like:
  // <li id="sheet-button-2142261398" class="...">...<a ...>TabName</a></li>
  // Or in JSON: [gid, "SheetName"] or {"sheetId": 2142261398, "title": "..."}
  
  const matches1 = [...content.matchAll(/sheet-button-([0-9]+)[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/g)];
  console.log('Found sheet-buttons:', matches1.length);
  matches1.forEach(m => console.log(`GID: ${m[1]} -> ${m[2].trim()}`));

  // Check JSON format
  const matches2 = [...content.matchAll(/"sheetId":\s*([0-9]+)[\s\S]*?"title":\s*"([^"]+)"/g)];
  console.log('Found sheetId/title:', matches2.length);
  matches2.forEach(m => console.log(`GID: ${m[1]} -> ${m[2]}`));

  // Check another JSON format: [id,0,"Name"] or similar
  const matches3 = [...content.matchAll(/\{\s*id:\s*([0-9]+),\s*name:\s*'([^']+)'/g)];
  console.log('Found id/name:', matches3.length);
  matches3.forEach(m => console.log(`GID: ${m[1]} -> ${m[2]}`));
}

extractAllTabsWithGids('doc1.html');
extractAllTabsWithGids('doc2.html');
