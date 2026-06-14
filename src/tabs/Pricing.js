import { useState } from "react";
import { PLANS, C } from "../components/constants";

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:6 }}>
        <p style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Choose the plan that fits your store</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:28 }}>
        <span style={{ fontSize:13, color:annual ? C.muted : C.text, fontWeight:annual ? 400 : 600 }}>Monthly</span>
        <div
          onClick={() => setAnnual(a => !a)}
          style={{ position:"relative", width:40, height:22, cursor:"pointer", background:annual ? "#185FA5" : C.border, borderRadius:22, transition:".2s" }}
        >
          <div style={{ position:"absolute", width:16, height:16, left:annual ? 21 : 3, top:3, background:"#fff", borderRadius:"50%", transition:".2s" }}/>
        </div>
        <span style={{ fontSize:13, color:annual ? C.text : C.muted, fontWeight:annual ? 600 : 400 }}>Annual</span>
        <span style={{ fontSize:11, background:"#EAF3DE", color:"#3B6D11", padding:"2px 8px", borderRadius:10, fontWeight:700, border:"1px solid #6BAD2E" }}>Save 20%</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:14 }}>
        {PLANS.map((pl, i) => {
          const p = annual ? pl.ap : pl.price;
          const saving = annual && pl.price > 0 ? `Save $${(pl.price - pl.ap) * 12}/yr` : "";
          return (
            <div key={i} style={{
              background: C.bg,
              border: pl.featured ? `2px solid ${pl.color}` : `1px solid ${C.border}`,
              borderRadius:14, padding:20, display:"flex", flexDirection:"column"
            }}>
              {pl.badge
                ? <span style={{ display:"inline-block", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, background:pl.badgeBg, color:pl.badgeColor, marginBottom:10, alignSelf:"flex-start" }}>{pl.badge}</span>
                : <div style={{ height:24 }}/>
              }
              <div style={{ fontWeight:600, fontSize:15, color:pl.color, marginBottom:4 }}>{pl.name}</div>
              <div style={{ fontSize:34, fontWeight:600, lineHeight:1, color:pl.color, marginBottom:4 }}>
                {p === 0 ? "Free" : `$${p}`}
                {p > 0 && <span style={{ fontSize:13, fontWeight:400, color:C.muted }}>/mo</span>}
              </div>
              <div style={{ fontSize:11, color:"#3B6D11", marginBottom:14, minHeight:16 }}>{saving}</div>
              <button style={{ display:"block", width:"100%", padding:10, borderRadius:8, border:"none", background:pl.color, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:16 }}>
                {pl.cta}
              </button>
              {pl.inc.map((f, j) => (
                <div key={j} style={{ display:"flex", gap:6, fontSize:12, padding:"3px 0", color:C.text }}>
                  <span style={{ color:pl.color, fontWeight:700 }}>✓</span>{f}
                </div>
              ))}
              {pl.exc.map((f, j) => (
                <div key={j} style={{ display:"flex", gap:6, fontSize:12, padding:"3px 0", color:C.muted }}>
                  <span>✕</span>{f}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}