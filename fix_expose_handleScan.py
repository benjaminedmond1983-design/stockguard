path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Expose handleScan on window from the Go button onClick (it's in scope here)
old1 = 'onClick={e=>{const el=e.currentTarget.previousSibling;if(el.value.trim())handleScan(el.value);el.value="";}}}'
new1 = 'onClick={e=>{window._sgHandleScan=handleScan;const el=e.currentTarget.previousSibling;if(el.value.trim())handleScan(el.value);el.value="";}}}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ handleScan exposed on Go button')
else:
    r.append('✗ Go button not matched')

# Now fix the tap button to use window._sgHandleScan
old2 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();setScanMode(false);setScanInput(codes[0].rawValue);setScanFeedback(null);return;}'
new2 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();if(window._sgHandleScan){window._sgHandleScan(codes[0].rawValue);}else{setScanMode(false);setScanInput(codes[0].rawValue);}return;}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Tap button uses window._sgHandleScan')
else:
    r.append('✗ Tap button not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
