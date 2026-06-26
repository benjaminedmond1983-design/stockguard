with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

# Insert QB tab block after the last ShopifyTab render (pos 141691)
# Find the )} that closes it and insert after
idx = 141691
# Find the closing )} from this position
close_idx = content.find('\n)}\n\n', idx)
print("Close found at:", close_idx)
print("Context:", repr(content[close_idx:close_idx+20]))

insert_after = close_idx + len('\n)}\n\n')
qb_block = '      {tab==="quickbooks"&&(\n        <QuickBooksTab supabase={supabase} userId={userId} />\n      )}\n\n'

content = content[:insert_after] + qb_block + content[insert_after:]

with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
    f.write(content)
print("SUCCESS - inserted at position", insert_after)
