const fs = require('fs');
const code = fs.readFileSync('src/App.js', 'utf8');

// Match tags across the whole file (handles multi-line tags)
const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/gs;
const stack = [];
let match;

function lineOf(index) {
  return code.slice(0, index).split('\n').length;
}

while ((match = tagRegex.exec(code)) !== null) {
  const isClosing = match[0][1] === '/';
  const isSelfClosing = match[2] === '/';
  const tagName = match[1];
  if (isSelfClosing) continue;
  if (isClosing) {
    if (stack.length === 0 || stack[stack.length-1].tag !== tagName) {
      console.log(`Mismatch: found </${tagName}> at line ${lineOf(match.index)} but stack top is`, stack[stack.length-1]);
      console.log('Stack depth:', stack.length);
      console.log('Last 10 on stack:', stack.slice(-10));
      process.exit();
    }
    stack.pop();
  } else {
    stack.push({tag: tagName, line: lineOf(match.index)});
  }
}
console.log('Final stack size:', stack.length);
if (stack.length > 0) {
  console.log('Unclosed tags (up to 15):', stack.slice(-15));
}
