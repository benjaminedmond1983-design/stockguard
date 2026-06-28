path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "require('../assets/logo.png')",
    "require('../assets/logo-sidebar.png')"
)
with open(path, 'w') as f:
    f.write(content)
print("SUCCESS")
