const fs = require('fs');

const content = fs.readFileSync('doc1.html', 'utf8');
const lines = content.split('\n');

// Find all occurrences of sheet tabs
// In google spreadsheet HTML, there is usually a list of sheet definitions like:
// {"name": "...", "sheetId": ...} or similar in JSON data
console.log('Searching doc1.html for tab identifiers...');

// Find numbers matching sheet tabs
const captions = [
  "คำแนะนำ", "ผู้รับผิดชอบ", "10", "11", "12", "13", "14", "16", "18", "15",
  "17", "20", "30", "40", "50", "60", "70", "80", "90", "98", "รวม",
  "ชดเชย DIFF. + 10%", "ยอดส่ง 10", "เปรียบเทียบ", "2569-04"
];

for (const cap of captions) {
  let pos = 0;
  let matches = [];
  while ((pos = content.indexOf(cap, pos)) !== -1) {
    // get surrounding 100 chars before and after
    const snippet = content.slice(Math.max(0, pos - 150), pos + cap.length + 150);
    // look for digits in snippet that could be a gid
    const gids = snippet.match(/\b\d{1,12}\b/g) || [];
    matches.push({ pos, snippet, gids });
    pos += cap.length + 1;
    if (matches.length > 5) break;
  }
  console.log(`Caption "${cap}" found ${matches.length} times. Best snippet candidate:`);
  for (const m of matches) {
    if (!m.snippet.includes('docs-sheet-tab-caption')) {
      console.log('  Non-UI match:', m.snippet.replace(/\n/g, ' '));
    }
  }
}
