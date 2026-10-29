const fs = require('fs');

const tabResp = fs.readFileSync('sheet1.csv', 'utf8'); // Wait, earlier we found gid=256833113 => ผู้รับผิดชอบ
console.log('GID for ผู้รับผิดชอบ is 256833113');
