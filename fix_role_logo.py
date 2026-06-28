import re

path = '/Users/benjaminedmond/stockguard/src/components/RoleScreen.js'
with open(path, 'r') as f:
    content = f.read()

new_logo = '<img src={require(\'../assets/logo.png\')} alt="StockGuard" style={{width:\'200px\', display:\'block\', margin:\'0 auto 16px\', mixBlendMode:\'multiply\'}} />'

result = re.sub(r'<svg[\s\S]*?</svg>', new_logo, content, count=1)

if result == content:
    print("NO MATCH")
else:
    with open(path, 'w') as f:
        f.write(result)
    print("SUCCESS")
