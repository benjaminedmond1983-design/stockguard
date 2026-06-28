import { useState } from "react";
import { supabase } from "../supabase";

const SG_LOGO = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#0F1C35"/>
              <path d="M24 5L41 14.5V33.5L24 43L7 33.5V14.5Z" fill="#1B2B4B" stroke="#2563EB" strokeWidth="1.5"/>
              <path d="M24 9L37 16.5V31.5L24 39L11 31.5V16.5Z" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.4"/>
              <rect x="16" y="11" width="4" height="11" rx="2" fill="#1d4ed8"/>
              <rect x="22" y="8" width="4" height="14" rx="2" fill="#2563EB"/>
              <rect x="28" y="13" width="4" height="9" rx="2" fill="#3B82F6"/>
              <rect x="35" y="7" width="2.5" height="10" rx="1.25" fill="#22d3ee"/>
              <rect x="32" y="10.5" width="9" height="2.5" rx="1.25" fill="#22d3ee"/>
              <text x="11" y="37" fontSize="14" fontWeight="800" fill="white" fontFamily="system-ui,sans-serif">S</text>
              <text x="23" y="37" fontSize="14" fontWeight="800" fill="#3B82F6" fontFamily="system-ui,sans-serif">G</text>
              <path d="M24 41L17 37H31Z" fill="#2563EB" opacity="0.5"/>
            </svg>
);

export default function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inp = {
    width:"100%", padding:"11px 14px", borderRadius:8,
    border:"1px solid #e0e0e0", fontSize:14,
    boxSizing:"border-box", outline:"none", marginBottom:10
  };

  async function handleSubmit() {
    setError(""); setMessage(""); setLoading(true);
    if (mode === "signin") {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) setError(e.message);
    } else if (mode === "signup") {
      const { error: e } = await supabase.auth.signUp({ email, password });
      if (e) setError(e.message);
      else setMessage("Account created! You can now sign in.");
    } else {
      const { error: e } = await supabase.auth.resetPasswordForEmail(email);
      if (e) setError(e.message);
      else setMessage("Password reset email sent!");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"40px 36px", width:360, boxShadow:"0 4px 24px rgba(0,0,0,0.10)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:28 }}>
          {SG_LOGO}
          <div>
            <div style={{ fontWeight:700, fontSize:22, color:"#1B2B4B", lineHeight:1 }}>StockGuard</div>
            <div style={{ fontSize:12, color:"#888", marginTop:2 }}>Supply Chain Tracker</div>
          </div>
        </div>
        <div style={{ fontWeight:700, fontSize:17, color:"#1B2B4B", marginBottom:6, textAlign:"center" }}>
          {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
        </div>
        <div style={{ fontSize:12, color:"#888", marginBottom:20, textAlign:"center" }}>
          {mode === "signin" ? "Sign in to your store" : ""}
        </div>
        {error && <div style={{ background:"#FCEBEB", color:"#A32D2D", fontSize:12, padding:"8px 12px", borderRadius:8, marginBottom:12 }}>{error}</div>}
        {message && <div style={{ background:"#EAF3DE", color:"#3B6D11", fontSize:12, padding:"8px 12px", borderRadius:8, marginBottom:12 }}>{message}</div>}
        <input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
        {mode !== "forgot" && (
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
        )}
        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"11px", borderRadius:8, border:"none", background:"#1B2B4B", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", marginBottom:14, opacity: loading ? 0.7 : 1 }}>
          {loading ? "..." : { signin:"Sign in", signup:"Create account", forgot:"Send reset email" }[mode]}
        </button>
        <div style={{ display:"flex", justifyContent:"center", gap:16, fontSize:12, color:"#666" }}>
          {mode === "signin" && (
            <>
              <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} style={{ background:"none", border:"none", color:"#185FA5", cursor:"pointer", fontSize:12 }}>Create account</button>
              <span>·</span>
              <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} style={{ background:"none", border:"none", color:"#185FA5", cursor:"pointer", fontSize:12 }}>Forgot password</button>
            </>
          )}
          {mode !== "signin" && (
            <button onClick={() => { setMode("signin"); setError(""); setMessage(""); }} style={{ background:"none", border:"none", color:"#185FA5", cursor:"pointer", fontSize:12 }}>← Back to sign in</button>
          )}
        </div>
        <div style={{ marginTop:24, fontSize:11, color:"#aaa", fontStyle:"italic", textAlign:"center" }}>
          "Commit to the Lord whatever you do"<br/>Proverbs 16:3
        </div>
      </div>
    </div>
  );
}