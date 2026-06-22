path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

old1 = 'if(!ok2){setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}}catch(e){setScanFeedback({ok:false,msg:"No barcode found. Tap again."'
new1 = 'if(!ok2){setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}}}catch(e){setScanFeedback({ok:false,msg:"No barcode found. Tap again."'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Sales brace fixed')
else:
    r.append('✗ Sales not matched')

old2 = 'if(!ok2){setRecCameraError("No barcode found. Tap again.");}}catch(e){setRecCameraError("No barcode found. Tap again."'
new2 = 'if(!ok2){setRecCameraError("No barcode found. Tap again.");}}}catch(e){setRecCameraError("No barcode found. Tap again."'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Rec brace fixed')
else:
    r.append('✗ Rec not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
