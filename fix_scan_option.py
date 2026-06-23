path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

# Add scanned SKU as option in the select if it's not in inventory
old1 = '<option value="">Select or type SKU</option>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} — {i.name}</option>)}<option value="__new__">+ New item (type below)</option>'
new1 = '<option value="">Select or type SKU</option>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} — {i.name}</option>)}{recForm.sku&&recForm.sku!=="__new__"&&!inventory.find(i=>i.sku===recForm.sku)&&<option value={recForm.sku}>{recForm.sku} (scanned)</option>}<option value="__new__">+ New item (type below)</option>'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ Scanned SKU option added')
else:
    print('✗ Not matched')

# Also revert the name:code change back to sku:code
old2 = 'else{setRecForm(r=>({...r,sku:"__new__",name:code}));}'
new2 = 'else{setRecForm(r=>({...r,sku:code}));}'

if old2 in c:
    c = c.replace(old2, new2, 1)
    print('✓ sku:code restored')
else:
    print('✗ sku restore not matched')

with open(path, 'w') as f:
    f.write(c)
