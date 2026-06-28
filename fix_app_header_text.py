path = '/Users/benjaminedmond/stockguard/src/App.js'
with open(path, 'r') as f:
    lines = f.readlines()

# Line 463 (index 462) is the StockGuard/Owner View text div - remove it
del lines[462]

with open(path, 'w') as f:
    f.writelines(lines)
print("SUCCESS")
