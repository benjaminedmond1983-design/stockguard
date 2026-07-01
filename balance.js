const fs = require('fs');
const code = fs.readFileSync('src/App.js', 'utf8');
const len = code.length;
let i = 0, line = 1;
const stack = [];
const pairs = { '(': ')', '[': ']', '{': '}' };
const closers = { ')': '(', ']': '[', '}': '{' };

while (i < len) {
  const c = code[i];
  if (c === '\n') { line++; i++; continue; }
  if (c === '"' || c === "'" || c === '`') {
    const quote = c;
    i++;
    while (i < len && code[i] !== quote) {
      if (code[i] === '\\') { i += 2; continue; }
      if (code[i] === '\n') line++;
      i++;
    }
    i++; // skip closing quote
    continue;
  }
  if (c === '/' && code[i+1] === '/') {
    while (i < len && code[i] !== '\n') i++;
    continue;
  }
  if (c === '/' && code[i+1] === '*') {
    i += 2;
    while (i < len && !(code[i] === '*' && code[i+1] === '/')) { if (code[i]==='\n') line++; i++; }
    i += 2;
    continue;
  }
  if (pairs[c]) {
    stack.push({ char: c, line });
  } else if (closers[c]) {
    if (stack.length === 0) {
      console.log(`Extra closing '${c}' at line ${line}, stack empty`);
      process.exit();
    }
    const top = stack[stack.length - 1];
    if (pairs[top.char] !== c) {
      console.log(`MISMATCH at line ${line}: found '${c}' but top of stack is '${top.char}' opened at line ${top.line}`);
      console.log('Last 10 on stack:', stack.slice(-10).map(s => `${s.char}@${s.line}`).join(', '));
      process.exit();
    }
    stack.pop();
  }
  i++;
}
console.log('Reached end. Stack length:', stack.length);
if (stack.length) console.log('Unclosed (last 15):', stack.slice(-15).map(s => `${s.char}@${s.line}`).join(', '));
