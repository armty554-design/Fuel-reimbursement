const fs = require('fs');

function findGridContainers(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== Containers in ' + filename + ' ===');
  const regex = /id="(\d+)-grid-container"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log('Grid container GID:', match[1]);
  }

  // Also search for sheet-tab or sheet-button
  const tabRegex = /id="sheet-button-([0-9]+)"[^>]*>([^<]+)</g;
  let tabMatch;
  while ((tabMatch = tabRegex.exec(content)) !== null) {
    console.log('Tab button:', tabMatch[1], tabMatch[2]);
  }

  // search for waffle-tabs
  const waffleTabs = content.match(/<ul id="sheet-menu"[\s\S]*?<\/ul>/);
  if (waffleTabs) {
    console.log('Sheet menu HTML:', waffleTabs[0]);
  }
}

findGridContainers('doc1.html');
findGridContainers('doc2.html');
