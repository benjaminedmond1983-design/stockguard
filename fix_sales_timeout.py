path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Fix the scan success to use setTimeout to set saleForm after camera closes
old1 = 'if(codes.length>0){const scanned=codes[0].rawValue;if(window._sgStopCamera)window._sgStopCamera();window._sgSalesScanned=scanned;const btn=document.querySelector("[data-sales-scan-btn]");if(btn)btn.click();return;}'
new1 = 'if(codes.length>0){const scanned=codes[0].rawValue;if(window._sgStopCamera)window._sgStopCamera();window._sgSalesScanned=scanned;setTimeout(()=>{if(window._sgSalesScanned){setSaleForm(f=>({...f,sku:window._sgSalesScanned}));window._sgSalesScanned=null;}},200);setScanMode(false);return;}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ timeout approach added')
else:
    r.append('✗ not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
