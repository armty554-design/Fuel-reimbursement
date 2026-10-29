const fs = require('fs');

function inspectTable(htmlFile) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  // find table rows
  const trMatches = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
  console.log(htmlFile, 'Total <tr>:', trMatches ? trMatches.length : 0);
  if (trMatches) {
    trMatches.slice(0, 30).forEach((tr, i) => {
      // strip tags but keep td separated
      const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
      if (cells.some(c => c.length > 0)) {
        console.log(`Row ${i}:`, JSON.stringify(cells.slice(0, 25)));
      }
    });
  }
}

inspectTable('doc2.html');
