path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_start = '{swotData&&!swotData.error&&(<div style={{display:"flex",gap:4,marginBottom:18}}>'
new_start = '{swotData&&!swotData.error&&(<><div style={{display:"flex",gap:4,marginBottom:18}}>'

old_end = 'Why now \u2192 {item.rationale}</div></div>)))}</div></div>)}{swotData?.error&&<div style={{color:"#A32D2D",fontSize:13,padding:12}}>{swotData.error}</div>}</div>)}'
new_end = 'Why now \u2192 {item.rationale}</div></div>)))}</div></div></>)}{swotData?.error&&<div style={{color:"#A32D2D",fontSize:13,padding:12}}>{swotData.error}</div>}</div>)}'

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
    print("SUCCESS: wrapped the SWOT/Porter/Money tab panels in a Fragment.")
else:
    print("No changes written.")
