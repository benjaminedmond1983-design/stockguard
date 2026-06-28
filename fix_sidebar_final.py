path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

# Fix 1: Remove scroll
content = content.replace('overflowY: "auto"', 'overflowY: "hidden"')

# Fix 2: Better logo size - large enough to see shield + STOCKGUARD text
content = content.replace("width:'120px'", "width:'150px'")

# Fix 3: Tighten logo padding so it doesn't push nav down
content = content.replace('padding:"16px"', 'padding:"8px 16px"')

with open(path, 'w') as f:
    f.write(content)
print("SUCCESS")
