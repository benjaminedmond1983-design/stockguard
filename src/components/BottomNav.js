import { TAB_ICONS } from "./constants";

export default function BottomNav({ tabs, tab, setTab, lowItemsCount, showMoreMenu, setShowMoreMenu, onLogout }) {
  const BOTTOM_TABS = tabs.slice(0, 5);

  return (
    <>
      <nav className="sg-bottom-nav">
        {BOTTOM_TABS.map(t => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => { setTab(t); setShowMoreMenu(false); }}>
            <i className={`ti ${TAB_ICONS[t]}`} aria-hidden="true"/>
            <span>{t === "Reorder Center" ? "Reorder" : t === "Purchase Orders" ? "POs" : t}</span>
            {t === "Reorder Center" && lowItemsCount > 0 && (
              <span style={{ position:"absolute", top:4, background:"#E24B4A", color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:10, marginLeft:12 }}>
                {lowItemsCount}
              </span>
            )}
          </button>
        ))}
        <button className={!BOTTOM_TABS.includes(tab) && showMoreMenu ? "active" : ""} onClick={() => setShowMoreMenu(m => !m)}>
          <i className="ti ti-dots" aria-hidden="true"/>
          <span>More</span>
        </button>
      </nav>

      {showMoreMenu && (
        <div className="sg-more-menu">
          {tabs.slice(5).map(t => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => { setTab(t); setShowMoreMenu(false); }}>
              <i className={`ti ${TAB_ICONS[t]}`} style={{ fontSize:16 }} aria-hidden="true"/>
              {t}
            </button>
          ))}
          <button onClick={() => { onLogout(); setShowMoreMenu(false); }} style={{ gridColumn:"1/-1" }}>
            <i className="ti ti-logout" style={{ fontSize:16 }} aria-hidden="true"/>
            Switch Role
          </button>
        </div>
      )}
    </>
  );
}
