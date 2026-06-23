path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'if(existing){setRecForm(r=>({...r,sku:existing.sku,name:existing.name,category:existing.category,supplier:existing.supplier,unitCost:existing.unitCost,sellingPrice:existing.sellingPrice,location:existing.location}));}'

new1 = 'if(existing){setRecForm(r=>({...r,sku:existing.sku,name:existing.name,category:existing.category,supplier:existing.supplier,unitCost:existing.unitCost,sellingPrice:existing.sellingPrice,location:existing.location}));}else{setRecForm(r=>({...r,sku:code}));}'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ else branch added')
else:
    print('✗ Not matched')

with open(path, 'w') as f:
    f.write(c)
