with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

# Target the last shopify block (pos 141691) which is followed by billing
old2 = '    {tab==="shopify"&&(\n        <ShopifyTab supabase={supabase} userId={userId} />\n)}\n\n'
new2 = '    {tab==="shopify"&&(\n        <ShopifyTab supabase={supabase} userId={userId} />\n)}\n      {tab==="quickbooks"&&(\n        <QuickBooksTab supabase={supabase} userId={userId} />\n      )}\n\n'

# Get exact string at pos 141691
idx = 141691
chunk = repr(content[idx-5:idx+100])
print("CHUNK:", chunk)

if old2 in content:
    content = content.replace(old2, new2, 1)
    with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NO MATCH - need exact chars")
