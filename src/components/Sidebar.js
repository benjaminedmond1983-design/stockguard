import { TAB_ICONS, SIDEBAR_W } from "./constants";

export default function Sidebar({ tabs, tab, setTab, isOwner, onLogout, lowItemsCount }) {
  return (
    <div className="sg-sidebar" style={{
      width: SIDEBAR_W, minWidth: SIDEBAR_W, background: "#1B2B4B",
      display: "flex", flexDirection: "column", position: "fixed",
      top: 0, left: 0, height: "100vh", zIndex: 100, overflowY: "hidden"
    }}>
        <div style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", textAlign:"center" }}>
          <img src={require('../assets/logo-sidebar.png')} alt="StockGuard" style={{width:'160px', display:'block', margin:'0 auto', opacity:'1'}} />
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

      <div style={{ padding:"8px 16px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
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