const fs = require('fs');

function inspectTabs(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== ' + filename + ' ===');
  const regex = /<div class="goog-inline-block docs-sheet-tab-caption">([^<]+)<\/div>/g;
  let match;
  const tabs = [];
  while ((match = regex.exec(content)) !== null) {
    tabs.push(match[1]);
  }
  console.log('Found ' + tabs.length + ' tabs:');
  tabs.forEach((t, i) => console.log(`${i+1}. ${t}`));
}

inspectTabs('doc1.html');
inspectTabs('doc2.html');
