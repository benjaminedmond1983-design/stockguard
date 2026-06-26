with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

old2 = '  {tab==="shopify"&&(\n   <ShopifyTab supabase={supabase} userId={userId} />\n)}'
new2 = '  {tab==="shopify"&&(\n   <ShopifyTab supabase={supabase} userId={userId} />\n)}\n      {tab==="quickbooks"&&(\n        <QuickBooksTab supabase={supabase} userId={userId} />\n      )}'

if old2 in content:
    content = content.replace(old2, new2, 1)
    with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    # Print the exact bytes around the shopify tab for debugging
    idx = content.find('tab==="shopify"')
    print("NOT FOUND - nearby chars:")
    print(repr(content[idx-5:idx+80]))
