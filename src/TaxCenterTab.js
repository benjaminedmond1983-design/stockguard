
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
  const grossMargin = salesData.totalRevenue > 0 ? ((salesData.totalProfit / salesData.totalRevenue)*100).toFixed(1) : "0.0";

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

