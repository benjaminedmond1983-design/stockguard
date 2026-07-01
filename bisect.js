const parser = require('@babel/parser');
const fs = require('fs');
const code = fs.readFileSync('src/App.js', 'utf8');
const lines = code.split('\n');

function tryParsePrefix(endLine) {
  // Close off any open braces naively isn't reliable, so just try raw prefix parse
  const prefix = lines.slice(0, endLine).join('\n');
  try {
    parser.parse(prefix, { sourceType: 'module', plugins: ['jsx'], allowReturnOutsideFunction: true, errorRecovery: false });
    return true;
  } catch (e) {
    return false;
  }
}

// Binary search between known-good (50) and known-bad (854)
let lo = 50, hi = 854;
while (hi - lo > 1) {
  const mid = Math.floor((lo + hi) / 2);
  if (tryParsePrefix(mid)) {
    lo = mid;
  } else {
    hi = mid;
  }
}
console.log('Parses OK up to line', lo, '->', lines[lo - 1]);
console.log('Breaks by line', hi, '->', lines[hi - 1]);
