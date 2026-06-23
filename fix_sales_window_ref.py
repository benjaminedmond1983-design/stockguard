path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Find the sales camera section and set window._sgHandleScan in the JSX render
# We'll add it to the video element's onCanPlay or just set it inline in the button area
old1 = 'style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}><button onClick={async()=>{const vid=document.getElementById("sg-camera-feed")'
new1 = 'style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}><button onClick={async()=>{window._sgHandleScan=handleScan;const vid=document.getElementById("sg-camera-feed")'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ handleScan set on click')
else:
    r.append('✗ Not matched')

# Fix the capture to use window._sgHandleScan
old2 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();handleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'
new2 = 'if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();if(window._sgHandleScan)window._sgHandleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ capture uses window._sgHandleScan')
else:
    r.append('✗ capture not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
