path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_start = '{importStatus!=="done"&&(<div style={{display:"flex",gap:4,marginBottom:18}}>'
new_start = '{importStatus!=="done"&&(<><div style={{display:"flex",gap:4,marginBottom:18}}>'

old_end = 'Preview import</button></div></div>)}{importErrors.length>0&&'
new_end = 'Preview import</button></div></div>)}</>)}{importErrors.length>0&&'

def apply(content, old, new, label):
    count = content.count(old)
    if count == 0:
        print(f"ERROR ({label}): marker not found.")
        return content, False
    elif count > 1:
        print(f"ERROR ({label}): marker found {count} times.")
        return content, False
    else:
        content = content.replace(old, new)
        print(f"OK ({label}): applied.")
        return content, True

content, ok1 = apply(content, old_start, new_start, "fragment-open")
content, ok2 = apply(content, old_end, new_end, "fragment-close")

if ok1 and ok2:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: wrapped the CSV/Paste/Manual import tab picker in a Fragment.")
else:
    print("No changes written.")
