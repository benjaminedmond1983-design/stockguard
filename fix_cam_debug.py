path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'catch(e){setCameraError(e.name==="NotAllowedError"?"Camera access denied. Please allow camera access.":"Camera not available. Use the text input below.");setCameraActive(false);}'
new1 = 'catch(e){alert("CAM ERR: "+e.name+": "+e.message);setCameraError(e.name==="NotAllowedError"?"Camera access denied. Please allow camera access.":"Camera not available. Use the text input below.");setCameraActive(false);}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Debug added')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
