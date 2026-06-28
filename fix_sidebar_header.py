path = '/Users/benjaminedmond/stockguard/src/components/Sidebar.js'
with open(path, 'r') as f:
    lines = f.readlines()

# Find the padding:"24px 16px 20px" line
start_line = None
for i, line in enumerate(lines):
    if 'padding:"24px 16px 20px"' in line:
        start_line = i
        break

if start_line is None:
    print("NO MATCH")
else:
    # Find the closing </div> - look for the 4th </div> after start
    end_line = None
    div_count = 0
    for i in range(start_line, start_line + 20):
        if '</div>' in lines[i]:
            div_count += 1
            if div_count == 4:
                end_line = i
                break

    print(f"Found block: lines {start_line+1} to {end_line+1}")
    print("".join(lines[start_line:end_line+1]))

    new_lines = [
        '        <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,0.08)", textAlign:"center" }}>\n',
        '          <img src={require(\'../assets/logo.png\')} alt="StockGuard" style={{width:\'160px\', display:\'block\', margin:\'0 auto\', mixBlendMode:\'multiply\'}} />\n',
        '        </div>\n'
    ]

    lines = lines[:start_line] + new_lines + lines[end_line+1:]
    with open(path, 'w') as f:
        f.writelines(lines)
    print("SUCCESS")
