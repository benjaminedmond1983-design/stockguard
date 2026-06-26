import re

with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

# 1. Add QuickBooks to SUPPLY CHAIN nav group
old1 = 'tabs:["Suppliers","shopify","Shopify"]'
new1 = 'tabs:["Suppliers","shopify","Shopify","quickbooks","QuickBooks"]'
assert old1 in content, "MATCH 1 FAILED"
content = content.replace(old1, new1, 1)

# 2. Add QuickBooks tab render after Shopify tab render
old2 = '''      {tab==="shopify"&&(
        <ShopifyTab supabase={supabase} userId={userId} />
      )}'''
new2 = '''      {tab==="shopify"&&(
        <ShopifyTab supabase={supabase} userId={userId} />
      )}
      {tab==="quickbooks"&&(
        <QuickBooksTab supabase={supabase} userId={userId} />
      )}'''
assert old2 in content, "MATCH 2 FAILED"
content = content.replace(old2, new2, 1)

with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
    f.write(content)

print("All changes applied successfully!")
