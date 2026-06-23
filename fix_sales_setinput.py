path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();setScanMode(false);setCameraActive(false);setSku(codes[0].rawValue);return;}'
new1 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();setScanMode(false);setScanInput(codes[0].rawValue);setScanFeedback(null);return;}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Fixed')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
