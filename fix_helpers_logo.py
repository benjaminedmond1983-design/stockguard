path = '/Users/benjaminedmond/stockguard/src/components/helpers.js'
with open(path, 'r') as f:
    content = f.read()

old = "export const SG_LOGO = ("
start = content.find(old)
if start == -1:
    print("NO MATCH")
else:
    end = content.find(');', start) + 2
    new_logo = '''export const SG_LOGO = (
  <img src={require('../assets/logo.png')} alt="StockGuard" style={{width:'120px', display:'block', mixBlendMode:'multiply'}} />
);'''
    content = content[:start] + new_logo + content[end:]
    with open(path, 'w') as f:
        f.write(content)
    print("SUCCESS")
