const fs = require('fs');

const lines = fs.readFileSync('contractors.csv', 'utf8').split('\n');
console.log('Total rows:', lines.length);
lines.slice(0, 10).forEach((l, i) => {
  console.log(`Row ${i}: ${l}`);
});
