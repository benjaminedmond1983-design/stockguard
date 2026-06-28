import re

files = [
    '/Users/benjaminedmond/stockguard/src/components/RoleScreen.js',
    '/Users/benjaminedmond/stockguard/src/components/AuthScreen.js',
]

new_logo = '<img src={require(\'../assets/logo.png\')} alt="StockGuard" style={{width:\'180px\',display:\'block\',margin:\'0 auto\',mixBlendMode:\'multiply\'}} />'

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    result = re.sub(r'const SG_LOGO = \([\s\S]*?\);', f'const SG_LOGO = ({new_logo});', content, count=1)
    if result == content:
        print(f"NO MATCH: {path}")
    else:
        with open(path, 'w') as f:
            f.write(result)
        print(f"SUCCESS: {path}")

# Fix App.js inline SVGs at lines 399 and 462
app_path = '/Users/benjaminedmond/stockguard/src/App.js'
new_app_logo = '<img src={require(\'./assets/logo.png\')} alt="StockGuard" style={{width:\'160px\',display:\'block\',margin:\'0 auto\',mixBlendMode:\'multiply\'}} />'
with open(app_path, 'r') as f:
    content = f.read()
result = re.sub(r'<svg width="4[048]" height="4[048]" viewBox="0 0 4[048] 4[048]"[\s\S]*?</svg>', new_app_logo, content)
if result == content:
    print("NO MATCH: App.js inline SVGs")
else:
    with open(app_path, 'w') as f:
        f.write(result)
    print("SUCCESS: App.js inline SVGs")
