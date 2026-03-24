const fs = require('fs');
const content = fs.readFileSync('SearchResults.jsx', 'utf8');
const lines = content.split('\\n');

let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (searchParams.from) params.from = searchParams.from;') && lines[i-1].includes('};') && lines[i+1].includes('if (searchParams.to) params.to = searchParams.to;')) {
    start = i;
  }
}

if (start !== -1) {
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('};') && lines[i-1].includes('setLoading(false);')) {
      end = i;
      break;
    }
  }
}

if (start !== -1 && end !== -1) {
  lines.splice(start, end - start + 1);
  fs.writeFileSync('SearchResults.jsx', lines.join('\\n'));
  console.log('Successfully cleaned up SearchResults.jsx');
} else {
  console.error('Failed to find start or end', {start, end});
}
