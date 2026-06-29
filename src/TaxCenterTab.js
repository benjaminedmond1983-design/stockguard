
import React, { useState, useMemo } from 'react';

const C = { bg:"#ffffff", bg2:"#f5f5f5", text:"#111111", muted:"#666666", border:"#e0e0e0" };
const btn = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:6, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" });
const card = { background:"#fff", border:`1px solid ${C.border}`, borderRadius:10, padding:"20px 24px", marginBottom:16 };

export default function TaxCenterTab({ inventory, audit, pos }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [valuationMethod, setValuationMethod] = useState("weighted");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const salesData = useMemo(() => {
    const sold = (audit||[]).filter(a => a.action === "Sold");
    const byMonth = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = { revenue:0, profit:0, qty:0, count:0 };
    sold.forEach(a => {
      const d = new Date(a.time);
      if (d.getFullYear() !== selectedYear) return;
      const m = d.getMonth() + 1;
      byMonth[m].revenue += parseFloat(a.revenue||0);
      byMonth[m].profit  += parseFloat(a.profit||0);
      byMonth[m].qty     += parseInt(a.qty||0);
      byMonth[m].count   += 1;
    });
    const totalRevenue = Object.values(byMonth).reduce((s,m) => s + m.revenue, 0);
    const totalProfit  = Object.values(byMonth).reduce((s,m) => s + m.profit, 0);
    const totalQty     = Object.values(byMonth).reduce((s,m) => s + m.qty, 0);
    const totalTx      = Object.values(byMonth).reduce((s,m) => s + m.count, 0);
    return { byMonth, totalRevenue, totalProfit, totalQty, totalTx };
  }, [audit, selectedYear]);

  const inventoryData = useMemo(() => {
    const inv = inventory || [];
    const totalCostValue   = inv.reduce((s,i) => s + (i.qty * (parseFloat(i.unitCost)||0)), 0);
    const totalRetailValue = inv.reduce((s,i) => s + (i.qty * (parseFloat(i.sellingPrice)||0)), 0);
    const totalUnits       = inv.reduce((s,i) => s + (parseInt(i.qty)||0), 0);
    const skuCount         = inv.length;
    const sold = (audit||[]).filter(a => a.action === "Sold" && new Date(a.time).getFullYear() === selectedYear);
    const cogsEstimate = sold.reduce((s,a) => {
      const item = inv.find(i => i.sku === a.sku);
      return s + (item ? (parseFloat(item.unitCost)||0) * (parseInt(a.qty)||0) : 0);
    }, 0);
    const received = (audit||[]).filter(a => a.action === "Received" && new Date(a.time).getFullYear() === selectedYear);
    const totalReceived = received.reduce((s,a) => s + (parseInt(a.qty)||0), 0);
    return { totalCostValue, totalRetailValue, totalUnits, skuCount, cogsEstimate, totalReceived };
  }, [inventory, audit, selectedYear]);

  const poData = useMemo(() => {
    const allPos = pos || [];
    const yearPos = allPos.filter(p => new Date(p.date).getFullYear() === selectedYear);
    const totalSpend = yearPos.reduce((s,p) => s + ((p.qty||0)*(p.unitCost||0)), 0);
    const byVendor = {};
    yearPos.forEach(p => {
      const v = p.supplier || "Unknown";
      if (!byVendor[v]) byVendor[v] = { total:0, orders:0 };
      byVendor[v].total  += (p.qty||0)*(p.unitCost||0);
      byVendor[v].orders += 1;
    });
    const received = yearPos.filter(p => p.status === "Received").length;
    const pending  = yearPos.filter(p => p.status !== "Received").length;
    return { totalSpend, byVendor, received, pending, count: yearPos.length };
  }, [pos, selectedYear]);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDollar = (n) => `$${parseFloat(n||0).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  function downloadCSV(filename, rows, headers) {
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  function exportSalesCSV() {
    const headers = ["Month","Gross Revenue","Profit","Units Sold","Transactions"];
    const rows = MONTHS.map((m,i) => { const d = salesData.byMonth[i+1]; return [m, d.revenue.toFixed(2), d.profit.toFixed(2), d.qty, d.count]; });
    downloadCSV(`StockGuard_Sales_${selectedYear}.csv`, rows, headers);
  }
  function exportInventoryCSV() {
    const headers = ["SKU","Name","Category","Qty","Unit Cost","Selling Price","Cost Value","Retail Value","Supplier","Location"];
    const rows = (inventory||[]).map(i => [i.sku, i.name, i.category, i.qty, (i.unitCost||0).toFixed(2), (i.sellingPrice||0).toFixed(2), ((i.qty||0)*(i.unitCost||0)).toFixed(2), ((i.qty||0)*(i.sellingPrice||0)).toFixed(2), i.supplier, i.location]);
    downloadCSV(`StockGuard_Inventory_${selectedYear}.csv`, rows, headers);
  }
  function exportPOCSV() {
    const headers = ["PO Number","Item","SKU","Supplier","Qty","Unit Cost","Total","Status","Date"];
    const rows = (pos||[]).filter(p => new Date(p.date).getFullYear() === selectedYear).map(p => [p.poNumber, p.itemName||"", p.sku||"", p.supplier||"", p.qty, (p.unitCost||0).toFixed(2), ((p.qty||0)*(p.unitCost||0)).toFixed(2), p.status, p.date]);
    downloadCSV(`StockGuard_Purchases_${selectedYear}.csv`, rows, headers);
  }
  function exportCOGSCSV() {
    const inv = inventory || [];
    const sold = (audit||[]).filter(a => a.action === "Sold" && new Date(a.time).getFullYear() === selectedYear);
    const bySku = {};
    sold.forEach(a => { if (!bySku[a.sku]) bySku[a.sku] = { name: a.item, qty: 0 }; bySku[a.sku].qty += parseInt(a.qty||0); });
    const rows = Object.entries(bySku).map(([sku, d]) => { const item = inv.find(i => i.sku === sku); const cost = item ? parseFloat(item.unitCost)||0 : 0; return [sku, d.name, d.qty, cost.toFixed(2), (cost * d.qty).toFixed(2)]; });
    downloadCSV(`StockGuard_COGS_${selectedYear}.csv`, rows, ["SKU","Name","Units Sold","Unit Cost","COGS"]);
  }
  async function generatePackage() {
    setGenerating(true);
    exportSalesCSV(); await new Promise(r => setTimeout(r, 400));
    exportInventoryCSV(); await new Promise(r => setTimeout(r, 400));
    exportPOCSV(); await new Promise(r => setTimeout(r, 400));
    exportCOGSCSV();
    setGenerating(false);
  }
  async function askAI() {
    if (!aiQuestion.trim()) return;
    setAiLoading(true); setAiAnswer("");
    const context = `You are a financial assistant for StockGuard. Business data for ${selectedYear}: Revenue: $${salesData.totalRevenue.toFixed(2)}, Profit: $${salesData.totalProfit.toFixed(2)}, Transactions: ${salesData.totalTx}, Units Sold: ${salesData.totalQty}, Inventory Cost Value: $${inventoryData.totalCostValue.toFixed(2)}, Estimated COGS: $${inventoryData.cogsEstimate.toFixed(2)}, Total Purchases: $${poData.totalSpend.toFixed(2)}, POs: ${poData.count}. Monthly revenue: ${MONTHS.map((m,i)=>`${m}: $${salesData.byMonth[i+1].revenue.toFixed(0)}`).join(", ")}. Answer concisely. Do not calculate taxes.`;
    try {
      const res = await fetch("/api/analyze", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:800, messages:[{ role:"user", content: context + "\n\nQuestion: " + aiQuestion }] }) });
      const data = await res.json();
      setAiAnswer(data.content?.find(b=>b.type==="text")?.text || "No response.");
    } catch(e) { setAiAnswer("Unable to connect. Please try again."); }
    setAiLoading(false);
  }

  const sections = [
    { id:"overview",  label:"Overview",             icon:"ti-layout-dashboard" },
    { id:"sales",     label:"Sales Summary",         icon:"ti-receipt" },
    { id:"inventory", label:"Inventory Valuation",   icon:"ti-package" },
    { id:"cogs",      label:"Cost of Goods Sold",    icon:"ti-trending-down" },
    { id:"purchases", label:"Purchase Reports",      icon:"ti-file-invoice" },
    { id:"vendors",   label:"Vendor Reports",        icon:"ti-building-factory" },
    { id:"ai",        label:"AI Financial Assistant",icon:"ti-brain" },
  ];
  return (
    <div style={{ display:"flex", gap:0, minHeight:"100%" }}>
      <div style={{ width:200, minWidth:200, borderRight:`1px solid ${C.border}`, paddingTop:8, paddingRight:8, background:"#fafafa" }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.muted, padding:"8px 12px 4px", letterSpacing:"0.06em", textTransform:"uppercase" }}>Tax Center {selectedYear}</div>
        {sections.map(s => (
          <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{
            display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px",
            borderRadius:7, border:"none", cursor:"pointer", textAlign:"left", fontSize:13,
            background: activeSection===s.id ? "#E8F0FE" : "transparent",
            color: activeSection===s.id ? "#185FA5" : C.text,
            fontWeight: activeSection===s.id ? 600 : 400, marginBottom:2
          }}>
            <i className={`ti ${s.icon}`} style={{ fontSize:16, minWidth:18 }} />
            {s.label}
          </button>
        ))}
        <div style={{ margin:"16px 12px 8px", borderTop:`1px solid ${C.border}` }} />
        <div style={{ padding:"0 8px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, padding:"4px 4px 8px", letterSpacing:"0.06em", textTransform:"uppercase" }}>Tax Year</div>
          <select value={selectedYear} onChange={e=>setSelectedYear(parseInt(e.target.value))} style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:`1px solid ${C.border}`, fontSize:13, background:"#fff" }}>
            {[2026,2025,2024,2023].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={generatePackage} disabled={generating} style={{ ...btn("#1B5E20"), width:"100%", marginTop:12, padding:"10px 0", fontSize:12 }}>
            {generating ? "⏳ Generating..." : "⬇ Download All Reports"}
          </button>
          <div style={{ fontSize:10, color:C.muted, marginTop:6, textAlign:"center", lineHeight:1.5 }}>
            Downloads Sales, Inventory, COGS & Purchase CSVs
          </div>
        </div>
      </div>
      <div style={{ flex:1, padding:"24px 28px", overflowY:"auto" }}>
        {activeSection === "overview" && (<div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontWeight:700, fontSize:20, color:C.text }}>Year-End Financial Overview</div>
            <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>Accountant-ready summary for {selectedYear} · Generated by StockGuard</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:24 }}>
            {[
              { label:"Gross Revenue", value: fmtDollar(salesData.totalRevenue), color:"#185FA5" },
              { label:"Gross Profit", value: fmtDollar(salesData.totalProfit), color:"#3B6D11" },
              { label:"Gross Margin", value: grossMargin+"%", color:"#534AB7" },
              { label:"Est. COGS", value: fmtDollar(inventoryData.cogsEstimate), color:"#854F0B" },
              { label:"Total Purchases", value: fmtDollar(poData.totalSpend), color:"#0D7E6E" },
              { label:"Inventory Value (Cost)", value: fmtDollar(inventoryData.totalCostValue), color:"#A32D2D" },
            ].map(k => (
              <div key={k.label} style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 20px", borderLeft:`4px solid ${k.color}` }}>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{k.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Year-End Summary — {selectedYear}</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <tbody>
                {[
                  ["Gross Revenue", fmtDollar(salesData.totalRevenue)],
                  ["Cost of Goods Sold (est.)", fmtDollar(inventoryData.cogsEstimate)],
                  ["Gross Profit", fmtDollar(salesData.totalProfit)],
                  ["Gross Margin %", grossMargin+"%"],
                  ["Total Transactions", salesData.totalTx],
                  ["Units Sold", salesData.totalQty],
                  ["Total Purchase Orders", poData.count],
                  ["Total Purchasing Spend", fmtDollar(poData.totalSpend)],
                  ["Ending Inventory Value (Cost)", fmtDollar(inventoryData.totalCostValue)],
                  ["Ending Inventory Value (Retail)", fmtDollar(inventoryData.totalRetailValue)],
                  ["Active SKUs", inventoryData.skuCount],
                ].map(([label, value], i) => (
                  <tr key={label} style={{ background: i%2===0 ? "#fafafa" : "#fff" }}>
                    <td style={{ padding:"10px 14px", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{label}</td>
                    <td style={{ padding:"10px 14px", fontWeight:600, textAlign:"right", borderBottom:`1px solid ${C.border}` }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background:"#E8F5E9", border:"1px solid #A5D6A7", borderRadius:10, padding:"16px 20px" }}>
            <div style={{ fontWeight:600, color:"#1B5E20", marginBottom:6 }}>📋 For Your Accountant</div>
            <div style={{ fontSize:13, color:"#2E7D32", lineHeight:1.7 }}>
              Download the full report package using the button in the left panel. The package includes:<br/>
              • Sales summary by month (CSV)<br/>
              • Inventory valuation with cost & retail values (CSV)<br/>
              • Cost of Goods Sold breakdown by SKU (CSV)<br/>
              • Purchase Orders summary by vendor (CSV)
            </div>
          </div>
        </div>)}
        {activeSection === "sales" && (<div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div><div style={{ fontWeight:700, fontSize:18 }}>Sales Summary — {selectedYear}</div></div>
            <button onClick={exportSalesCSV} style={btn("#185FA5")}>⬇ Export CSV</button>
          </div>
          <div style={card}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead><tr style={{ borderBottom:`2px solid ${C.border}` }}>
                {["Month","Gross Revenue","Gross Profit","Margin %","Units Sold","Transactions"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign: h==="Month"?"left":"right", color:C.muted, fontWeight:600, fontSize:12 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => {
                  const d = salesData.byMonth[i+1];
                  const margin = d.revenue > 0 ? ((d.profit/d.revenue)*100).toFixed(1) : "—";
                  return (<tr key={m} style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0?"#fafafa":"#fff" }}>
                    <td style={{ padding:"10px 12px", fontWeight:500 }}>{m} {selectedYear}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right", color: d.revenue>0?"#185FA5":C.muted }}>{d.revenue>0?fmtDollar(d.revenue):"—"}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right", color: d.profit>0?"#3B6D11":C.muted }}>{d.profit>0?fmtDollar(d.profit):"—"}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right" }}>{margin !== "—" ? margin+"%" : "—"}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right" }}>{d.qty>0?d.qty:"—"}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right" }}>{d.count>0?d.count:"—"}</td>
                  </tr>);
                })}
                <tr style={{ borderTop:`2px solid ${C.border}`, background:"#f0f4ff" }}>
                  <td style={{ padding:"12px", fontWeight:700 }}>TOTAL</td>
                  <td style={{ padding:"12px", textAlign:"right", fontWeight:700, color:"#185FA5" }}>{fmtDollar(salesData.totalRevenue)}</td>
                  <td style={{ padding:"12px", textAlign:"right", fontWeight:700, color:"#3B6D11" }}>{fmtDollar(salesData.totalProfit)}</td>
                  <td style={{ padding:"12px", textAlign:"right", fontWeight:700 }}>{grossMargin}%</td>
                  <td style={{ padding:"12px", textAlign:"right", fontWeight:700 }}>{salesData.totalQty}</td>
                  <td style={{ padding:"12px", textAlign:"right", fontWeight:700 }}>{salesData.totalTx}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>)}
        {activeSection === "inventory" && (<div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div><div style={{ fontWeight:700, fontSize:18 }}>Inventory Valuation — {selectedYear}</div></div>
            <button onClick={exportInventoryCSV} style={btn("#185FA5")}>⬇ Export CSV</button>
          </div>
          <div style={card}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead><tr style={{ borderBottom:`2px solid ${C.border}` }}>
                {["SKU","Product","Qty","Unit Cost","Cost Value","Retail Value","Supplier"].map(h => (
                  <th key={h} style={{ padding:"8px 10px", textAlign:["SKU","Product","Supplier"].includes(h)?"left":"right", color:C.muted, fontWeight:600, fontSize:11 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(inventory||[]).map((item,i) => {
                  const costVal = (item.qty||0)*(parseFloat(item.unitCost)||0);
                  const retailVal = (item.qty||0)*(parseFloat(item.sellingPrice)||0);
                  return (<tr key={item.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?"#fafafa":"#fff" }}>
                    <td style={{ padding:"8px 10px", fontFamily:"monospace", fontSize:12 }}>{item.sku}</td>
                    <td style={{ padding:"8px 10px", fontWeight:500 }}>{item.name}</td>
                    <td style={{ padding:"8px 10px", textAlign:"right" }}>{item.qty}</td>
                    <td style={{ padding:"8px 10px", textAlign:"right" }}>{fmtDollar(item.unitCost)}</td>
                    <td style={{ padding:"8px 10px", textAlign:"right", color:"#854F0B", fontWeight:600 }}>{fmtDollar(costVal)}</td>
                    <td style={{ padding:"8px 10px", textAlign:"right", color:"#3B6D11", fontWeight:600 }}>{fmtDollar(retailVal)}</td>
                    <td style={{ padding:"8px 10px", color:C.muted }}>{item.supplier}</td>
                  </tr>);
                })}
                <tr style={{ borderTop:`2px solid ${C.border}`, background:"#f0f4ff" }}>
                  <td colSpan={4} style={{ padding:"10px", fontWeight:700 }}>TOTAL</td>
                  <td style={{ padding:"10px", textAlign:"right", fontWeight:700, color:"#854F0B" }}>{fmtDollar(inventoryData.totalCostValue)}</td>
                  <td style={{ padding:"10px", textAlign:"right", fontWeight:700, color:"#3B6D11" }}>{fmtDollar(inventoryData.totalRetailValue)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>)}
        {activeSection === "cogs" && (<div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div><div style={{ fontWeight:700, fontSize:18 }}>Cost of Goods Sold — {selectedYear}</div></div>
            <button onClick={exportCOGSCSV} style={btn("#185FA5")}>⬇ Export CSV</button>
          </div>
          <div style={{ background:"#E8F5E9", border:"1px solid #A5D6A7", borderRadius:10, padding:"16px 20px", marginBottom:20 }}>
            <div style={{ fontWeight:600, color:"#1B5E20", marginBottom:4 }}>Estimated COGS for {selectedYear}</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#1B5E20" }}>{fmtDollar(inventoryData.cogsEstimate)}</div>
          </div>
          <div style={card}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead><tr style={{ borderBottom:`2px solid ${C.border}` }}>
                {["SKU","Product","Units Sold","Unit Cost","COGS"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:["SKU","Product"].includes(h)?"left":"right", color:C.muted, fontWeight:600, fontSize:12 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(() => {
                  const inv = inventory||[];
                  const sold = (audit||[]).filter(a=>a.action==="Sold"&&new Date(a.time).getFullYear()===selectedYear);
                  const bySku={};
                  sold.forEach(a=>{if(!bySku[a.sku])bySku[a.sku]={name:a.item,qty:0};bySku[a.sku].qty+=parseInt(a.qty||0);});
                  const rows=Object.entries(bySku).map(([sku,d])=>{const item=inv.find(i=>i.sku===sku);const cost=item?parseFloat(item.unitCost)||0:0;return{sku,name:d.name,qty:d.qty,cost,cogs:cost*d.qty};}).sort((a,b)=>b.cogs-a.cogs);
                  if(rows.length===0)return <tr><td colSpan={5} style={{padding:24,textAlign:"center",color:C.muted}}>No sales for {selectedYear}</td></tr>;
                  return rows.map((r,i)=>(<tr key={r.sku} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fafafa":"#fff"}}>
                    <td style={{padding:"10px 12px",fontFamily:"monospace",fontSize:12}}>{r.sku}</td>
                    <td style={{padding:"10px 12px",fontWeight:500}}>{r.name}</td>
                    <td style={{padding:"10px 12px",textAlign:"right"}}>{r.qty}</td>
                    <td style={{padding:"10px 12px",textAlign:"right"}}>{fmtDollar(r.cost)}</td>
                    <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:"#854F0B"}}>{fmtDollar(r.cogs)}</td>
                  </tr>));
                })()}
              </tbody>
            </table>
          </div>
        </div>)}
        {activeSection === "purchases" && (<div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div><div style={{ fontWeight:700, fontSize:18 }}>Purchase Reports — {selectedYear}</div></div>
            <button onClick={exportPOCSV} style={btn("#185FA5")}>⬇ Export CSV</button>
          </div>
          <div style={card}>
            {(pos||[]).filter(p=>new Date(p.date).getFullYear()===selectedYear).length===0
              ? <div style={{color:C.muted,fontSize:13,padding:"20px 0",textAlign:"center"}}>No purchase orders for {selectedYear}</div>
              : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>
                    {["PO #","Item","Supplier","Qty","Unit Cost","Total","Status","Date"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:["Qty","Unit Cost","Total"].includes(h)?"right":"left",color:C.muted,fontWeight:600,fontSize:11}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {(pos||[]).filter(p=>new Date(p.date).getFullYear()===selectedYear).map((p,i)=>{
                      const total=(p.qty||0)*(p.unitCost||0);
                      const sc={Received:"#3B6D11",Sent:"#185FA5",Draft:"#854F0B"};
                      const sb={Received:"#EAF3DE",Sent:"#E6F1FB",Draft:"#FAEEDA"};
                      return(<tr key={p.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fafafa":"#fff"}}>
                        <td style={{padding:"8px 10px",fontFamily:"monospace",fontSize:12}}>{p.poNumber}</td>
                        <td style={{padding:"8px 10px",fontWeight:500}}>{p.itemName||"—"}</td>
                        <td style={{padding:"8px 10px"}}>{p.supplier||"—"}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>{p.qty}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>{fmtDollar(p.unitCost)}</td>
                        <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600}}>{fmtDollar(total)}</td>
                        <td style={{padding:"8px 10px"}}><span style={{background:sb[p.status]||"#eee",color:sc[p.status]||"#888",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700}}>{p.status}</span></td>
                        <td style={{padding:"8px 10px",color:C.muted}}>{p.date}</td>
                      </tr>);
                    })}
                  </tbody>
                </table>
            }
          </div>
        </div>)}
        {activeSection === "vendors" && (<div>
          <div style={{ marginBottom:20 }}><div style={{ fontWeight:700, fontSize:18 }}>Vendor Reports — {selectedYear}</div></div>
          <div style={card}>
            {Object.keys(poData.byVendor).length===0
              ? <div style={{color:C.muted,padding:20,textAlign:"center"}}>No purchase orders for {selectedYear}</div>
              : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>
                    {["Vendor","Orders","Total Spend","% of Spend"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:h==="Vendor"?"left":"right",color:C.muted,fontWeight:600,fontSize:12}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {Object.entries(poData.byVendor).sort((a,b)=>b[1].total-a[1].total).map(([vendor,d],i)=>(
                      <tr key={vendor} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fafafa":"#fff"}}>
                        <td style={{padding:"10px 12px",fontWeight:600}}>{vendor}</td>
                        <td style={{padding:"10px 12px",textAlign:"right"}}>{d.orders}</td>
                        <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:"#185FA5"}}>{fmtDollar(d.total)}</td>
                        <td style={{padding:"10px 12px",textAlign:"right",color:C.muted}}>{poData.totalSpend>0?(d.total/poData.totalSpend*100).toFixed(1)+"%":"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>)}
        {activeSection === "ai" && (<div>
          <div style={{ marginBottom:20 }}><div style={{ fontWeight:700, fontSize:18 }}>AI Financial Assistant</div></div>
          <div style={card}>
            <div style={{ fontWeight:600, marginBottom:10 }}>Ask a question about your {selectedYear} financials</div>
            <textarea value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)}
              placeholder="e.g. Which products generated the highest profit? Which vendors had the highest spending?"
              style={{ width:"100%", padding:"12px 14px", borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, resize:"vertical", minHeight:80, fontFamily:"inherit", boxSizing:"border-box" }}
            />
            <button onClick={askAI} disabled={aiLoading||!aiQuestion.trim()} style={{ ...btn("#1B5E20"), marginTop:10, opacity:(aiLoading||!aiQuestion.trim())?0.6:1 }}>
              {aiLoading ? "Analyzing..." : "Ask AI"}
            </button>
            {aiAnswer && (
              <div style={{ background:"#F1F8E9", border:"1px solid #AED581", borderRadius:8, padding:"16px 18px", marginTop:12 }}>
                <div style={{ fontWeight:600, color:"#33691E", marginBottom:8, fontSize:12 }}>AI RESPONSE</div>
                <div style={{ fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{aiAnswer}</div>
              </div>
            )}
          </div>
          <div style={{ ...card, background:"#fafafa" }}>
            <div style={{ fontWeight:600, marginBottom:10 }}>Suggested Questions</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {["Which products generated the highest profit?","Which vendors had the highest spending?","What was my best sales month?","What is my estimated COGS?","Summarize my year-end financial position","What should I watch out for at tax time?"].map(q=>(
                <button key={q} onClick={()=>setAiQuestion(q)} style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:20, padding:"6px 14px", fontSize:12, cursor:"pointer", color:C.text }}>{q}</button>
              ))}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  );
}

