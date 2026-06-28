path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

new = content.replace("width:'160px'", "width:'120px'")

if new != content:
    with open(path, 'w') as f:
        f.write(new)
    print("SUCCESS")
else:
    print("NO MATCH")
