path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'function handleRecScan(raw){alert("handleRecScan called: "+raw);const code=raw.trim();'
new1 = 'function handleRecScan(raw){const code=raw.trim();'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Alert removed')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
