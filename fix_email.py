with open('/Users/benjaminedmond/stockguard/src/App.js', 'r') as f:
    content = f.read()

# 1. Pass email to AppInner
old1 = 'return <AppInner role={role} userId={session.user.id} onLogout={()=>setRole(null)} TABS={TABS}/>;'
new1 = 'return <AppInner role={role} userId={session.user.id} userEmail={session.user.email} onLogout={()=>setRole(null)} TABS={TABS}/>;'

# 2. Add userEmail to AppInner function signature
old2 = 'function AppInner({role,onLogout,TABS,userId}){'
new2 = 'function AppInner({role,onLogout,TABS,userId,userEmail}){'

# 3. Pass email to BillingTab
old3 = '<BillingTab supabase={supabase} userId={userId} userEmail={null} />'
new3 = '<BillingTab supabase={supabase} userId={userId} userEmail={userEmail} />'

for old, new in [(old1, new1), (old2, new2), (old3, new3)]:
    if old in content:
        content = content.replace(old, new, 1)
        print(f"SUCCESS: {old[:50]}")
    else:
        print(f"NO MATCH: {old[:50]}")

with open('/Users/benjaminedmond/stockguard/src/App.js', 'w') as f:
    f.write(content)
