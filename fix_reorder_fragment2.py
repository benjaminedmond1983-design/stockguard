path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_tail = 'padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{r.urgency}</span></span></div>);})}</></div>)}'
new_tail = 'padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{r.urgency}</span></span></div>);})}</>)}</div>)}'

count = content.count(old_tail)
if count == 0:
    print("ERROR: marker not found — paste me `sed -n \"691p\" src/App.js | tail -c 300` so I can see the exact current tail.")
elif count > 1:
    print(f"ERROR: marker found {count} times — refusing to guess which one.")
else:
    content = content.replace(old_tail, new_tail)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: moved the outer </div> outside the reorders.length&&(...) parentheses.")
