path = 'src/App.js'
with open(path, 'r') as f:
    c = f.read()

old1 = 'style={{...btn(scanMode?"#A32D2D":"#0D7E6E"),padding:"6px 14px",fontSize:12}}>{scanMode?"× Cancel scan":"📷 Scan barcode"}</button>'
new1 = 'data-sales-scan-btn="1" style={{...btn(scanMode?"#A32D2D":"#0D7E6E"),padding:"6px 14px",fontSize:12}}>{scanMode?"× Cancel scan":"📷 Scan barcode"}</button>'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print('✓ data attr added')
else:
    # Try without the emoji
    old2 = '}>{scanMode?"× Cancel scan":"📷 Scan barcode"}</button>'
    if old2 in c:
        print('Found alternate - showing context')
        i = c.find(old2)
        print(repr(c[i-100:i+60]))
    else:
        print('✗ not found at all')

with open(path, 'w') as f:
    f.write(c)
