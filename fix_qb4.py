with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

old2 = '    {tab==="shopify"&&(\n            <ShopifyTab supabase={supabase} userId={userId} />\n)\n}'
new2 = '    {tab==="shopify"&&(\n            <ShopifyTab supabase={supabase} userId={userId} />\n)\n}\n      {tab==="quickbooks"&&(\n        <QuickBooksTab supabase={supabase} userId={userId} />\n      )}'

if old2 in content:
    content = content.replace(old2, new2, 1)
    with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    idx = content.find('tab==="shopify"')
    print("STILL NO MATCH - exact repr:")
    print(repr(content[idx-5:idx+120]))
