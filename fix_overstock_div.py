path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = 'Simulate</button></div></div></div>);})});})()}</div>)}</div>)}'
new = 'Simulate</button></div></div></div>);})}</div>);})()}</div>)}</div>)}'

count = content.count(old)
if count == 0:
    print("ERROR: marker not found — paste me: node -e \"const fs=require('fs');const c=fs.readFileSync('src/App.js','utf8');const i=c.indexOf('Simulate</button>');console.log(c.slice(i,i+80));\"")
elif count > 1:
    print(f"ERROR: marker found {count} times — refusing to guess which one.")
else:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: added the missing </div> closing the Overstock summary wrapper.")
