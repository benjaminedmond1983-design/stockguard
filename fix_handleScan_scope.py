path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Remove the broken window._sgHandleScan=handleScan from startCameraScan
old1 = 'window._sgStopCamera=()=>{stream.getTracks().forEach(t=>t.stop());setCameraActive(false);};window._sgHandleScan=handleScan;window._sgCaptureScan'
new1 = 'window._sgStopCamera=()=>{stream.getTracks().forEach(t=>t.stop());setCameraActive(false);};window._sgCaptureScan'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Removed broken handleScan ref')
else:
    r.append('✗ Not matched')

# Fix button to call handleScan directly (it IS in scope in JSX)
old2 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();if(window._sgHandleScan)window._sgHandleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'
new2 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();handleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Button calls handleScan directly')
else:
    r.append('✗ Button not matched')

# Remove debug alert
old3 = 'catch(e){alert("Sales cam ERR: "+e.name+": "+e.message);setCameraError('
new3 = 'catch(e){setCameraError('

if old3 in c:
    c = c.replace(old3, new3, 1)
    r.append('✓ Debug alert removed')
else:
    r.append('✗ Alert not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
