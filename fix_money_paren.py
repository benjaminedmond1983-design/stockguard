path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = 'Why now \u2192 {item.rationale}</div></div>)))}</div></div></>)}{swotData?.error'
new = 'Why now \u2192 {item.rationale}</div></div>)))}</div></div>)}</>)}{swotData?.error'

count = content.count(old)
if count == 0:
    print("ERROR: marker not found.")
elif count > 1:
    print(f"ERROR: marker found {count} times.")
else:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: restored the missing )} closing the Money Strategies conditional.")
