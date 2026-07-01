with open('src/App.js', 'r') as f:
    content = f.read()

old = 'Simulate</button></div></div></div>);})}</>);})()}</div>)}</div>)}'
new = 'Simulate</button></div></div></div>);})});})()}</div>)}</div>)}'

count = content.count(old)
print('Occurrences found:', count)
if count == 1:
    content = content.replace(old, new)
    with open('src/App.js', 'w') as f:
        f.write(content)
    print('Removed stray </> closing fragment tag')
else:
    print('Did not find exactly 1 match — aborting')
