const fs = require('fs');

function findTabGids(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== GIDs IN ' + filename + ' ===');
  // Match the tab element structure:
  // e.g. <div id="sheet-button-xxxx" class="...">...<div class="...docs-sheet-tab-caption">Name</div>
  // Or docs-sheet-tab with id or attribute
  const regex = /id="sheet-button-([0-9]+)"[^>]*>[\s\S]*?<div class="goog-inline-block docs-sheet-tab-caption">([^<]+)<\/div>/g;
  let match;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    console.log(`${match[2].trim()} => gid=${match[1]}`);
    count++;
  }
  if (count === 0) {
    // try another pattern
    const regex2 = /docs-sheet-tab[^>]*id="[^"]*([0-9]{5,})"[^>]*>[\s\S]*?<div class="goog-inline-block docs-sheet-tab-caption">([^<]+)<\/div>/g;
    while ((match = regex2.exec(content)) !== null) {
      console.log(`P2: ${match[2].trim()} => gid=${match[1]}`);
      count++;
    }
  }
  if (count === 0) {
    // print snippet around docs-sheet-tab
    const idx = content.indexOf('docs-sheet-tab');
    console.log('Snippet around docs-sheet-tab:', content.slice(idx, idx + 400));
  }
}

findTabGids('doc1.html');
findTabGids('doc2.html');
