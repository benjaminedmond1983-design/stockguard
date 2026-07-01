path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_end = 'Simulate</button></div></div></div>);})}</div>);})()}'
new_end = 'Simulate</button></div></div></div>);})}</>);})()}'

old_start = 'return(<div style={{background:"#FFF8E8",border:"1px solid #F0A500",borderRadius:10,padding:"12px 16px",marginBottom:16}}>'
new_start = 'return(<><div style={{background:"#FFF8E8",border:"1px solid #F0A500",borderRadius:10,padding:"12px 16px",marginBottom:16}}>'

def apply(content, old, new, label):
    count = content.count(old)
    if count == 0:
        print(f"ERROR ({label}): marker not found.")
        return content, False
    elif count > 1:
        print(f"ERROR ({label}): marker found {count} times — refusing to guess which one.")
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
    print("SUCCESS: wrapped the Overstock summary box + item list in a Fragment.")
else:
    print("No changes written — fix the mismatches above first.")
