# Fix RoleScreen.js - remove PIN, Owner button goes directly to onRole
with open('/Users/benjaminedmond/stockguard/src/components/RoleScreen.js', 'r') as f:
    content = f.read()

# Remove OWNER_PIN constant
content = content.replace('const OWNER_PIN = "1234";\n', '')

# Remove pin and pinError state
content = content.replace('  const [pin, setPin] = useState("");\n', '')
content = content.replace('  const [pinError, setPinError] = useState("");\n', '')

# Remove handlePinSubmit or similar logic - replace setShowPin with direct onRole
content = content.replace('onClick={() => setShowPin(true)}', 'onClick={() => onRole("owner")}')

with open('/Users/benjaminedmond/stockguard/src/components/RoleScreen.js', 'w') as f:
    f.write(content)
print("RoleScreen done")

# Fix App.js - remove OWNER_PIN constant
with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

content = content.replace('const OWNER_PIN = "1234";\n', '')

with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
    f.write(content)
print("App.js done")
