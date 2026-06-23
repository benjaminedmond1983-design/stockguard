path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Replace the entire Sales tap button with one that has decode logic inline in JSX
old1 = '<button onClick={async()=>{const vid=document.getElementById("sg-camera-feed");if(!vid||!vid.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();if(window._sgHandleScan)window._sgHandleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}catch(e){setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}}} style={{background:"#0D7E6E",border:"none",color:"#fff",padding:"10px 28px",borderRadius:20,fontSize:15,fontWeight:700,cursor:"pointer"}}>📷 Tap to scan</button>'

new1 = '<button onClick={async()=>{const vid=document.getElementById("sg-camera-feed");if(!vid||!vid.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();handleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}catch(e){setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}}} style={{background:"#0D7E6E",border:"none",color:"#fff",padding:"10px 28px",borderRadius:20,fontSize:15,fontWeight:700,cursor:"pointer"}}>📷 Tap to scan</button>'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Sales button uses handleScan directly')
else:
    r.append('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
