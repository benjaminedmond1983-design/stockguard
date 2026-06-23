path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Replace the entire startRecCameraScan with a ref-based version
old1 = 'async function startRecCameraScan(){setRecCameraError("");try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});setRecCameraActive(true);await new Promise(res=>setTimeout(res,300));const video=document.getElementById("sg-rec-camera-feed");if(!video){stream.getTracks().forEach(t=>t.stop());setRecCameraActive(false);return;}video.srcObject=stream;await video.play();window._sgStopRecCamera=()=>{stream.getTracks().forEach(t=>t.stop());setRecCameraActive(false);};window._sgCaptureScanRec=async()=>'

new1 = 'async function startRecCameraScan(){setRecCameraError("");try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});setRecCameraActive(true);await new Promise(res=>setTimeout(res,300));const video=document.getElementById("sg-rec-camera-feed");if(!video){stream.getTracks().forEach(t=>t.stop());setRecCameraActive(false);return;}video.srcObject=stream;await video.play();window._sgStopRecCamera=()=>{stream.getTracks().forEach(t=>t.stop());setRecCameraActive(false);};window._sgRecVideo=video;window._sgCaptureScanRec=async()=>'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Rec video ref added')
else:
    r.append('✗ Rec start not matched')

# Fix the Rec button to use _sgRecVideo directly
old2 = 'async()=>{if(!window._sgCaptureScanRec){setRecCameraError("Scanner not ready, try again.");return;}await window._sgCaptureScanRec();}'
new2 = 'async()=>{const vid=window._sgRecVideo;if(!vid||!vid.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(vid,0,0);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(codes[0].rawValue);return;}}const {BinaryBitmap,HybridBinarizer,HTMLCanvasElementLuminanceSource,MultiFormatReader}=window.ZXing||{};if(BinaryBitmap){const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(result.getText());}else{setRecCameraError("No barcode found. Tap again.");}}catch(e){setRecCameraError("No barcode found. Tap again. ("+e.name+")");}}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Rec button rewritten')
else:
    r.append('✗ Rec button not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
