import re

with open('/Users/benjaminedmond/stockguard/src/components/Sidebar.js', 'r') as f:
    content = f.read()

old = '''<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#ffffff" fillOpacity="0.12"/>
              <text x="4" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">S</t\next>
              <text x="19" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">G</t\next>
              <rect x="33" y="10" width="2" height="10" rx="1" fill="#ffffff" opacity="0.9"/>
              <rect x="30" y="13.5" width="8" height="2" rx="1" fill="#ffffff" opacity="0.9"/>
            </svg>'''

new = '''<svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="10" fill="#ffffff"/>
              <path d="M22 4L38 13V31L22 40L6 31V13Z" fill="#1B2B4B" stroke="#2563EB" strokeWidth="1.2"/>
              <path d="M22 8L34 15V29L22 36L10 29V15Z" fill="none" stroke="#3B82F6" strokeWidth="0.8" opacity="0.5"/>
              <rect x="14" y="10" width="3.5" height="9" rx="1.5" fill="#22d3ee"/>
              <rect x="19" y="7" width="3.5" height="12" rx="1.5" fill="#3B82F6"/>
              <rect x="24" y="12" width="3.5" height="7" rx="1.5" fill="#60a5fa"/>
              <rect x="31" y="7" width="2.5" height="9" rx="1.25" fill="#22d3ee"/>
              <rect x="28" y="10" width="9" height="2.5" rx="1.25" fill="#22d3ee"/>
              <text x="11" y="32" fontSize="12" fontWeight="800" fill="white" fontFamily="system-ui">S</text>
              <text x="21" y="32" fontSize="12" fontWeight="800" fill="#3B82F6" fontFamily="system-ui">G</text>
            </svg>'''

if old in content:
    content = content.replace(old, new, 1)
    with open('/Users/benjaminedmond/stockguard/src/components/Sidebar.js', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NO MATCH - printing SVG section for inspection")
    start = content.find('<svg width="40"')
    print(repr(content[start:start+500]))
