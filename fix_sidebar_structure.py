path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    lines = f.readlines()

# Line 21 (index 20) is the extra stray </div> - remove it
del lines[20]

with open(path, 'w') as f:
    f.writelines(lines)
print("SUCCESS")
