import { TAB_ICONS, SIDEBAR_W } from "./constants";

export default function Sidebar({ tabs, tab, setTab, isOwner, onLogout, lowItemsCount }) {
  return (
    <div className="sg-sidebar" style={{
      width: SIDEBAR_W, minWidth: SIDEBAR_W, background: "#1B2B4B",
      display: "flex", flexDirection: "column", position: "fixed",
      top: 0, left: 0, height: "100vh", zIndex: 100, overflowY: "auto"
    }}>
      <div style={{ padding:"24px 16px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
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
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:16, lineHeight:1 }}>StockGuard</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, marginTop:3 }}>
              {isOwner ? "Owner View" : "Cashier View"}
            </div>
          </div>
        </div>
        <div style={{
          marginTop:10, display:"inline-flex", alignItems:"center", gap:6,
          background: isOwner ? "rgba(255,255,255,0.1)" : "rgba(15,110,86,0.4)",
          borderRadius:8, padding:"4px 10px"
        }}>
          <span style={{ fontSize:12 }}>{isOwner ? "👔" : "🧾"}</span>
          <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{isOwner ? "Owner" : "Cashier"}</span>
        </div>
      </div>

      <nav style={{ flex:1, padding:"12px 8px" }}>
        {tabs.map(t => {
          const active = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              display:"flex", alignItems:"center", gap:10, width:"100%",
              padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer",
              background: active ? "rgba(255,255,255,0.15)" : "transparent",
              color: active ? "#fff" : "rgba(255,255,255,0.6)",
              fontSize:13, fontWeight: active ? 600 : 400, marginBottom:2, textAlign:"left"
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#fff"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}}
            >
              <i className={`ti ${TAB_ICONS[t]}`} style={{ fontSize:18, minWidth:18 }} aria-hidden="true"/>
              <span>{t}</span>
              {t === "Reorder Center" && lowItemsCount > 0 && (
                <span style={{ marginLeft:"auto", background:"#E24B4A", color:"#fff", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10 }}>
                  {lowItemsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"16px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onLogout} style={{
          width:"100%", padding:"8px", borderRadius:8,
          border:"1px solid rgba(255,255,255,0.2)", background:"transparent",
          color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", marginBottom:12
        }}>🔄 Switch Role</button>
        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, textAlign:"center", lineHeight:1.5, fontStyle:"italic" }}>
          "Commit to the Lord whatever you do"<br/>Proverbs 16:3
        </div>
      </div>
    </div>
  );
}