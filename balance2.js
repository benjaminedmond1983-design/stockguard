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
    const startI = i;
    i++;
    while (i < len && code[i] !== quote) {
      if (code[i] === '\\') { i += 2; continue; }
      if (code[i] === '\n') line++;
      i++;
    }
    i++;
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
    stack.push({ char: c, line, pos: i });
  } else if (closers[c]) {
    if (stack.length === 0) {
      console.log(`Extra closing '${c}' at line ${line}, stack empty`);
      process.exit();
    }
    const top = stack[stack.length - 1];
    if (pairs[top.char] !== c) {
      console.log(`MISMATCH at line ${line}: found '${c}' but top of stack is '${top.char}' opened at line ${top.line}`);
      console.log('CONTEXT around mismatch point (char', i, '):');
      console.log(code.slice(Math.max(0,i-60), i+20));
      console.log(' '.repeat(Math.min(60,i)) + '^-- mismatch here');
      console.log('\nCONTEXT around where the open bracket was (char', top.pos, '):');
      console.log(code.slice(Math.max(0,top.pos-60), top.pos+20));
      console.log(' '.repeat(Math.min(60,top.pos)) + '^-- opened here');
      process.exit();
    }
    stack.pop();
  }
  i++;
}
console.log('Reached end. Stack length:', stack.length);
