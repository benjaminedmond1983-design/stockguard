with open('/Users/benjaminedmond/stockguard/src/components/constants.js', 'r') as f:
    content = f.read()

old = '"shopify", "Shopify", "quickbooks", "QuickBooks", "billing"'
new = '"shopify", "Shopify", "quickbooks", "QuickBooks", "square", "Square", "billing"'

if old in content:
    content = content.replace(old, new, 1)
    with open('/Users/benjaminedmond/stockguard/src/components/constants.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NO MATCH")
