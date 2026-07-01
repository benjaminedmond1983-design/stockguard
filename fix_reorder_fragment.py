path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '{reorders.length>0&&(<div style={{fontSize:13,fontWeight:500,color:C.muted,marginTop:24,marginBottom:8}}>Reorder history</div>{reorders.map(r=>{const urg={Critical:"#A32D2D",High:"#854F0B",Normal:"#3B6D11"};const urgBg={Critical:"#FCEBEB",High:"#FAEEDA",Normal:"#EAF3DE"};return(<div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span><strong>{r.name}</strong> \u2014 {r.qty} units from {r.supplier}</span><span style={{display:"flex",gap:8,alignItems:"center",color:C.muted}}><span>{r.date}</span><span style={{background:urgBg[r.urgency],color:urg[r.urgency],padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{r.urgency}</span></span></div>);})}</div>)}'

new = '{reorders.length>0&&(<><div style={{fontSize:13,fontWeight:500,color:C.muted,marginTop:24,marginBottom:8}}>Reorder history</div>{reorders.map(r=>{const urg={Critical:"#A32D2D",High:"#854F0B",Normal:"#3B6D11"};const urgBg={Critical:"#FCEBEB",High:"#FAEEDA",Normal:"#EAF3DE"};return(<div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span><strong>{r.name}</strong> \u2014 {r.qty} units from {r.supplier}</span><span style={{display:"flex",gap:8,alignItems:"center",color:C.muted}}><span>{r.date}</span><span style={{background:urgBg[r.urgency],color:urg[r.urgency],padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{r.urgency}</span></span></div>);})}</></div>)}'

count = content.count(old)
if count == 0:
    print("ERROR: marker not found — paste me `sed -n \"689,691p\" src/App.js` output so I can adjust.")
elif count > 1:
    print(f"ERROR: marker found {count} times — refusing to guess which one.")
else:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: wrapped Reorder history block in a Fragment and removed the orphan </div>.")
