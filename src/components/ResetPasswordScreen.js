import { useState } from "react";
import { supabase } from "../supabase";

export default function ResetPasswordScreen({ onDone }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inp = { width:"100%", padding:"11px 14px", borderRadius:8, border:"1px solid #e0e0e0", fontSize:14, boxSizing:"border-box", outline:"none", marginBottom:10 };

  async function handleSubmit() {
    setError("");
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error: e } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (e) setError(e.message);
    else onDone();
  }

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"40px 36px", width:360, boxShadow:"0 4px 24px rgba(0,0,0,0.10)" }}>
        <div style={{ fontWeight:700, fontSize:17, color:"#1B2B4B", marginBottom:6, textAlign:"center" }}>Choose a new password</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:20, textAlign:"center" }}>Enter and confirm your new password below.</div>
        {error && <div style={{ background:"#FCEBEB", color:"#A32D2D", fontSize:12, padding:"8px 12px", borderRadius:8, marginBottom:12 }}>{error}</div>}
        <input placeholder="New password" type="password" value={pw} onChange={e => setPw(e.target.value)} style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
        <input placeholder="Confirm new password" type="password" value={pw2} onChange={e => setPw2(e.target.value)} style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"11px", borderRadius:8, border:"none", background:"#1B2B4B", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "..." : "Set new password"}
        </button>
        <div style={{ marginTop:24, fontSize:11, color:"#aaa", fontStyle:"italic", textAlign:"center" }}>
          "Commit to the Lord whatever you do"<br/>Proverbs 16:3
        </div>
      </div>
    </div>
  );
}
