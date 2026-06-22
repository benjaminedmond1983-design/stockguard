path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

old1 = 'window._sgCaptureScan=async()=>{if(!video||!video.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext("2d").drawImage(video,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(video);if(codes.length>0){window._sgStopCamera();handleScan(codes[0].rawValue);}else{setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}}else{const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);window._sgStopCamera();handleScan(result.getText());}}'

new1 = 'window._sgCaptureScan=async()=>{if(!video||!video.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});const tryDecode=async()=>{const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.drawImage(video,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(video);if(codes.length>0){window._sgStopCamera();handleScan(codes[0].rawValue);return true;}}ctx.filter="contrast(1.4) brightness(1.1)";ctx.drawImage(video,0,0);const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);window._sgStopCamera();handleScan(result.getText());return true;}catch(e){if(e.name==="NotAllowedError"){setScanFeedback({ok:false,msg:"Camera access denied."});setCameraActive(false);return true;}return false;}};const ok=await tryDecode();if(!ok){await new Promise(r=>setTimeout(r,120));const ok2=await tryDecode();if(!ok2){setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Sales capture fixed')
else:
    r.append('✗ Sales not matched')

old2 = 'window._sgCaptureScanRec=async()=>{if(!video||!video.videoWidth){setRecCameraError("Camera not ready yet.");return;}const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext("2d").drawImage(video,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(video);if(codes.length>0){window._sgStopRecCamera();handleRecScan(codes[0].rawValue);}else{setRecCameraError("No barcode found. Tap again.");}}else{const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);window._sgStopRecCamera();handleRecScan(result.getText());}}'

new2 = 'window._sgCaptureScanRec=async()=>{if(!video||!video.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");const tryDecode=async()=>{const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.drawImage(video,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(video);if(codes.length>0){window._sgStopRecCamera();handleRecScan(codes[0].rawValue);return true;}}ctx.filter="contrast(1.4) brightness(1.1)";ctx.drawImage(video,0,0);const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);window._sgStopRecCamera();handleRecScan(result.getText());return true;}catch(e){if(e.name==="NotAllowedError"){setRecCameraError("Camera access denied.");setRecCameraActive(false);return true;}return false;}};const ok=await tryDecode();if(!ok){await new Promise(r=>setTimeout(r,120));const ok2=await tryDecode();if(!ok2){setRecCameraError("No barcode found. Tap again.");}}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Rec capture fixed')
else:
    r.append('✗ Rec not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
