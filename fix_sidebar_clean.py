path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    lines = f.readlines()

# Remove lines 13-20 (index 12-19) - the StockGuard/Owner View text block
# Keep lines 1-12 and 21 onwards
new_lines = lines[:12] + lines[20:]

# Also bump logo width to 160px for visibility
new_lines = [l.replace("width:'150px'", "width:'160px'") for l in new_lines]

with open(path, 'w') as f:
    f.writelines(new_lines)
print("SUCCESS")
