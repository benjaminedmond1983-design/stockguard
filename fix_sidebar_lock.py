path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    content = f.read()

content = content.replace('overflow: "hidden"', 'overflow: "hidden"')
content = content.replace('overflowY: "hidden"', 'overflow: "hidden"')
content = content.replace('overflowY: "auto"', 'overflow: "hidden"')

content = content.replace(
    'padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", textAlign:"center"',
    'padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", textAlign:"center", flexShrink:0'
)

content = content.replace(
    'flex:1, padding:"12px 8px"',
    'flex:1, padding:"12px 8px", overflowY:"auto", minHeight:0'
)

with open(path, 'w') as f:
    f.write(content)
print("SUCCESS")
