path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

# Find handleScan and expose it on window
old1 = 'function handleScan('
# Find where handleScan is defined and add window ref after startCameraScan sets up
# Instead, expose handleScan on window near where _sgStopCamera is set
old2 = 'window._sgStopCamera=()=>{stream.getTracks().forEach(t=>t.stop());setCameraActive(false);};'
new2 = 'window._sgStopCamera=()=>{stream.getTracks().forEach(t=>t.stop());setCameraActive(false);};window._sgHandleScan=handleScan;'

if old2 in c:
    c = c.replace(old2, new2, 1)
    print('✓ handleScan exposed on window')
else:
    print('✗ Not matched')

# Fix the button to use window._sgHandleScan
old3 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();handleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'
new3 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();if(window._sgHandleScan)window._sgHandleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'

if old3 in c:
    c = c.replace(old3, new3, 1)
    print('✓ Button uses window._sgHandleScan')
else:
    print('✗ Button not matched')

with open(path, 'w') as f:
    f.write(c)
