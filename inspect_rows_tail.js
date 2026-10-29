const fs = require('fs');

function inspectRowsBeyond30(htmlFile) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const trMatches = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
  if (trMatches) {
    trMatches.slice(30).forEach((tr, i) => {
      const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
      if (cells.some(c => c.length > 0)) {
        console.log(`Row ${i + 30}:`, JSON.stringify(cells.filter(c => c.length > 0)));
      }
    });
  }
}

inspectRowsBeyond30('doc2.html');
