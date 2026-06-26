with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

old = 'tabs:["Suppliers","shopify","Shopify"]'
new = 'tabs:["Suppliers","shopify","quickbooks"]'

if old in content:
    content = content.replace(old, new, 1)
    with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NO MATCH")
