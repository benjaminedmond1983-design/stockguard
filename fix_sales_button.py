path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}>Point camera at barcode</div>'
new1 = 'style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}><button onClick={async()=>{const vid=document.getElementById("sg-camera-feed");if(!vid||!vid.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();handleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}catch(e){setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}}} style={{background:"#0D7E6E",border:"none",color:"#fff",padding:"10px 28px",borderRadius:20,fontSize:15,fontWeight:700,cursor:"pointer"}}>📷 Tap to scan</button></div>'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Sales tap button added')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
