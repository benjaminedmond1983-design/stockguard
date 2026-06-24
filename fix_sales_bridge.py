path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Add a hidden input bridge near the saleForm state declaration
old1 = 'const [saleForm,setSaleForm]=useState(emptySale);'
new1 = 'const [saleForm,setSaleForm]=useState(emptySale);React.useEffect(()=>{const id=setInterval(()=>{const el=document.getElementById("_sg_sale_sku_bridge");if(el&&el.value){setSaleForm(f=>({...f,sku:el.value}));el.value="";}},300);return()=>clearInterval(id);},[]);'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ Bridge effect added')
else:
    r.append('✗ saleForm state not matched')

# Change tap button to write to hidden input instead of setSaleForm
old2 = 'if(codes.length>0){const scanned=codes[0].rawValue;if(window._sgStopCamera)window._sgStopCamera();setScanMode(false);setSaleForm(f=>({...f,sku:scanned}));setScanFeedback(null);return;}'
new2 = 'if(codes.length>0){const scanned=codes[0].rawValue;if(window._sgStopCamera)window._sgStopCamera();const bridge=document.getElementById("_sg_sale_sku_bridge");if(bridge)bridge.value=scanned;setScanMode(false);setScanFeedback(null);return;}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ Tap button writes to bridge')
else:
    r.append('✗ Tap button not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
