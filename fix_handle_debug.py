path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'function handleRecScan(raw){const code=raw.trim();setRecScanMode(false);setRecCameraActive(false);if(window._sgStopRecCamera)window._sgStopRecCamera();if(!code)return;'
new1 = 'function handleRecScan(raw){alert("handleRecScan called: "+raw);const code=raw.trim();setRecScanMode(false);setRecCameraActive(false);if(window._sgStopRecCamera)window._sgStopRecCamera();if(!code)return;'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Debug added to handleRecScan')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
