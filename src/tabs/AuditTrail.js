import { C } from "../components/constants";

export default function AuditTrail({ audit, onExportCSV }) {
  const aColor = {
    Received:"#185FA5", Sold:"#A32D2D", Moved:"#0F6E56",
    Reordered:"#854F0B", Import:"#534AB7", Edited:"#185FA5",
    Deleted:"#A32D2D", Alert:"#854F0B", Automation:"#7B3FA0"
  };
  const aBg = {
    Received:"#E6F1FB", Sold:"#FCEBEB", Moved:"#E1F5EE",
    Reordered:"#FAEEDA", Import:"#EDE9FB", Edited:"#E6F1FB",
    Deleted:"#FCEBEB", Alert:"#FAEEDA", Automation:"#F4EBF9"
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontWeight:500 }}>Full inventory activity log</div>
        <button
          onClick={() => onExportCSV("audit")}
          style={{ padding:"6px 14px", borderRadius:6, border:"none", background:"#534AB7", color:"#fff", fontSize:12, cursor:"pointer", fontWeight:500 }}
        >
          ⬇ Export CSV
        </button>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["Time","Action","Item","Qty","Revenue","Profit","User","Reference"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"6px 8px", fontWeight:500, color:C.muted, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map(a => (
              <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                <td style={{ padding:"7px 8px", color:C.muted, whiteSpace:"nowrap" }}>{a.time}</td>
                <td style={{ padding:"7px 8px" }}>
                  <span style={{ background:aBg[a.action]||"#eee", color:aColor[a.action]||"#888", padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:600 }}>
                    {a.action}
                  </span>
                </td>
                <td style={{ padding:"7px 8px", fontWeight:500 }}>{a.item}</td>
                <td style={{ padding:"7px 8px" }}>{a.qty}</td>
                <td style={{ padding:"7px 8px", color:"#185FA5", fontWeight:600 }}>{a.revenue > 0 ? `$${a.revenue.toFixed(2)}` : "—"}</td>
                <td style={{ padding:"7px 8px", color:"#3B6D11", fontWeight:600 }}>{a.profit > 0 ? `$${a.profit.toFixed(2)}` : "—"}</td>
                <td style={{ padding:"7px 8px", color:C.muted }}>{a.user}</td>
                <td style={{ padding:"7px 8px", color:C.muted }}>{a.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}