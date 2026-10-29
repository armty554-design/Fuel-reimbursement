const fs = require('fs');

function inspectDoc(filename) {
  console.log('=== INSPECTING ' + filename + ' ===');
  const content = fs.readFileSync(filename, 'utf8');
  
  // Find bootstrap data or sheet definitions
  // Google sheets often has `bootstrapData` or `wdr_`
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) console.log('Doc Title:', titleMatch[1]);

  // Find sheet tab names in doc
  // Patterns like [id, "Sheet Name", ...]
  const regex = /\[(\d{1,12}),"([^"]+)",\d+,\d+,/g;
  let match;
  let found = 0;
  while ((match = regex.exec(content)) !== null) {
    console.log(`Sheet ID: ${match[1]} -> Name: ${match[2]}`);
    found++;
  }

  // Also check another format: [null,null,"SheetName",null,id] or similar
  const regex2 = /"([a-zA-Z0-9ก-๙\s_\-\.]+)",null,null,null,null,null,null,null,null,(\d{1,12})/g;
  while ((match = regex2.exec(content)) !== null) {
    console.log(`Format 2: ${match[1]} -> ${match[2]}`);
    found++;
  }
}

inspectDoc('doc1.html');
inspectDoc('doc2.html');
