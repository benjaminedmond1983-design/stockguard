with open('/Users/benjaminedmond/stockguard/src/components/constants.js', 'r') as f:
    content = f.read()

old = '"shopify", "quickbooks", "billing"'
new = '"shopify", "Shopify", "quickbooks", "QuickBooks", "billing"'

if old in content:
    content = content.replace(old, new, 1)
    with open('/Users/benjaminedmond/stockguard/src/components/constants.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NO MATCH - checking content:")
    idx = content.find('"shopify"')
    print(repr(content[idx:idx+60]))
