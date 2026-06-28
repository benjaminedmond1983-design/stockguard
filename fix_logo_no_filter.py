files = [
    '/Users/benjaminedmond/stockguard/src/components/Sidebar.js',
    '/Users/benjaminedmond/stockguard/src/components/helpers.js',
    '/Users/benjaminedmond/stockguard/src/App.js',
    '/Users/benjaminedmond/stockguard/src/components/AuthScreen.js',
    '/Users/benjaminedmond/stockguard/src/components/RoleScreen.js',
]
for path in files:
    with open(path, 'r') as f:
        content = f.read()
    new = content.replace("filter:'brightness(0) invert(1)'", "opacity:'1'")
    if new != content:
        with open(path, 'w') as f:
            f.write(new)
        print(f"SUCCESS: {path}")
    else:
        print(f"NO MATCH: {path}")
