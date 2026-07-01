const fs = require('fs');
const code = fs.readFileSync('src/App.js', 'utf8');
const lines = code.split('\n');

// crude but useful: count opening vs closing tags per common tag name
const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
const stack = [];
let lineNum = 1;
let charIdx = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let match;
  tagRegex.lastIndex = 0;
  while ((match = tagRegex.exec(line)) !== null) {
    const isClosing = match[0][1] === '/';
    const isSelfClosing = match[2] === '/';
    const tagName = match[1];
    if (isSelfClosing) continue;
    if (isClosing) {
      if (stack.length === 0 || stack[stack.length-1].tag !== tagName) {
        console.log(`Mismatch at line ${i+1}: found </${tagName}> but stack top is`, stack[stack.length-1]);
        console.log('Stack depth:', stack.length);
        process.exit();
      }
      stack.pop();
    } else {
      stack.push({tag: tagName, line: i+1});
    }
  }
}
console.log('Final stack size:', stack.length);
if (stack.length > 0) {
  console.log('Unclosed tags (up to 10):', stack.slice(-10));
}
