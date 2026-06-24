path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

r = []

# Add data attribute to Sales cancel button
old1 = 'style={{...btn(scanMode?"#A32D2D":"#0D7E6E"),padding:"6px 14px",fontSize:12}}>{scanMode?"× Cancel scan":"📷 Scan barcode"}</button>'
new1 = 'data-sales-scan-btn="1" style={{...btn(scanMode?"#A32D2D":"#0D7E6E"),padding:"6px 14px",fontSize:12}}>{scanMode?"× Cancel scan":"📷 Scan barcode"}</button>'

if old1 in c:
    c = c.replace(old1, new1, 1)
    r.append('✓ data attr added')
else:
    r.append('✗ button not matched')

# Fix scan success to click the cancel button then set SKU
old2 = 'if(codes.length>0){const scanned=codes[0].rawValue;alert("Sales scanned: "+scanned);if(window._sgStopCamera)window._sgStopCamera();setScanMode(false);setSaleForm(f=>({...f,sku:scanned}));return;}'
new2 = 'if(codes.length>0){const scanned=codes[0].rawValue;if(window._sgStopCamera)window._sgStopCamera();window._sgSalesScanned=scanned;const btn=document.querySelector("[data-sales-scan-btn]");if(btn)btn.click();return;}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    r.append('✓ scan success clicks cancel')
else:
    r.append('✗ scan success not matched')

# After cancel button click, read _sgSalesScanned and set saleForm
old3 = 'setScanFeedback(null);startCameraScan();}'
new3 = 'setScanFeedback(null);if(!scanMode&&window._sgSalesScanned){const s=window._sgSalesScanned;window._sgSalesScanned=null;setSaleForm(f=>({...f,sku:s}));}else{startCameraScan();}}'

if old3 in c:
    c = c.replace(old3, new3, 1)
    r.append('✓ cancel reads scanned value')
else:
    r.append('✗ cancel not matched')

with open(path, 'w') as f:
    f.write(c)

for x in r: print(x)
