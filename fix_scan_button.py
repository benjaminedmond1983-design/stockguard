path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Fix Rec button - replace window._sgCaptureScanRec&&window._sgCaptureScanRec() with direct async call
old1 = '()=>window._sgCaptureScanRec&&window._sgCaptureScanRec()'
new1 = 'async()=>{if(!window._sgCaptureScanRec){setRecCameraError("Scanner not ready, try again.");return;}await window._sgCaptureScanRec();}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Rec button fixed')
else:
    r.append('✗ Rec button not matched')

# Fix Sales - add a tap button next to the camera feed
old2 = 'style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}>Point camera at barcode</div></div>)}{!cameraActive&&!'
new2 = 'style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}><button onClick={async()=>{if(window._sgCaptureScan)await window._sgCaptureScan();else setScanFeedback({ok:false,msg:"Scanner not ready."});}} style={{background:"#0D7E6E",border:"none",color:"#fff",padding:"10px 28px",borderRadius:20,fontSize:15,fontWeight:700,cursor:"pointer"}}>📷 Tap to scan</button></div></div>)}{!cameraActive&&!'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Sales tap button added')
else:
    r.append('✗ Sales button anchor not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
