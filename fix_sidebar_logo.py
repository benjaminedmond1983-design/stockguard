import re

path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

# Replace any <svg ...>...</svg> logo block with the PNG img tag
new_logo = '<img src={require(\'../assets/logo.png\')} alt="StockGuard" style={{width:\'160px\', display:\'block\', margin:\'0 auto\', mixBlendMode:\'multiply\'}} />'

# Match the svg opening tag and everything through closing </svg>
result = re.sub(r'<svg[\s\S]*?</svg>', new_logo, content, count=1)

if result == content:
    print("NO MATCH")
else:
    with open(path, 'w') as f:
        f.write(result)
    print("SUCCESS")
