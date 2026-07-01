const parser = require('@babel/parser');
const fs = require('fs');
const code = fs.readFileSync('src/App.js', 'utf8');

const result = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx'],
  errorRecovery: true
});

console.log('Total errors:', result.errors.length);
result.errors.slice(0, 10).forEach((e, i) => {
  console.log(`\n--- Error ${i+1} ---`);
  console.log('Message:', e.reasonCode || e.message);
  console.log('Line:', e.loc ? e.loc.line : 'unknown');
});
