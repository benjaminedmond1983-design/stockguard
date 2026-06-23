path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'onClick={async()=>{window._sgHandleScan=handleScan;const vid=document.getElementById("sg-camera-feed");if(!vid||!vid.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();if(window._sgHandleScan)window._sgHandleScan(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}catch(e){setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}}}'

new1 = 'onClick={async()=>{const vid=document.getElementById("sg-camera-feed");if(!vid||!vid.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopCamera)window._sgStopCamera();setScanMode(false);setCameraActive(false);setSku(codes[0].rawValue);return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}catch(e){setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}}}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Sales button inlined')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
