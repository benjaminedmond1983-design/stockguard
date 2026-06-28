path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

# Switch to full logo
content = content.replace(
    "require('../assets/logo-sidebar.png')",
    "require('../assets/logo.png')"
)

# Make it centered and properly sized
content = content.replace(
    "width:'160px', display:'block', margin:'0 auto', opacity:'1'",
    "width:'180px', display:'block', margin:'0 auto'"
)

with open(path, 'w') as f:
    f.write(content)
print("SUCCESS")
