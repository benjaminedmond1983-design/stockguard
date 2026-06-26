with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

idx = content.find('tab==="shopify"')
print("EXACT:", repr(content[idx-5:idx+100]))
