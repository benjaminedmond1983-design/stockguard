path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = '<option value="">Select SKU</option>{inventory.map(i=>{const m=marginBadge(i.unitCost,i.sellingPrice);return<option key={i.sku} value={i.sku}>{i.sku} — {i.name} ({i.qty} in stock{i.sel'
new1 = '<option value="">Select SKU</option>{saleForm.sku&&!inventory.find(i=>i.sku===saleForm.sku)&&<option value={saleForm.sku}>{saleForm.sku} (scanned)</option>}{inventory.map(i=>{const m=marginBadge(i.unitCost,i.sellingPrice);return<option key={i.sku} value={i.sku}>{i.sku} — {i.name} ({i.qty} in stock{i.sel'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Scanned option added')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
