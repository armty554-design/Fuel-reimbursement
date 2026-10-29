const fs = require('fs');

function checkDocHTML(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  // find all <ul or tabs
  const tabs = content.match(/<li[^>]*id="sheet-button[^"]*"[^>]*>[\s\S]*?<\/li>/g);
  console.log(filename, 'tabs found:', tabs ? tabs.length : 0);
  if (tabs) {
    tabs.forEach(t => console.log(t.replace(/<[^>]+>/g, ' ').trim()));
  }
  
  // also look for text like 'ชีต' or sheet names
  const items = content.match(/<span class="name">([^<]+)<\/span>/g);
  if (items) {
    console.log('Spans:', items);
  }
}

checkDocHTML('doc1.html');
checkDocHTML('doc2.html');
