with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

old = 'import BillingTab from "./BillingTab";'
new = 'import BillingTab from "./BillingTab";\nimport QuickBooksTab from "./QuickBooksTab";'

if old in content:
    content = content.replace(old, new, 1)
    with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED - import line not found")
