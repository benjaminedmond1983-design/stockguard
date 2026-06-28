import re

files = [
    ('/Users/benjaminedmond/stockguard/src/components/Sidebar.js', '160px'),
    ('/Users/benjaminedmond/stockguard/src/components/helpers.js', '120px'),
    ('/Users/benjaminedmond/stockguard/src/App.js', '160px'),
    ('/Users/benjaminedmond/stockguard/src/components/AuthScreen.js', '180px'),
    ('/Users/benjaminedmond/stockguard/src/components/RoleScreen.js', '180px'),
]

for path, width in files:
    with open(path, 'r') as f:
        content = f.read()
    # Replace mixBlendMode:multiply with a CSS filter that turns it white
    new = content.replace(
        "mixBlendMode:'multiply'",
        "filter:'brightness(0) invert(1)'"
    )
    if new == content:
        print(f"NO MATCH: {path}")
    else:
        with open(path, 'w') as f:
            f.write(new)
        print(f"SUCCESS: {path}")
