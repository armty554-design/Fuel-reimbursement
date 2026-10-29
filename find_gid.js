const fs = require('fs');

function findTabs(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  console.log('=== ' + filename + ' ===');
  // Search for the gid from the URL
  // gid=1657763973 or gid=2142261398
  const idx = content.indexOf('2142261398');
  if (idx !== -1) {
    console.log('Found 2142261398 around:', content.slice(Math.max(0, idx - 200), idx + 200));
  } else {
    console.log('2142261398 not found in raw, searching for other gids');
  }

  const idx1 = content.indexOf('1657763973');
  if (idx1 !== -1) {
    console.log('Found 1657763973 around:', content.slice(Math.max(0, idx1 - 200), idx1 + 200));
  }
}

findTabs('doc1.html');
findTabs('doc2.html');
