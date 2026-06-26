with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

import re
for m in re.finditer(r'tab==="shopify"', content):
    print('POS:', m.start())
    print(repr(content[m.start()-5:m.start()+120]))
    print('---')
