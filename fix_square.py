with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

# 1. Add import
old1 = 'import QuickBooksTab from "./QuickBooksTab";'
new1 = 'import QuickBooksTab from "./QuickBooksTab";\nimport SquareTab from "./SquareTab";'

# 2. Add square to nav group
old2 = 'tabs:["Suppliers","shopify","quickbooks"]'
new2 = 'tabs:["Suppliers","shopify","quickbooks","square"]'

# 3. Add square label
old3 = 't==="quickbooks"?"QuickBooks":t'
new3 = 't==="quickbooks"?"QuickBooks":t==="square"?"Square":t'

# 4. Add square tab render after quickbooks
old4 = '      {tab==="quickbooks"&&(\n        <QuickBooksTab supabase={supabase} userId={userId} />\n      )}'
new4 = '      {tab==="quickbooks"&&(\n        <QuickBooksTab supabase={supabase} userId={userId} />\n      )}\n      {tab==="square"&&(\n        <SquareTab supabase={supabase} userId={userId} />\n      )}'

# 5. Add square to OWNER_TABS in constants
results = []
for old, new in [(old1,new1),(old2,new2),(old3,new3),(old4,new4)]:
    if old in content:
        content = content.replace(old, new, 1)
        results.append(f"OK: {old[:50]}")
    else:
        results.append(f"MISS: {old[:50]}")

with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
    f.write(content)

for r in results:
    print(r)
