path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}}catch(e){setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}};}catch(e){'
new1 = 'setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}};}catch(e){'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Stray catch removed')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
