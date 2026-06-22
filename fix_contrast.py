path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Sales scanner - add contrast boost after drawImage, and add "Scanning..." feedback
old1 = 'window._sgCaptureScan=async()=>{if(!video||!video.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext("2d").drawImage(video,0,0);try{'
new1 = 'window._sgCaptureScan=async()=>{if(!video||!video.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(video,0,0);try{'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Sales contrast fixed')
else:
    r.append('✗ Sales not matched')

# Rec scanner - same
old2 = 'window._sgCaptureScanRec=async()=>{if(!video||!video.videoWidth){setRecCameraError("Camera not ready yet.");return;}const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext("2d").drawImage(video,0,0);try{'
new2 = 'window._sgCaptureScanRec=async()=>{if(!video||!video.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(video,0,0);try{'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Rec contrast fixed')
else:
    r.append('✗ Rec not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
