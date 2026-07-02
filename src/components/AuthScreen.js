import { useState } from "react";
import { supabase } from "../supabase";

const SG_LOGO = (<img src={require('../assets/logo.png')} alt="StockGuard" style={{width:'180px',display:'block',margin:'0 auto',opacity:'1'}} />);

export default function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPw, setShowPw] = useState(false);

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
      const { error: e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
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
          <div style={{ position:"relative" }}>
            <input placeholder="Password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, paddingRight:40 }} onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
            <button onClick={() => setShowPw(s => !s)} tabIndex={-1} style={{ position:"absolute", right:10, top:11, background:"none", border:"none", cursor:"pointer", fontSize:15, padding:0 }}>{showPw ? "\u{1F648}" : "\u{1F441}\u{FE0F}"}</button>
          </div>
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