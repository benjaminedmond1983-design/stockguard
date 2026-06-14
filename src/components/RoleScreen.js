import { useState } from "react";
import { supabase } from "../supabase";

const OWNER_PIN = "1234";

const SG_LOGO = (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#1B2B4B"/>
    <text x="4" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">S</text>
    <text x="19" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">G</text>
    <rect x="33" y="10" width="2" height="10" rx="1" fill="#ffffff" opacity="0.9"/>
    <rect x="30" y="13.5" width="8" height="2" rx="1" fill="#ffffff" opacity="0.9"/>
  </svg>
);

export default function RoleScreen({ onRole, onSignOut }) {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  function tryOwnerPin() {
    if (pin === OWNER_PIN) { onRole("owner"); }
    else { setPinError("Incorrect PIN. Try again."); setPin(""); }
  }

  if (showPin) return (
    <div style={{ minHeight:"100vh", background:"#EEF2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"40px 36px", width:340, boxShadow:"0 4px 24px rgba(0,0,0,0.10)" }}>
        <button onClick={() => { setShowPin(false); setPin(""); setPinError(""); }} style={{ background:"none", border:"none", color:"#666", fontSize:13, cursor:"pointer", marginBottom:20, padding:0 }}>
          ← Back
        </button>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔐</div>
          <div style={{ fontWeight:700, fontSize:18, color:"#1B2B4B" }}>Owner PIN</div>
          <div style={{ fontSize:13, color:"#666", marginTop:4 }}>Enter your PIN to access the owner dashboard</div>
        </div>
        <input
          type="password" inputMode="numeric" maxLength={6}
          placeholder="Enter PIN" value={pin}
          onChange={e => { setPin(e.target.value); setPinError(""); }}
          onKeyDown={e => e.key === "Enter" && tryOwnerPin()}
          style={{ width:"100%", padding:"12px 14px", borderRadius:8, border:`1px solid ${pinError ? "#E05A5A" : "#e0e0e0"}`, fontSize:18, textAlign:"center", letterSpacing:8, boxSizing:"border-box", marginBottom:8, outline:"none" }}
          autoFocus
        />
        {pinError && <div style={{ color:"#A32D2D", fontSize:12, marginBottom:8, textAlign:"center" }}>{pinError}</div>}
        <button onClick={tryOwnerPin} style={{ width:"100%", padding:"11px", borderRadius:8, border:"none", background:"#1B2B4B", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", marginTop:4 }}>
          Unlock Owner View
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#EEF2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"48px 40px", width:380, boxShadow:"0 4px 24px rgba(0,0,0,0.10)", textAlign:"center" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:32 }}>
          {SG_LOGO}
          <div style={{ textAlign:"left" }}>
            <div style={{ fontWeight:700, fontSize:22, color:"#1B2B4B", lineHeight:1 }}>StockGuard</div>
            <div style={{ fontSize:12, color:"#888", marginTop:2 }}>Supply Chain Tracker</div>
          </div>
        </div>
        <div style={{ fontSize:15, color:"#444", marginBottom:32 }}>Who is signing in today?</div>
        <button onClick={() => setShowPin(true)} style={{ width:"100%", padding:"18px 20px", borderRadius:12, border:"2px solid #1B2B4B", background:"#1B2B4B", color:"#fff", cursor:"pointer", marginBottom:14, display:"flex", alignItems:"center", gap:16, textAlign:"left" }}>
          <span style={{ fontSize:28 }}>👔</span>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>Owner</div>
            <div style={{ fontSize:12, opacity:0.7, marginTop:2 }}>Full access — all reports, settings & tools</div>
          </div>
          <span style={{ marginLeft:"auto", fontSize:18, opacity:0.6 }}>→</span>
        </button>
        <button onClick={() => onRole("cashier")} style={{ width:"100%", padding:"18px 20px", borderRadius:12, border:"2px solid #0F6E56", background:"#0F6E56", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:16, textAlign:"left" }}>
          <span style={{ fontSize:28 }}>🧾</span>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>Cashier</div>
            <div style={{ fontSize:12, opacity:0.7, marginTop:2 }}>Sales, Receiving, Movements & Reorder alerts</div>
          </div>
          <span style={{ marginLeft:"auto", fontSize:18, opacity:0.6 }}>→</span>
        </button>
        <button onClick={onSignOut} style={{ marginTop:20, background:"none", border:"none", color:"#aaa", fontSize:12, cursor:"pointer" }}>
          Sign out
        </button>
        <div style={{ marginTop:16, fontSize:11, color:"#aaa", fontStyle:"italic" }}>
          "Commit to the Lord whatever you do"<br/>Proverbs 16:3
        </div>
      </div>
    </div>
  );
}