path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '</div></div>)}{swotData?.error&&<div style={{color:"#A32D2D",fontSize:13,padding:12}}>{swotData.error}</div>}</div>)}'
new = '</div></div></>)}{swotData?.error&&<div style={{color:"#A32D2D",fontSize:13,padding:12}}>{swotData.error}</div>}</div>)}'

count = content.count(old)
if count == 0:
    print("ERROR: marker not found.")
elif count > 1:
    print(f"ERROR: marker found {count} times.")
else:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: added closing </> before the swotData?.error sibling.")
