import re

path = "src/App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

marker = '''              </p>
        </div>
      </div>

      {/* Mobile bottom nav */}'''

replacement = '''              </p>
        </div>
      </div>
      </div>

      {/* Mobile bottom nav */}'''

count = content.count(marker)
if count == 0:
    print("ERROR: marker not found — file may already be edited, or whitespace differs. No changes made.")
elif count > 1:
    print(f"ERROR: marker found {count} times — refusing to guess which one. No changes made.")
else:
    content = content.replace(marker, replacement)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: added missing </div> to close the sg-sidebar element.")
