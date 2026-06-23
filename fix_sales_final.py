path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Fix the capture function to use window._sgHandleScan instead of handleScan
old1 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();handleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'
new1 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();if(window._sgHandleScan)window._sgHandleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Capture uses window._sgHandleScan')
else:
    r.append('✗ Capture not matched')

# Set window._sgHandleScan right before startCameraScan is called in JSX
old2 = '){if(recScanMode){setRecScanMode(false);setRecCameraActive(false);setRecCameraError("");if(window._sgStopRecCamera)window._sgStopRecCamera();}else{setRecScanMode(true);startRecCameraScan();}}'
new2 = '){if(recScanMode){setRecScanMode(false);setRecCameraActive(false);setRecCameraError("");if(window._sgStopRecCamera)window._sgStopRecCamera();}else{setRecScanMode(true);startRecCameraScan();}}'

# Instead find the Sales scan button trigger and inject window._sgHandleScan=handleScan there
old3 = 'startCameraScan();}'
new3 = 'window._sgHandleScan=handleScan;startCameraScan();}'

if old3 in c:
    count = c.count(old3)
    c = c.replace(old3, new3, 1)
    r.append('✓ handleScan exposed before startCameraScan ('+str(count)+' found)')
else:
    r.append('✗ startCameraScan call not matched')

# Remove debug alert if still present
old4 = 'catch(e){alert("Sales cam ERR: "+e.name+": "+e.message);setCameraError('
new4 = 'catch(e){setCameraError('
if old4 in c:
    c = c.replace(old4, new4, 1)
    r.append('✓ Debug alert removed')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
