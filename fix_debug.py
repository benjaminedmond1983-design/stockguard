path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

old1 = 'window._sgCaptureScanRec=async()=>{if(!video||!video.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(video,0,0);try{'

new1 = 'window._sgCaptureScanRec=async()=>{if(!video||!video.videoWidth){setRecCameraError("Camera not ready yet. w="+video.videoWidth);return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(video,0,0);const hasBC="BarcodeDetector" in window;setRecCameraError("Trying... BC="+hasBC+" size="+canvas.width+"x"+canvas.height);try{'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Debug added')
else:
    r.append('✗ Not matched')

# Also make ZXing catch show the actual error
old2 = 'catch(e){setRecCameraError(e.name==="NotAllowedError"?"Camera access denied.":"Camera not available. Type SKU below.");setRecCameraActive(false);}'
new2 = 'catch(e){setRecCameraError("ERR: "+e.name+": "+e.message);setRecCameraActive(false);}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Error detail added')
else:
    r.append('✗ Error catch not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
