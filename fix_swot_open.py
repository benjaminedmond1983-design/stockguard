path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '{swotData&&!swotData.error&&(<div style={{display:"flex",gap:4,marginBottom:18}}>'
new = '{swotData&&!swotData.error&&(<><div style={{display:"flex",gap:4,marginBottom:18}}>'

count = content.count(old)
if count == 0:
    print("ERROR: marker not found (maybe already applied?).")
elif count > 1:
    print(f"ERROR: marker found {count} times.")
else:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: added the missing opening <> to pair with the </> already in place.")
