const fs = require('fs');

const content = fs.readFileSync('doc2.html', 'utf8');
const regex = /\[\d+,\s*0,\s*\\\"([0-9]+)\\\",\s*\[\{\\\"1\\\":\s*\[\[0,\s*0,\s*\\\"([^\\\"]+)\\\"/g;
let match;
const tabs = [];
while ((match = regex.exec(content)) !== null) {
  tabs.push({ gid: match[1], name: match[2] });
}
console.log('Doc2 tabs count:', tabs.length);
console.log(tabs);
