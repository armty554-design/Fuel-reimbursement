const fs = require('fs');

function extractGidMap(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== EXTRACTING GIDS: ' + filename + ' ===');
  // Match [index, 0, "gid", [{"1": [[0,0,"Sheet Name"]
  const regex = /\[\d+,\s*0,\s*\"([0-9]+)\",\s*\[\{\"1\":\s*\[\[0,\s*0,\s*\"([^\"]+)\"/g;
  let match;
  const list = [];
  while ((match = regex.exec(content)) !== null) {
    list.push({ gid: match[1], name: match[2] });
    console.log(`${match[1]} => ${match[2]}`);
  }
  return list;
}

const list1 = extractGidMap('doc1.html');
const list2 = extractGidMap('doc2.html');

fs.writeFileSync('gids_doc1.json', JSON.stringify(list1, null, 2));
fs.writeFileSync('gids_doc2.json', JSON.stringify(list2, null, 2));
