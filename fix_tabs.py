with open('/Users/benjaminedmond/stockguard/src/components/constants.js', 'r') as f:
    content = f.read()

old = '"Intelligence", "Business Insights", "Automations", "Import Products", "Pricing", "shopify", "billing"'
new = '"Intelligence", "Business Insights", "Automations", "Import Products", "Pricing", "shopify", "quickbooks", "billing"'

if old in content:
    content = content.replace(old, new, 1)
    with open('/Users/benjaminedmond/stockguard/src/components/constants.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED - no match")
