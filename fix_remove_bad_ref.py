path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'window._sgHandleScan=handleScan;startCameraScan();'
new1 = 'startCameraScan();'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Bad ref removed')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
