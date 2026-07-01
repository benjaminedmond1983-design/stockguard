const fs = require('fs');
const code = fs.readFileSync('src/App.js', 'utf8');
const len = code.length;
let i = 0, line = 1;
const stack = [];

function adv(n = 1) {
  for (let k = 0; k < n; k++) {
    if (code[i] === '\n') line++;
    i++;
  }
}

function isIdentChar(c) {
  return c && /[A-Za-z0-9_$]/.test(c);
}

while (i < len) {
  const ch = code[i];
  if (ch === '<') {
    const prev = code[i - 1];
    const next = code[i + 1];
    const looksLikeTag = (next === '/' || /[A-Za-z>]/.test(next));
    const prevOk = (prev === undefined || !isIdentChar(prev) && prev !== '.');
    if (looksLikeTag && prevOk) {
      const startLine = line;
      adv(1);
      let closing = false;
      if (code[i] === '/') { closing = true; adv(1); }
      let name = '';
      while (i < len && /[A-Za-z0-9]/.test(code[i])) { name += code[i]; adv(1); }
      if (name === '') name = 'Fragment';
      let braceDepth = 0, inString = null, selfClosing = false;
      while (i < len) {
        const c = code[i];
        if (inString) {
          if (c === '\\') { adv(2); continue; }
          if (c === inString) inString = null;
          adv(1); continue;
        }
        if (c === '"' || c === "'" || c === '`') { inString = c; adv(1); continue; }
        if (c === '{') { braceDepth++; adv(1); continue; }
        if (c === '}') { braceDepth--; adv(1); continue; }
        if (braceDepth === 0 && c === '/' && code[i + 1] === '>') { selfClosing = true; adv(2); break; }
        if (braceDepth === 0 && c === '>') { adv(1); break; }
        adv(1);
      }
      if (closing) {
        if (stack.length === 0) {
          console.log(`Extra closing </${name}> at line ${startLine}, stack empty`);
          process.exit();
        }
        const top = stack[stack.length - 1];
        if (top.name !== name) {
          console.log(`MISMATCH at line ${startLine}: found </${name}> but top of stack is <${top.name}> opened at line ${top.line}`);
          console.log('Last 15 on stack:', stack.slice(-15).map(s => `${s.name}@${s.line}`).join(', '));
          process.exit();
        }
        stack.pop();
      } else if (!selfClosing) {
        stack.push({ name, line: startLine });
      }
      continue;
    }
  }
  adv(1);
}
console.log('Reached end of file. Stack length:', stack.length);
if (stack.length) console.log('Unclosed (last 20):', stack.slice(-20).map(s => `${s.name}@${s.line}`).join(', '));
