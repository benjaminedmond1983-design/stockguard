path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

old = '        <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,0.08)", textAlign:"center" }}>\n          <img src={require(\'../assets/logo.png\')} alt="StockGuard" style={{width:\'160px\', display:\'block\', margin:\'0 auto\', mixBlendMode:\'multiply\'}} />\n        </div>\n\n      <nav'

new = '        <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,0.08)", textAlign:"center" }}>\n          <img src={require(\'../assets/logo.png\')} alt="StockGuard" style={{width:\'160px\', display:\'block\', margin:\'0 auto\', mixBlendMode:\'multiply\'}} />\n        </div>\n\n      </div>\n      <nav'

if old in content:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    idx = content.find('textAlign:"center"')
    print(repr(content[idx:idx+300]))
