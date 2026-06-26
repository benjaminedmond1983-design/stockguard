with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

old = 't==="shopify"?"Shopify":t==="billing"?"Billing":t'
new = 't==="shopify"?"Shopify":t==="billing"?"Billing":t==="quickbooks"?"QuickBooks":t'

if old in content:
    content = content.replace(old, new, 1)
    with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NO MATCH")
