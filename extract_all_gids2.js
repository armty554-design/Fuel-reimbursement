const fs = require('fs');

const content = fs.readFileSync('doc1.html', 'utf8');
const regex = /\[\d+,\s*0,\s*\\\"([0-9]+)\\\",\s*\[\{\\\"1\\\":\s*\[\[0,\s*0,\s*\\\"([^\\\"]+)\\\"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`${match[1]} => ${match[2]}`);
}

// And also search for doc2
const content2 = fs.readFileSync('doc2.html', 'utf8');
console.log('--- doc2 ---');
while ((match = regex.exec(content2)) !== null) {
  console.log(`${match[1]} => ${match[2]}`);
}
