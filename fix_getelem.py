path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'async()=>{const vid=window._sgRecVideo;if(!vid||!vid.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(vid,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(codes[0].rawValue);return;}}}catch(e){}setRecCameraError("No barcode found. Tap again.");}'

new1 = 'async()=>{const vid=document.getElementById("sg-rec-camera-feed");if(!vid||!vid.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(codes[0].rawValue);return;}}setRecCameraError("No barcode found. Tap again.");}catch(e){setRecCameraError("No barcode found. ("+e.name+")");}}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Fixed')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
