const parser = require('@babel/parser');
const fs = require('fs');
const code = fs.readFileSync('src/App.js', 'utf8');
const lines = code.split('\n');

const boundaries = [];
lines.forEach((line, i) => {
  if (/^function\s+\w+/.test(line) || /^const\s+\w+\s*=\s*\(.*\)\s*=>/.test(line)) {
    boundaries.push(i);
  }
});

function tryParsePrefix(endLine) {
  const prefix = lines.slice(0, endLine).join('\n');
  try {
    parser.parse(prefix, { sourceType: 'module', plugins: ['jsx'] });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('Found', boundaries.length, 'component boundaries');
let lastGood = -1, firstBad = -1;
for (const b of boundaries) {
  const ok = tryParsePrefix(b);
  if (!ok && firstBad === -1) { firstBad = b; break; }
  if (ok) lastGood = b;
}
console.log('Last known-good boundary: line', lastGood + 1, '->', lines[lastGood]);
console.log('First broken boundary: line', firstBad + 1, '->', lines[firstBad]);
