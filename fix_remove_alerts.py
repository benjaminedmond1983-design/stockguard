path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'async()=>{const vid=window._sgRecVideo;alert("vid="+!!vid+" w="+( vid&&vid.videoWidth)+" BC="+("BarcodeDetector" in window));if(!vid||!vid.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(vid,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);alert("codes="+codes.length+(codes.length>0?" val="+codes[0].rawValue:""));if(codes.length>0){if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(codes[0].rawValue);return;}}alert("no BC or 0 codes, trying ZXing");const {BinaryBitmap,HybridBinarizer,HTMLCanvasElementLuminanceSource,MultiFormatReader}=window.ZXing||{};if(BinaryBitmap){const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(result.getText());}else{alert("ZXing not loaded");setRecCameraError("No barcode found. Tap again.");}}catch(e){alert("ERR: "+e.name+": "+e.message);setRecCameraError("ERR: "+e.name);}}'

new1 = 'async()=>{const vid=window._sgRecVideo;if(!vid||!vid.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(vid,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(codes[0].rawValue);return;}}}catch(e){}setRecCameraError("No barcode found. Tap again.");}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Alerts removed, clean decode')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
