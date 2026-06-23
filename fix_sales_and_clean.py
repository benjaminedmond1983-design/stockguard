path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Remove debug alert from handleRecScan
old1 = 'function handleRecScan(raw){alert("handleRecScan called: "+raw);const code=raw.trim();'
new1 = 'function handleRecScan(raw){const code=raw.trim();'
if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Debug alert removed')
else:
    r.append('✗ Alert not matched')

# Fix Sales scanner - same getElementById approach as Receiving
old2 = 'window._sgCaptureScan=async()=>{if(!video||!video.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(video,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(video);if(codes.length>0){window._sgStopCamera();handleScan(codes[0].rawValue);}else{setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}}else{const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);window._sgStopCamera();handleScan(result.getText());}}'

new2 = 'window._sgCaptureScan=async()=>{const vid=document.getElementById("sg-camera-feed");if(!vid||!vid.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();handleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}catch(e){setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Sales capture fixed')
else:
    r.append('✗ Sales not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
