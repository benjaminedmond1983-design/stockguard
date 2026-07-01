with open('src/App.js', 'r') as f:
    content = f.read()

old = 'exists?"Update":"New"}</span></td></tr>);})}</tbody></table></div></div>)}</>)}</div>)}'
new = 'exists?"Update":"New"}</span></td></tr>);})}</tbody></table></div></div>)}</div>)}'

count = content.count(old)
print('Occurrences found:', count)
if count == 1:
    content = content.replace(old, new)
    with open('src/App.js', 'w') as f:
        f.write(content)
    print('Removed stray </> closing fragment tag')
else:
    print('Did not find exactly 1 match — aborting')
