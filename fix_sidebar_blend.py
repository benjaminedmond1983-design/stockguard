path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "width:'140px', display:'block', margin:'0 auto'",
    "width:'140px', display:'block', margin:'0 auto', mixBlendMode:'screen'"
)

with open(path, 'w') as f:
    f.write(content)
print("SUCCESS")
