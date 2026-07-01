with open('src/App.js', 'r') as f:
    content = f.read()

old = 'importStatus!=="done"&&(<><div style={{display:"flex",gap:4,marginBottom:18}}>'
new = 'importStatus!=="done"&&(<div style={{display:"flex",gap:4,marginBottom:18}}>'

count = content.count(old)
print('Occurrences found:', count)
if count == 1:
    content = content.replace(old, new)
    with open('src/App.js', 'w') as f:
        f.write(content)
    print('Removed stray <> opening fragment tag')
else:
    print('Did not find exactly 1 match — aborting')
