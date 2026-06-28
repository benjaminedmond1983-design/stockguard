import re

path = '/Users/benjaminedmond/stockguard/src/App.js'
with open(path, 'r') as f:
    content = f.read()

new_logo = 'const SG_LOGO=(<img src={require(\'./assets/logo.png\')} alt="StockGuard" style={{width:\'160px\',display:\'block\',margin:\'0 auto\',mixBlendMode:\'multiply\'}} />);'

result = re.sub(r'const SG_LOGO=\(<svg[\s\S]*?</svg>\);', new_logo, content, count=1)

if result == content:
    print("NO MATCH")
else:
    with open(path, 'w') as f:
        f.write(result)
    print("SUCCESS")
