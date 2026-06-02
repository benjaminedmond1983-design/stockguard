// ╔══════════════════════════════════════════════════════════════════╗
// ║  StockGuard — Supply Chain Inventory Tracker                     ║
// ║  Full deployable React component v5 + Daily Sales Summary       ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useState } from "react";

const TABS = [
  "Dashboard", "Receiving", "Movements", "Sales",
  "Reorder Center", "Purchase Orders", "Audit Trail", "Business Insights", "Import Products", "Pricing"
];

const INIT_INVENTORY = [
  { id: 1, sku: "SKU-001", name: "Blue Denim Jeans",   category: "Apparel",     qty: 8,  minQty: 15, supplier: "DenimCo",     unitCost: 24.5,  sellingPrice: 59.99, location: "Aisle A1" },
  { id: 2, sku: "SKU-002", name: "White Sneakers",     category: "Footwear",    qty: 22, minQty: 10, supplier: "SoleSupply",   unitCost: 38.0,  sellingPrice: 89.99, location: "Aisle B2" },
  { id: 3, sku: "SKU-003", name: "Wireless Earbuds",   category: "Electronics", qty: 5,  minQty: 20, supplier: "TechGear Inc", unitCost: 55.0,  sellingPrice: 99.99, location: "Aisle C1" },
  { id: 4, sku: "SKU-004", name: "Cotton T-Shirt",     category: "Apparel",     qty: 3,  minQty: 25, supplier: "FabricWorld",  unitCost: 9.0,   sellingPrice: 24.99, location: "Aisle A2" },
  { id: 5, sku: "SKU-005", name: "Leather Wallet",     category: "Accessories", qty: 18, minQty: 10, supplier: "LeatherCraft", unitCost: 17.5,  sellingPrice: 44.99, location: "Aisle D1" },
  { id: 6, sku: "SKU-006", name: "Running Shorts",     category: "Apparel",     qty: 6,  minQty: 20, supplier: "FabricWorld",  unitCost: 12.0,  sellingPrice: 34.99, location: "Aisle A3" },
  { id: 7, sku: "SKU-007", name: "USB-C Cable",        category: "Electronics", qty: 45, minQty: 30, supplier: "TechGear Inc", unitCost: 5.5,   sellingPrice: 14.99, location: "Aisle C2" },
  { id: 8, sku: "SKU-008", name: "Baseball Cap",       category: "Accessories", qty: 2,  minQty: 12, supplier: "CapMakers",    unitCost: 8.0,   sellingPrice: 24.99, location: "Aisle D2" },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function shortDate(dateString) {
  const [,, day] = dateString.split("-");
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday:"short" }) + " " + parseInt(day);
}

// Seed some historical sales in the audit log for demo purposes
function buildInitAudit(inventory) {
  const entries = [
    { id: 1, time: `${dateStr(6)} 09:12`, action: "Received", item: "Blue Denim Jeans",  qty: 20, user: "Maria L.", note: "PO-2201", sku: "SKU-001", revenue: 0,     profit: 0 },
    { id: 2, time: `${dateStr(6)} 10:45`, action: "Sold",     item: "Wireless Earbuds",  qty: 3,  user: "James K.", note: "INV-5541", sku: "SKU-003", revenue: 299.97, profit: 134.97 },
    { id: 3, time: `${dateStr(5)} 11:20`, action: "Sold",     item: "White Sneakers",    qty: 2,  user: "Staff",    note: "INV-5542", sku: "SKU-002", revenue: 179.98, profit: 103.98 },
    { id: 4, time: `${dateStr(5)} 14:30`, action: "Sold",     item: "Cotton T-Shirt",    qty: 4,  user: "Staff",    note: "INV-5543", sku: "SKU-004", revenue: 99.96,  profit: 63.96 },
    { id: 5, time: `${dateStr(4)} 09:00`, action: "Sold",     item: "Leather Wallet",    qty: 3,  user: "Maria L.", note: "INV-5544", sku: "SKU-005", revenue: 134.97, profit: 82.47 },
    { id: 6, time: `${dateStr(4)} 15:10`, action: "Sold",     item: "USB-C Cable",       qty: 6,  user: "Staff",    note: "INV-5545", sku: "SKU-007", revenue: 89.94,  profit: 56.94 },
    { id: 7, time: `${dateStr(3)} 10:00`, action: "Sold",     item: "Blue Denim Jeans",  qty: 2,  user: "James K.", note: "INV-5546", sku: "SKU-001", revenue: 119.98, profit: 70.98 },
    { id: 8, time: `${dateStr(3)} 13:45`, action: "Sold",     item: "Baseball Cap",      qty: 5,  user: "Staff",    note: "INV-5547", sku: "SKU-008", revenue: 124.95, profit: 84.95 },
    { id: 9, time: `${dateStr(2)} 09:30`, action: "Sold",     item: "Running Shorts",    qty: 3,  user: "Maria L.", note: "INV-5548", sku: "SKU-006", revenue: 104.97, profit: 68.97 },
    { id:10, time: `${dateStr(2)} 14:00`, action: "Sold",     item: "White Sneakers",    qty: 1,  user: "Staff",    note: "INV-5549", sku: "SKU-002", revenue: 89.99,  profit: 51.99 },
    { id:11, time: `${dateStr(1)} 10:15`, action: "Sold",     item: "Wireless Earbuds",  qty: 2,  user: "James K.", note: "INV-5550", sku: "SKU-003", revenue: 199.98, profit: 89.98 },
    { id:12, time: `${dateStr(1)} 16:00`, action: "Sold",     item: "USB-C Cable",       qty: 8,  user: "Staff",    note: "INV-5551", sku: "SKU-007", revenue: 119.92, profit: 75.92 },
    { id:13, time: `${dateStr(0)} 09:00`, action: "Sold",     item: "Blue Denim Jeans",  qty: 1,  user: "Maria L.", note: "INV-5552", sku: "SKU-001", revenue: 59.99,  profit: 35.49 },
    { id:14, time: `${dateStr(0)} 11:30`, action: "Sold",     item: "Leather Wallet",    qty: 2,  user: "Staff",    note: "INV-5553", sku: "SKU-005", revenue: 89.98,  profit: 54.98 },
    { id:15, time: `${dateStr(0)} 14:20`, action: "Reordered",item: "Baseball Cap",      qty: 50, user: "Maria L.", note: "PO-2205 sent", sku: "", revenue: 0, profit: 0 },
  ];
  return entries;
}

const CSV_TEMPLATE = `SKU,Name,Category,Qty,MinQty,Supplier,UnitCost,SellingPrice,Location\nSKU-101,Sample Product,Apparel,50,10,My Supplier,19.99,49.99,Aisle A1`;

const PLANS = [
  {
    name:"Starter", color:"#185FA5", price:0, ap:0, cta:"Start for free", badge:null,
    inc:["Up to 25 SKUs","1 user account","Receiving and sales log","Low stock alerts","CSV import"],
    exc:["Profit margin tracking","CSV export","AI reorder analysis","Daily sales summary","Business Insights (SWOT, Porter's, Money Strategies)","Shopify integration"]
  },
  {
    name:"Growth", color:"#3B6D11", price:29, ap:23, cta:"Start 14-Day Free Trial",
    badge:"Most popular", badgeBg:"#EAF3DE", badgeColor:"#3B6D11", featured:true,
    inc:["Up to 500 SKUs","3 users","Everything in Starter","Profit margin tracking","CSV export","AI reorder analysis","Daily sales summary + 7-day chart"],
    exc:["Business Insights (SWOT, Porter's, Money Strategies)","Priority support","Custom branding","Shopify integration"]
  },
  {
    name:"Pro", color:"#534AB7", price:79, ap:63, cta:"Start 14-Day Free Trial",
    badge:"Best value", badgeBg:"#EEEDFE", badgeColor:"#534AB7",
    inc:["Unlimited SKUs","10 users","Everything in Growth","Business Insights (SWOT, Porter's, Money Strategies)","Shopify integration","Priority support","Custom branding"],
    exc:[]
  },
];

function statusBadge(qty,min) {
  if (qty===0)        return {label:"Out of stock",bg:"#FCEBEB",color:"#A32D2D"};
  if (qty<min*0.3)    return {label:"Critical",    bg:"#FCEBEB",color:"#A32D2D"};
  if (qty<min)        return {label:"Low",         bg:"#FAEEDA",color:"#854F0B"};
  return                     {label:"OK",          bg:"#EAF3DE",color:"#3B6D11"};
}

function marginBadge(cost,sell) {
  if (!sell||sell<=cost) return {label:"No margin",pct:0,profit:0,bg:"#F5F5F5",color:"#888"};
  const profit=sell-cost, pct=(profit/sell)*100;
  if (pct>=40) return {label:`${pct.toFixed(0)}%`,pct,profit,bg:"#EAF3DE",color:"#3B6D11"};
  if (pct>=20) return {label:`${pct.toFixed(0)}%`,pct,profit,bg:"#FAEEDA",color:"#854F0B"};
  return              {label:`${pct.toFixed(0)}%`,pct,profit,bg:"#FCEBEB",color:"#A32D2D"};
}

function parseRows(rows) {
  const errors=[];
  const parsed=rows.map((r,i)=>{
    const sku=(r.sku||r.SKU||"").toString().trim();
    const name=(r.name||r.Name||r["Item Name"]||r["Product Name"]||r["item"]||"").toString().trim();
    const qty=parseInt(r.qty||r.Qty||r.Quantity||r.quantity||0);
    const minQty=parseInt(r.minQty||r["Min Qty"]||r["min qty"]||r.minimum||10);
    const unitCost=parseFloat(r.unitCost||r["Unit Cost"]||r.cost||r.Cost||r.price||r.Price||0);
    const sellingPrice=parseFloat(r.sellingPrice||r["Selling Price"]||r.sell||r.Sell||r.retail||0);
    if (!sku)  errors.push(`Row ${i+1}: Missing SKU`);
    if (!name) errors.push(`Row ${i+1}: Missing item name`);
    return { sku,name, category:(r.category||r.Category||"General").toString().trim(), qty:isNaN(qty)?0:qty, minQty:isNaN(minQty)?10:minQty, supplier:(r.supplier||r.Supplier||"—").toString().trim(), unitCost:isNaN(unitCost)?0:unitCost, sellingPrice:isNaN(sellingPrice)?0:sellingPrice, location:(r.location||r.Location||"—").toString().trim() };
  }).filter(r=>r.sku&&r.name);
  return {parsed,errors};
}

function nowStr() {
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function App() {
  const [tab,       setTab]       = useState("Dashboard");
  const [inventory, setInventory] = useState(INIT_INVENTORY);
  const [audit,     setAudit]     = useState(() => buildInitAudit(INIT_INVENTORY));
  const [reorders,  setReorders]  = useState([]);
  const [search,    setSearch]    = useState("");
  const [annual,    setAnnual]    = useState(false);

  const [editId,          setEditId]          = useState(null);
  const [editForm,        setEditForm]        = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const emptyRec  = {sku:"",name:"",category:"",qty:"",supplier:"",unitCost:"",sellingPrice:"",location:"",po:""};
  const emptySale = {sku:"",qty:"",invoice:""};
  const emptyMove = {sku:"",qty:"",from:"",to:""};
  const [recForm,  setRecForm]  = useState(emptyRec);
  const [saleForm, setSaleForm] = useState(emptySale);
  const [moveForm, setMoveForm] = useState(emptyMove);

  const [pos, setPOs] = useState([]);
  const [editPOId, setEditPOId] = useState(null);
  const [editPOForm, setEditPOForm] = useState({});
  const [poCounter, setPOCounter] = useState(1);

  const [aiLoading, setAiloading] = useState(false); 
  const [aiAnalysis,     setAiAnalysis]     = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [swotData,       setSwotData]       = useState(null);
  const [porterData,     setPorterData]     = useState(null);
  const [moneyData,      setMoneyData]      = useState(null);
  const [insightTab,     setInsightTab]     = useState("SWOT");
  const [industry,       setIndustry]       = useState("retail clothing and accessories");

  const [importTab,     setImportTab]     = useState("csv");
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors,  setImportErrors]  = useState([]);
  const [importStatus,  setImportStatus]  = useState("");
  const [pasteText,     setPasteText]     = useState("");
  const [manualRows,    setManualRows]    = useState([emptyRec]);
  const [mergeStats,    setMergeStats]    = useState(null);

  // ── Sales analytics ──
  const today = todayStr();
  const yesterday = dateStr(1);

  const salesByDay = {};
  for (let i=6; i>=0; i--) {
    const d = dateStr(i);
    salesByDay[d] = {revenue:0, profit:0, units:0, transactions:0};
  }

  audit.filter(a=>a.action==="Sold").forEach(a => {
    const day = a.time.slice(0,10);
    if (salesByDay[day]) {
      salesByDay[day].revenue     += a.revenue||0;
      salesByDay[day].profit      += a.profit||0;
      salesByDay[day].units       += a.qty||0;
      salesByDay[day].transactions++;
    }
  });

  const todaySales     = salesByDay[today]     || {revenue:0,profit:0,units:0,transactions:0};
  const yesterdaySales = salesByDay[yesterday] || {revenue:0,profit:0,units:0,transactions:0};
  const revenueUp      = todaySales.revenue >= yesterdaySales.revenue;

  // Top selling item today
  const todayItemQty = {};
  audit.filter(a=>a.action==="Sold"&&a.time.startsWith(today)).forEach(a=>{
    todayItemQty[a.item] = (todayItemQty[a.item]||0)+a.qty;
  });
  const topItem = Object.entries(todayItemQty).sort((a,b)=>b[1]-a[1])[0];

  const maxRevenue = Math.max(...Object.values(salesByDay).map(d=>d.revenue), 1);

  const lowItems    = inventory.filter(i=>i.qty<i.minQty);
  const outItems    = inventory.filter(i=>i.qty===0);
  const totalValue  = inventory.reduce((s,i)=>s+i.qty*i.unitCost,0);
  const totalRetail = inventory.reduce((s,i)=>s+i.qty*(i.sellingPrice||0),0);
  const marginsWithPrice = inventory.filter(i=>i.sellingPrice>i.unitCost);
  const avgMargin   = marginsWithPrice.length ? marginsWithPrice.reduce((s,i)=>s+((i.sellingPrice-i.unitCost)/i.sellingPrice)*100,0)/marginsWithPrice.length : 0;

  const filteredInv = inventory.filter(i=>
    i.name.toLowerCase().includes(search.toLowerCase())||
    i.sku.toLowerCase().includes(search.toLowerCase())||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const addLog = (action,item,qty,user,note,extra={}) =>
    setAudit(a=>[{id:Date.now(),time:nowStr(),action,item,qty,user:user||"Staff",note,...extra},...a]);

  function startEdit(item) { setEditId(item.id); setEditForm({...item}); setDeleteConfirmId(null); }
  function cancelEdit()    { setEditId(null); setEditForm({}); }
  function saveEdit() {
    const updated={...editForm,qty:parseInt(editForm.qty)||0,minQty:parseInt(editForm.minQty)||0,unitCost:parseFloat(editForm.unitCost)||0,sellingPrice:parseFloat(editForm.sellingPrice)||0};
    setInventory(inv=>inv.map(i=>i.id===editId?updated:i));
    addLog("Edited",updated.name,updated.qty,"Staff","Item details updated");
    cancelEdit();
  }
  function confirmDelete(id) { setDeleteConfirmId(id); setEditId(null); }
  function doDelete(item)    { setInventory(inv=>inv.filter(i=>i.id!==item.id)); addLog("Deleted",item.name,item.qty,"Staff",`SKU ${item.sku} removed`); setDeleteConfirmId(null); }

  function handleReceive() {
    const qty=parseInt(recForm.qty);
    if (!recForm.sku||!recForm.name||!qty) return;
    setInventory(inv=>inv.find(i=>i.sku===recForm.sku)?inv.map(i=>i.sku===recForm.sku?{...i,qty:i.qty+qty}:i):[...inv,{id:Date.now(),sku:recForm.sku,name:recForm.name,category:recForm.category||"General",qty,minQty:10,supplier:recForm.supplier,unitCost:parseFloat(recForm.unitCost)||0,sellingPrice:parseFloat(recForm.sellingPrice)||0,location:recForm.location}]);
    addLog("Received",recForm.name,qty,"Staff",recForm.po||"—");
    setRecForm(emptyRec);
  }

  function handleSale() {
    const qty=parseInt(saleForm.qty);
    const item=inventory.find(i=>i.sku===saleForm.sku);
    if (!item||!qty||qty>item.qty) return;
    const revenue=(item.sellingPrice||0)*qty;
    const profit=((item.sellingPrice||0)-item.unitCost)*qty;
    setInventory(inv=>inv.map(i=>i.sku===saleForm.sku?{...i,qty:i.qty-qty}:i));
    addLog("Sold",item.name,qty,"Staff",saleForm.invoice||"—",{sku:item.sku,revenue,profit});
    setSaleForm(emptySale);
  }

  function handleMove() {
    const qty=parseInt(moveForm.qty);
    const item=inventory.find(i=>i.sku===moveForm.sku);
    if (!item||!qty) return;
    setInventory(inv=>inv.map(i=>i.sku===moveForm.sku?{...i,location:moveForm.to||i.location}:i));
    addLog("Moved",item.name,qty,"Staff",`${moveForm.from||"—"} to ${moveForm.to||"—"}`);
    setMoveForm(emptyMove);
  }

 function handleReorder(item) {
  const suggestedQty = Math.max(item.minQty * 2 - item.qty, 10);
  const poNumber = `PO-${String(poCounter).padStart(4,"0")}`;
  setPOCounter(c => c + 1);
  const newPO = {
    id: Date.now(), poNumber, status: "Draft",
    sku: item.sku, itemName: item.name,
    description: `Reorder for ${item.name} — SKU ${item.sku}`,
    supplier: item.supplier, qty: suggestedQty,
    unitCost: item.unitCost, date: new Date().toISOString().slice(0,10),
    deliveryDate: "", notes: "", createdFrom: "Reorder Center"
  };
  setPOs(p => [newPO, ...p]);
  setReorders(r => [{id:Date.now(), sku:item.sku, name:item.name, supplier:item.supplier, qty:suggestedQty, status:"Sent", date:new Date().toISOString().slice(0,10), urgency:item.qty===0?"Critical":item.qty<item.minQty*0.3?"High":"Normal"}, ...r]);
  addLog("Reordered", item.name, suggestedQty, "Staff", `${poNumber} sent to ${item.supplier}`);
} 

  function handleCSVUpload(e) {
    const file=e.target.files[0]; if (!file) return;
    const reader=new FileReader();
    reader.onload=evt=>{
      try {
        const lines=evt.target.result.trim().split(/\r?\n/);
        const headers=lines[0].split(",").map(c=>c.replace(/"/g,"").trim());
        const rows=lines.slice(1).filter(l=>l.trim()).map(line=>{const cols=line.split(",").map(c=>c.replace(/"/g,"").trim());const obj={};headers.forEach((h,i)=>{obj[h]=cols[i]||"";});return obj;});
        const {parsed,errors}=parseRows(rows);
        setImportErrors(errors);setImportPreview(parsed);setImportStatus("preview");
      } catch(err){setImportErrors(["Failed to parse file: "+err.message]);}
    };
    reader.readAsText(file);e.target.value="";
  }

  function handlePasteParse() {
    if (!pasteText.trim()){setImportErrors(["Please paste some data first."]);return;}
    try {
      const lines=pasteText.trim().split(/\r?\n/);
      if (lines.length<2){setImportErrors(["Please paste at least a header row and one data row."]);return;}
      const headers=lines[0].split(/\t|,/).map(c=>c.trim());
      const rows=lines.slice(1).filter(l=>l.trim()).map(line=>{const cols=line.split(/\t|,/).map(c=>c.trim());const obj={};headers.forEach((h,i)=>{obj[h]=cols[i]||"";});return obj;});
      const {parsed,errors}=parseRows(rows);
      setImportErrors(errors);setImportPreview(parsed);setImportStatus("preview");
    } catch(err){setImportErrors(["Failed to parse pasted data: "+err.message]);}
  }

  function handleManualParse() {
    const filled=manualRows.filter(r=>r.sku.trim()&&r.name.trim());
    if (!filled.length){setImportErrors(["Please fill in at least one row with SKU and Name."]);return;}
    const {parsed,errors}=parseRows(filled);
    setImportErrors(errors);setImportPreview(parsed);setImportStatus("preview");
  }

  function confirmMerge() {
    let added=0,updated=0;
    setInventory(prev=>{
      const next=[...prev];
      importPreview.forEach(item=>{
        const idx=next.findIndex(i=>i.sku===item.sku);
        if (idx>=0){next[idx]={...next[idx],qty:next[idx].qty+item.qty,name:item.name||next[idx].name,category:item.category||next[idx].category,supplier:item.supplier!=="—"?item.supplier:next[idx].supplier,unitCost:item.unitCost||next[idx].unitCost,sellingPrice:item.sellingPrice||next[idx].sellingPrice,location:item.location!=="—"?item.location:next[idx].location,minQty:item.minQty||next[idx].minQty};updated++;}
        else{next.push({...item,id:Date.now()+Math.random()});added++;}
      });
      return next;
    });
    addLog("Import",`Bulk import (${importPreview.length} items)`,importPreview.length,"Staff",`${added} added, ${updated} updated`);
    setMergeStats({added,updated,total:importPreview.length});
    setImportPreview([]);setImportErrors([]);setImportStatus("done");
    setPasteText("");setManualRows([emptyRec]);
  }

  function resetImport(){setImportPreview([]);setImportErrors([]);setImportStatus("");setMergeStats(null);}

  function downloadTemplate(){
    const blob=new Blob([CSV_TEMPLATE],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="stockguard_import_template.csv";a.click();URL.revokeObjectURL(url);
  }

  async function runAiAnalysis() {
    setAiLoading(true);setAiAnalysis("");
    const lowData=lowItems.map(i=>`${i.name} (SKU: ${i.sku}): qty ${i.qty}, min ${i.minQty}, supplier: ${i.supplier}`).join("\n");
    try {
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1000,messages:[{role:"user",content:`You are a supply chain analyst for a small retail store. Analyze these low-inventory items and provide reorder recommendations:\n\n${lowData}\n\nFor each item give:\n1. Urgency level (Critical/High/Normal)\n2. Recommended reorder quantity\n3. Brief reason\n4. Risk if not reordered\n\nBe concise. Format as a short bullet list per item.`}]})});
      const data=await res.json();
      setAiAnalysis(data.content?.find(b=>b.type==="text")?.text||"No analysis returned.");
    } catch(e){setAiAnalysis("Unable to connect to AI analysis. Please try again.");}
    setAiLoading(false);
  }

  async function runBusinessInsights() {
    setInsightLoading(true);setSwotData(null);setPorterData(null);setMoneyData(null);
    const invSummary=inventory.map(i=>`${i.name}: qty=${i.qty}, min=${i.minQty}, supplier=${i.supplier}, cost=$${i.unitCost}, sell=$${i.sellingPrice||0}`).join("\n");
    const prompt=`You are a business strategist analyzing a small retail store using StockGuard inventory software. Inventory data:\n\n${invSummary}\n\nIndustry: ${industry}\nLow stock: ${lowItems.length}, Out of stock: ${outItems.length}, Total cost value: $${totalValue.toFixed(0)}, Total retail value: $${totalRetail.toFixed(0)}, Avg margin: ${avgMargin.toFixed(1)}%\n\nRespond ONLY with a valid JSON object (no markdown, no backticks):\n{\n  "swot":{"strengths":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}],"weaknesses":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}],"opportunities":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}],"threats":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}]},\n  "porter":{"supplier_power":{"rating":"Low|Medium|High","insight":"...","action":"..."},"buyer_power":{"rating":"Low|Medium|High","insight":"...","action":"..."},"competitive_rivalry":{"rating":"Low|Medium|High","insight":"...","action":"..."},"new_entrants":{"rating":"Low|Medium|High","insight":"...","action":"..."},"substitutes":{"rating":"Low|Medium|High","insight":"...","action":"..."}},\n  "money":{"revenue_growth":[{"title":"...","description":"...","impact":"High|Medium|Low"},{"title":"...","description":"...","impact":"High|Medium|Low"},{"title":"...","description":"...","impact":"High|Medium|Low"}],"cost_reduction":[{"title":"...","description":"...","saving":"..."},{"title":"...","description":"...","saving":"..."},{"title":"...","description":"...","saving":"..."}],"new_products":[{"title":"...","description":"...","rationale":"..."},{"title":"...","description":"...","rationale":"..."},{"title":"...","description":"...","rationale":"..."}]}\n}`;
    try {
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:4000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      if (data.error) throw new Error(data.error.message);
      const text=data.content?.find(b=>b.type==="text")?.text||"";
      const match=text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in response");
      const parsed=JSON.parse(match[0]);
      if (!parsed.swot||!parsed.porter||!parsed.money) throw new Error("Incomplete response");
      setSwotData(parsed.swot);setPorterData(parsed.porter);setMoneyData(parsed.money);
    } catch(e){setSwotData({error:`Analysis failed: ${e.message}. Please try again.`});}
    setInsightLoading(false);
  }

  const C   = {bg:"#ffffff",bg2:"#f5f5f5",text:"#111111",muted:"#666666",border:"#e0e0e0"};
  const inp = {padding:"7px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:13,width:"100%",boxSizing:"border-box"};
  const btn = (bg)=>({padding:"7px 14px",borderRadius:6,border:"none",background:bg,color:"#fff",fontSize:13,cursor:"pointer",fontWeight:500});

  return (
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",color:C.text,maxWidth:900,margin:"0 auto",padding:"1rem 0.75rem",background:C.bg,minHeight:"100vh"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <div style={{width:36,height:36,borderRadius:8,background:"#185FA5",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <h2 style={{fontSize:20,fontWeight:600,margin:0}}>StockGuard</h2>
          <p style={{fontSize:12,color:C.muted,margin:0}}>Supply Chain Inventory Tracker</p>
        </div>
      </div>
      <p style={{fontSize:13,color:C.muted,margin:"0 0 1.25rem"}}>Track inventory from receiving to sale — eliminate lost stock and shrinkage.</p>

      {/* Nav */}
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${C.border}`,background:tab===t?C.text:"transparent",color:tab===t?C.bg:C.muted,fontSize:12,cursor:"pointer",fontWeight:tab===t?600:400}}>{t}</button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab==="Dashboard" && (
        <div>
          {/* Daily Sales Summary */}
          <div style={{background:"linear-gradient(135deg,#185FA5 0%,#0d3d6b 100%)",borderRadius:12,padding:"18px 20px",marginBottom:20,color:"#fff"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:12,opacity:0.8,marginBottom:2}}>Today's Sales Summary</div>
                <div style={{fontSize:28,fontWeight:700,lineHeight:1}}>${todaySales.revenue.toFixed(2)}</div>
                <div style={{fontSize:12,opacity:0.8,marginTop:2}}>
                  {revenueUp?"▲":"▼"} vs yesterday ${yesterdaySales.revenue.toFixed(2)}
                </div>
              </div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {[
                  {label:"Profit today",   val:`$${todaySales.profit.toFixed(2)}`,     color:"#A8D57B"},
                  {label:"Units sold",     val:todaySales.units,                        color:"#7EC8E3"},
                  {label:"Transactions",  val:todaySales.transactions,                  color:"#F9C74F"},
                ].map(s=>(
                  <div key={s.label} style={{textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.val}</div>
                    <div style={{fontSize:11,opacity:0.8}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {topItem && (
              <div style={{marginTop:12,padding:"8px 12px",background:"rgba(255,255,255,0.12)",borderRadius:8,fontSize:12}}>
                🏆 Top seller today: <strong>{topItem[0]}</strong> — {topItem[1]} units
              </div>
            )}
            {!topItem && (
              <div style={{marginTop:12,padding:"8px 12px",background:"rgba(255,255,255,0.12)",borderRadius:8,fontSize:12,opacity:0.8}}>
                No sales recorded yet today. Go make some sales! 💪
              </div>
            )}
          </div>

          {/* 7-day bar chart */}
          <div style={{background:C.bg2,borderRadius:10,padding:"14px 16px",marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:600,color:C.muted,marginBottom:12}}>Revenue — last 7 days</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
              {Object.entries(salesByDay).map(([day,data])=>{
                const isToday=day===today;
                const barH=maxRevenue>0?Math.max((data.revenue/maxRevenue)*72,data.revenue>0?6:2):2;
                return (
                  <div key={day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:isToday?700:400}}>${data.revenue>0?data.revenue.toFixed(0):0}</div>
                    <div style={{width:"100%",height:barH,background:isToday?"#185FA5":"#B8D4F0",borderRadius:"3px 3px 0 0",transition:"height .3s"}} />
                    <div style={{fontSize:10,color:isToday?C.text:C.muted,fontWeight:isToday?700:400,whiteSpace:"nowrap"}}>{shortDate(day)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:20}}>
            {[
              {label:"Total SKUs",      val:inventory.length,                                                                  color:"#185FA5"},
              {label:"Low stock",       val:lowItems.length,                                                                   color:"#BA7517"},
              {label:"Cost value",      val:`$${totalValue.toLocaleString("en-US",{maximumFractionDigits:0})}`,                color:"#3B6D11"},
              {label:"Retail value",    val:`$${totalRetail.toLocaleString("en-US",{maximumFractionDigits:0})}`,               color:"#534AB7"},
              {label:"Avg margin",      val:avgMargin>0?`${avgMargin.toFixed(1)}%`:"—",                                        color:avgMargin>=40?"#3B6D11":avgMargin>=20?"#854F0B":"#A32D2D"},
            ].map(c=>(
              <div key={c.label} style={{background:C.bg2,borderRadius:8,padding:"14px 16px"}}>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>{c.label}</div>
                <div style={{fontSize:22,fontWeight:600,color:c.color}}>{c.val}</div>
              </div>
            ))}
          </div>

          {/* Low stock alerts */}
          {lowItems.length>0&&(
            <div style={{background:"#FAEEDA",border:"1px solid #EF9F27",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
              <div style={{fontWeight:600,color:"#854F0B",fontSize:13,marginBottom:8}}>Low stock alerts ({lowItems.length})</div>
              {lowItems.map(i=>{
                const s=statusBadge(i.qty,i.minQty);
                return (
                  <div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #EF9F2733",fontSize:13}}>
                    <span style={{color:"#633806"}}>{i.name} <span style={{color:"#BA7517"}}>({i.sku})</span></span>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:"#854F0B"}}>{i.qty} / {i.minQty}</span>
                      <span style={{background:s.bg,color:s.color,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{s.label}</span>
                      <button onClick={()=>{handleReorder(i);setTab("Reorder Center");}} style={{...btn("#BA7517"),padding:"3px 10px",fontSize:11}}>Reorder</button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Inventory table */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:500,color:C.muted}}>All inventory</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>exportCSV("inventory")} style={{...btn("#185FA5"),padding:"5px 12px",fontSize:11}}>⬇ Inventory CSV</button>
              <button onClick={()=>exportCSV("sales")}     style={{...btn("#3B6D11"),padding:"5px 12px",fontSize:11}}>⬇ Sales CSV</button>
              <button onClick={()=>exportCSV("audit")}     style={{...btn("#534AB7"),padding:"5px 12px",fontSize:11}}>⬇ Audit CSV</button>
            </div>
          </div>
          <input placeholder="Search by name, SKU, or category" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:10}} />
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {["SKU","Item","Cat","Qty","Min","Cost","Sell","Margin","Location","Status","Actions"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"6px 8px",fontWeight:500,color:C.muted,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInv.map(i=>{
                  const s=statusBadge(i.qty,i.minQty);
                  const m=marginBadge(i.unitCost,i.sellingPrice);
                  const isEditing=editId===i.id;
                  const isConfirmingDelete=deleteConfirmId===i.id;
                  if (isEditing) return (
                    <tr key={i.id} style={{borderBottom:`1px solid ${C.border}`,background:"#F0F4FF"}}>
                      {[["sku",70],["name",120],["category",90],["qty",55,"number"],["minQty",55,"number"],["unitCost",70,"number"],["sellingPrice",70,"number"]].map(([f,w,t])=>(
                        <td key={f} style={{padding:"5px 6px"}}>
                          <input type={t||"text"} value={editForm[f]||""} onChange={e=>setEditForm(f2=>({...f2,[f]:e.target.value}))} style={{...inp,fontSize:11,padding:"4px 6px",width:w}} />
                        </td>
                      ))}
                      <td style={{padding:"5px 6px"}}><input value={editForm.location||""} onChange={e=>setEditForm(f=>({...f,location:e.target.value}))} style={{...inp,fontSize:11,padding:"4px 6px",width:80}} /></td>
                      <td/><td style={{padding:"5px 6px"}}>
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={saveEdit}   style={{...btn("#3B6D11"),padding:"4px 10px",fontSize:11}}>Save</button>
                          <button onClick={cancelEdit} style={{...btn("#888"),   padding:"4px 10px",fontSize:11}}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  );
                  return (
                    <tr key={i.id} style={{borderBottom:`1px solid ${C.border}`,background:isConfirmingDelete?"#FFF5F5":"transparent"}}>
                      <td style={{padding:"7px 8px",color:C.muted}}>{i.sku}</td>
                      <td style={{padding:"7px 8px",fontWeight:500}}>{i.name}</td>
                      <td style={{padding:"7px 8px",color:C.muted}}>{i.category}</td>
                      <td style={{padding:"7px 8px",fontWeight:600,color:i.qty<i.minQty?"#A32D2D":C.text}}>{i.qty}</td>
                      <td style={{padding:"7px 8px",color:C.muted}}>{i.minQty}</td>
                      <td style={{padding:"7px 8px",color:C.muted}}>${i.unitCost.toFixed(2)}</td>
                      <td style={{padding:"7px 8px",color:C.muted}}>{i.sellingPrice?`$${i.sellingPrice.toFixed(2)}`:"—"}</td>
                      <td style={{padding:"7px 8px"}}>{i.sellingPrice?<span style={{background:m.bg,color:m.color,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{m.label} <span style={{opacity:0.75}}>(+${m.profit.toFixed(2)})</span></span>:<span style={{color:C.muted,fontSize:11}}>Not set</span>}</td>
                      <td style={{padding:"7px 8px",color:C.muted}}>{i.location}</td>
                      <td style={{padding:"7px 8px"}}><span style={{background:s.bg,color:s.color,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{s.label}</span></td>
                      <td style={{padding:"7px 8px"}}>
                        {isConfirmingDelete?(
                          <div style={{display:"flex",gap:4,alignItems:"center"}}>
                            <span style={{fontSize:11,color:"#A32D2D",fontWeight:500}}>Delete?</span>
                            <button onClick={()=>doDelete(i)}              style={{...btn("#A32D2D"),padding:"3px 8px",fontSize:11}}>Yes</button>
                            <button onClick={()=>setDeleteConfirmId(null)} style={{...btn("#888"),   padding:"3px 8px",fontSize:11}}>No</button>
                          </div>
                        ):(
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>startEdit(i)}       style={{...btn("#185FA5"),padding:"3px 10px",fontSize:11}}>Edit</button>
                            <button onClick={()=>confirmDelete(i.id)} style={{...btn("#A32D2D"),padding:"3px 10px",fontSize:11}}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RECEIVING ── */}
      {tab==="Receiving"&&(
        <div>
          <div style={{fontWeight:500,marginBottom:12}}>Log incoming shipment</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["sku","SKU *","SKU-001"],["name","Item name *","Product name"],["category","Category","Apparel / Electronics"],["qty","Qty received *","0"],["supplier","Supplier","Supplier name"],["unitCost","Unit cost ($)","0.00"],["sellingPrice","Selling price ($)","0.00"],["location","Storage location","Aisle A1"],["po","PO number","PO-2201"]].map(([f,l,p])=>(
              <div key={f}><label style={{fontSize:12,color:C.muted}}>{l}</label><input type={["qty","unitCost","sellingPrice"].includes(f)?"number":"text"} placeholder={p} value={recForm[f]} onChange={e=>setRecForm(r=>({...r,[f]:e.target.value}))} style={inp} /></div>
            ))}
          </div>
          <button onClick={handleReceive} style={btn("#185FA5")}>Confirm receipt</button>
          <div style={{marginTop:24,fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Recent receipts</div>
          {audit.filter(a=>a.action==="Received").slice(0,8).map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <span style={{fontWeight:500}}>{a.item}</span><span style={{color:C.muted}}>+{a.qty} · {a.note} · {a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── MOVEMENTS ── */}
      {tab==="Movements"&&(
        <div>
          <div style={{fontWeight:500,marginBottom:12}}>Log inventory movement</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:12,color:C.muted}}>Select item</label>
              <select value={moveForm.sku} onChange={e=>setMoveForm(f=>({...f,sku:e.target.value}))} style={inp}>
                <option value="">Select SKU</option>
                {inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} - {i.name}</option>)}
              </select>
            </div>
            <div><label style={{fontSize:12,color:C.muted}}>Qty moved</label><input type="number" placeholder="0" value={moveForm.qty} onChange={e=>setMoveForm(f=>({...f,qty:e.target.value}))} style={inp} /></div>
            <div><label style={{fontSize:12,color:C.muted}}>From</label><input placeholder="Stockroom" value={moveForm.from} onChange={e=>setMoveForm(f=>({...f,from:e.target.value}))} style={inp} /></div>
            <div><label style={{fontSize:12,color:C.muted}}>To</label><input placeholder="Sales Floor" value={moveForm.to} onChange={e=>setMoveForm(f=>({...f,to:e.target.value}))} style={inp} /></div>
          </div>
          <button onClick={handleMove} style={btn("#0F6E56")}>Log movement</button>
          <div style={{marginTop:24,fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Movement log</div>
          {audit.filter(a=>a.action==="Moved").map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <span style={{fontWeight:500}}>{a.item}</span><span style={{color:C.muted}}>{a.qty} units · {a.note} · {a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── SALES ── */}
      {tab==="Sales"&&(
        <div>
          {/* Today's sales banner */}
          <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",gap:20,flexWrap:"wrap"}}>
            <div><div style={{fontSize:11,color:C.muted}}>Today's revenue</div><div style={{fontSize:18,fontWeight:700,color:"#185FA5"}}>${todaySales.revenue.toFixed(2)}</div></div>
            <div><div style={{fontSize:11,color:C.muted}}>Today's profit</div><div style={{fontSize:18,fontWeight:700,color:"#3B6D11"}}>${todaySales.profit.toFixed(2)}</div></div>
            <div><div style={{fontSize:11,color:C.muted}}>Units sold</div><div style={{fontSize:18,fontWeight:700,color:"#534AB7"}}>{todaySales.units}</div></div>
            <div><div style={{fontSize:11,color:C.muted}}>Transactions</div><div style={{fontSize:18,fontWeight:700,color:"#854F0B"}}>{todaySales.transactions}</div></div>
          </div>

          <div style={{fontWeight:500,marginBottom:12}}>Record sale / dispatch</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:12,color:C.muted}}>Item sold</label>
              <select value={saleForm.sku} onChange={e=>setSaleForm(f=>({...f,sku:e.target.value}))} style={inp}>
                <option value="">Select SKU</option>
                {inventory.map(i=>{const m=marginBadge(i.unitCost,i.sellingPrice);return <option key={i.sku} value={i.sku}>{i.sku} - {i.name} ({i.qty} in stock{i.sellingPrice?` · $${i.sellingPrice} · ${m.label} margin`:""})</option>;})}
              </select>
            </div>
            <div><label style={{fontSize:12,color:C.muted}}>Qty sold</label><input type="number" placeholder="0" value={saleForm.qty} onChange={e=>setSaleForm(f=>({...f,qty:e.target.value}))} style={inp} /></div>
            <div><label style={{fontSize:12,color:C.muted}}>Invoice / ref #</label><input placeholder="INV-0001" value={saleForm.invoice} onChange={e=>setSaleForm(f=>({...f,invoice:e.target.value}))} style={inp} /></div>
          </div>
          {saleForm.sku&&(()=>{
            const item=inventory.find(i=>i.sku===saleForm.sku);
            const m=item?marginBadge(item.unitCost,item.sellingPrice):null;
            const qty=parseInt(saleForm.qty)||0;
            if (!item||!m||!item.sellingPrice) return null;
            return (
              <div style={{background:"#EAF3DE",border:"1px solid #6BAD2E",borderRadius:8,padding:"10px 14px",marginBottom:10,fontSize:12}}>
                <strong style={{color:"#3B6D11"}}>Sale summary</strong>
                <div style={{marginTop:4,color:"#3B6D11"}}>
                  Selling at <strong>${item.sellingPrice.toFixed(2)}</strong> · Cost <strong>${item.unitCost.toFixed(2)}</strong> · Profit per unit <strong>${m.profit.toFixed(2)}</strong> ({m.label} margin)
                  {qty>0&&<span> · Total profit: <strong>${(m.profit*qty).toFixed(2)}</strong></span>}
                </div>
              </div>
            );
          })()}
          <button onClick={handleSale} style={btn("#A32D2D")}>Record sale</button>
          <div style={{marginTop:24,fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Sales log</div>
          {audit.filter(a=>a.action==="Sold").map(a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <span style={{fontWeight:500}}>{a.item}</span>
              <span style={{color:C.muted,display:"flex",gap:10,alignItems:"center"}}>
                <span>{a.qty} units</span>
                {a.revenue>0&&<span style={{color:"#185FA5",fontWeight:600}}>${a.revenue.toFixed(2)}</span>}
                {a.profit>0&&<span style={{color:"#3B6D11",fontWeight:600}}>+${a.profit.toFixed(2)} profit</span>}
                <span>{a.note} · {a.time}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── PURCHASE ORDERS ── */}
      {tab==="Purchase Orders"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <div style={{fontWeight:600,fontSize:15}}>Purchase Orders</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>Create, edit and track orders sent to suppliers</div>
            </div>
            <button onClick={()=>{
              const poNumber=`PO-${String(poCounter).padStart(4,"0")}`;
              setPOCounter(c=>c+1);
              const newPO={id:Date.now(),poNumber,status:"Draft",sku:"",itemName:"",description:"",supplier:"",qty:1,unitCost:0,date:new Date().toISOString().slice(0,10),deliveryDate:"",notes:"",createdFrom:"Manual"};
              setPOs(p=>[newPO,...p]);
              setEditPOId(newPO.id);
              setEditPOForm({...newPO});
            }} style={btn("#185FA5")}>+ New Purchase Order</button>
          </div>

          {pos.length===0&&(
            <div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}>
              <div style={{fontSize:28,marginBottom:8}}>📋</div>
              <div style={{fontWeight:600,marginBottom:4,color:C.text}}>No purchase orders yet</div>
              <div>Click "Send Reorder" in the Reorder Center or create a new PO manually.</div>
            </div>
          )}

          {pos.map(po=>{
            const isEditing=editPOId===po.id;
            const total=(po.qty*(po.unitCost||0)).toFixed(2);
            const statusColor={Draft:"#854F0B",Sent:"#185FA5",Received:"#3B6D11"}[po.status]||"#888";
            const statusBg={Draft:"#FAEEDA",Sent:"#E6F1FB",Received:"#EAF3DE"}[po.status]||"#eee";

            if (isEditing) return (
              <div key={po.id} style={{border:`2px solid #185FA5`,borderRadius:10,padding:16,marginBottom:12,background:"#F0F4FF"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#185FA5"}}>{editPOForm.poNumber} — Editing</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setPOs(p=>p.map(x=>x.id===po.id?{...editPOForm}:x));setEditPOId(null);setEditPOForm({});}} style={{...btn("#3B6D11"),padding:"5px 14px"}}>Save PO</button>
                    <button onClick={()=>{setEditPOId(null);setEditPOForm({});}} style={{...btn("#888"),padding:"5px 14px"}}>Cancel</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{gridColumn:"1/-1"}}>
                    <label style={{fontSize:12,color:C.muted}}>Select product (auto-fills fields)</label>
                    <select onChange={e=>{
                      const item=inventory.find(i=>i.sku===e.target.value);
                      if(item) setEditPOForm(x=>({...x,sku:item.sku,itemName:item.name,description:`Reorder for ${item.name} — SKU ${item.sku}`,supplier:item.supplier,unitCost:item.unitCost,qty:Math.max(item.minQty*2-item.qty,10)}));
                    }} style={inp}>
                      <option value="">— Pick a product to auto-fill —</option>
                      {inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} — {i.name} (stock: {i.qty}, min: {i.minQty})</option>)}
                    </select>
                  </div>
                  {[["itemName","Item name *"],["description","Description"],["supplier","Supplier"],["deliveryDate","Expected delivery","date"]].map(([f,l,t])=>(
                    <div key={f}>
                      <label style={{fontSize:12,color:C.muted}}>{l}</label>
                      <input type={t||"text"} value={editPOForm[f]||""} onChange={e=>setEditPOForm(x=>({...x,[f]:e.target.value}))} style={inp} />
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:12,color:C.muted}}>Order quantity *</label>
                    <input type="number" value={editPOForm.qty||""} onChange={e=>setEditPOForm(x=>({...x,qty:parseInt(e.target.value)||0}))} style={inp} />
                  </div>
                  <div>
                    <label style={{fontSize:12,color:C.muted}}>Unit cost ($)</label>
                    <input type="number" value={editPOForm.unitCost||""} onChange={e=>setEditPOForm(x=>({...x,unitCost:parseFloat(e.target.value)||0}))} style={inp} />
                  </div>
                  <div>
                    <label style={{fontSize:12,color:C.muted}}>Status</label>
                    <select value={editPOForm.status} onChange={e=>setEditPOForm(x=>({...x,status:e.target.value}))} style={inp}>
                      <option>Draft</option><option>Sent</option><option>Received</option>
                    </select>
                  </div>
                  <div style={{gridColumn:"1/-1"}}>
                    <label style={{fontSize:12,color:C.muted}}>Notes</label>
                    <textarea value={editPOForm.notes||""} onChange={e=>setEditPOForm(x=>({...x,notes:e.target.value}))} style={{...inp,height:60,resize:"vertical"}} />
                  </div>
                </div>
                <div style={{marginTop:10,padding:"8px 12px",background:"#E6F1FB",borderRadius:8,fontSize:13,color:"#185FA5",fontWeight:600}}>
                  Total order value: ${((editPOForm.qty||0)*(editPOForm.unitCost||0)).toFixed(2)}
                </div>
              </div>
            );

            return (
              <div key={po.id} style={{border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontWeight:700,fontSize:14}}>{po.poNumber}</span>
                      <span style={{background:statusBg,color:statusColor,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:700}}>{po.status}</span>
                    </div>
                    <div style={{fontWeight:500,fontSize:13}}>{po.itemName||"—"}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2}}>{po.description}</div>
                    <div style={{display:"flex",gap:16,marginTop:8,fontSize:12,flexWrap:"wrap"}}>
                      <span>Supplier: <strong>{po.supplier||"—"}</strong></span>
                      <span>Qty: <strong>{po.qty}</strong></span>
                      <span>Unit cost: <strong>${(po.unitCost||0).toFixed(2)}</strong></span>
                      <span style={{color:"#3B6D11",fontWeight:600}}>Total: <strong>${total}</strong></span>
                      {po.deliveryDate&&<span>Expected: <strong>{po.deliveryDate}</strong></span>}
                    </div>
                    {po.notes&&<div style={{fontSize:12,color:C.muted,marginTop:6,fontStyle:"italic"}}>Note: {po.notes}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                    <div style={{fontSize:11,color:C.muted}}>{po.date}</div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setEditPOId(po.id);setEditPOForm({...po});}} style={{...btn("#185FA5"),padding:"4px 12px",fontSize:11}}>Edit</button>
                      <button onClick={()=>{
                        const content=`PURCHASE ORDER\n${po.poNumber}\nDate: ${po.date}\n\nSupplier: ${po.supplier}\n\nItem: ${po.itemName}\nDescription: ${po.description}\nQty: ${po.qty}\nUnit Cost: ${(po.unitCost||0).toFixed(2)}\nTotal: ${total}\n\nDelivery by: ${po.deliveryDate||"TBD"}\nNotes: ${po.notes||"None"}`;
                        const blob=new Blob([content],{type:"text/plain"});
                        const url=URL.createObjectURL(blob);
                        const a=document.createElement("a");a.href=url;a.download=`${po.poNumber}.txt`;a.click();URL.revokeObjectURL(url);
                      }} style={{...btn("#534AB7"),padding:"4px 12px",fontSize:11}}>⬇ Download</button>
                      <button onClick={()=>setPOs(p=>p.filter(x=>x.id!==po.id))} style={{...btn("#A32D2D"),padding:"4px 12px",fontSize:11}}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {tab==="Reorder Center"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontWeight:500}}>Low inventory analyzer</div>
            <button onClick={runAiAnalysis} disabled={aiLoading} style={{...btn("#534AB7"),opacity:aiLoading?0.7:1}}>{aiLoading?"Analyzing...":"AI analyze and recommend"}</button>
          </div>
          {aiAnalysis&&(
            <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px",marginBottom:20,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
              <div style={{fontWeight:600,color:"#534AB7",marginBottom:8,fontSize:12}}>AI reorder analysis</div>{aiAnalysis}
            </div>
          )}
          <div style={{fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Items needing reorder ({lowItems.length})</div>
          {lowItems.length===0&&<div style={{color:C.muted,fontSize:13}}>All items are sufficiently stocked.</div>}
          {lowItems.map(i=>{
            const s=statusBadge(i.qty,i.minQty);
            const m=marginBadge(i.unitCost,i.sellingPrice);
            const sugQty=Math.max(i.minQty*2-i.qty,10);
            const ordered=reorders.find(r=>r.sku===i.sku);
            return (
              <div key={i.id} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontWeight:500}}>{i.name} <span style={{color:C.muted,fontWeight:400,fontSize:12}}>({i.sku})</span></div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2}}>Supplier: {i.supplier} · Location: {i.location}</div>
                    <div style={{display:"flex",gap:12,marginTop:6,fontSize:12}}>
                      <span>In stock: <strong>{i.qty}</strong></span>
                      <span>Min: <strong>{i.minQty}</strong></span>
                      <span>Suggest: <strong>{sugQty} units</strong></span>
                      {i.sellingPrice&&<span style={{color:m.color}}>Margin: <strong>{m.label}</strong></span>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                    <span style={{background:s.bg,color:s.color,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600}}>{s.label}</span>
                    {ordered?<span style={{fontSize:12,color:"#3B6D11",background:"#EAF3DE",padding:"3px 10px",borderRadius:10}}>Order sent</span>:<button onClick={()=>handleReorder(i)} style={btn("#185FA5")}>Send reorder</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {reorders.length>0&&(
            <>
              <div style={{fontSize:13,fontWeight:500,color:C.muted,marginTop:24,marginBottom:8}}>Reorder history</div>
              {reorders.map(r=>{
                const urg={Critical:"#A32D2D",High:"#854F0B",Normal:"#3B6D11"};
                const urgBg={Critical:"#FCEBEB",High:"#FAEEDA",Normal:"#EAF3DE"};
                return (
                  <div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                    <span><strong>{r.name}</strong> — {r.qty} units from {r.supplier}</span>
                    <span style={{display:"flex",gap:8,alignItems:"center",color:C.muted}}>
                      <span>{r.date}</span>
                      <span style={{background:urgBg[r.urgency],color:urg[r.urgency],padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{r.urgency}</span>
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── AUDIT TRAIL ── */}
      {tab==="Audit Trail"&&(
        <div>
          <div style={{fontWeight:500,marginBottom:12}}>Full inventory activity log</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {["Time","Action","Item","Qty","Revenue","Profit","User","Reference"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"6px 8px",fontWeight:500,color:C.muted,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audit.map(a=>{
                  const aColor={Received:"#185FA5",Sold:"#A32D2D",Moved:"#0F6E56",Reordered:"#854F0B",Import:"#534AB7",Edited:"#185FA5",Deleted:"#A32D2D"}[a.action]||"#888";
                  const aBg={Received:"#E6F1FB",Sold:"#FCEBEB",Moved:"#E1F5EE",Reordered:"#FAEEDA",Import:"#EDE9FB",Edited:"#E6F1FB",Deleted:"#FCEBEB"}[a.action]||"#eee";
                  return (
                    <tr key={a.id} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:"7px 8px",color:C.muted,whiteSpace:"nowrap"}}>{a.time}</td>
                      <td style={{padding:"7px 8px"}}><span style={{background:aBg,color:aColor,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{a.action}</span></td>
                      <td style={{padding:"7px 8px",fontWeight:500}}>{a.item}</td>
                      <td style={{padding:"7px 8px"}}>{a.qty}</td>
                      <td style={{padding:"7px 8px",color:"#185FA5",fontWeight:600}}>{a.revenue>0?`$${a.revenue.toFixed(2)}`:"—"}</td>
                      <td style={{padding:"7px 8px",color:"#3B6D11",fontWeight:600}}>{a.profit>0?`$${a.profit.toFixed(2)}`:"—"}</td>
                      <td style={{padding:"7px 8px",color:C.muted}}>{a.user}</td>
                      <td style={{padding:"7px 8px",color:C.muted}}>{a.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BUSINESS INSIGHTS ── */}
      {tab==="Business Insights"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontWeight:600,fontSize:15}}>Business Insights</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>AI-powered SWOT, Porter's Five Forces and money strategies based on your live inventory data</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="Your industry" style={{...inp,width:200}} />
              <button onClick={runBusinessInsights} disabled={insightLoading} style={{...btn("#534AB7"),opacity:insightLoading?0.7:1}}>{insightLoading?"Analyzing...":"Run AI Analysis"}</button>
            </div>
          </div>
          {!swotData&&!insightLoading&&(<div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>✦</div><div style={{fontWeight:600,marginBottom:4,color:C.text}}>Ready to analyze your business</div><div>Click "Run AI Analysis" to generate your SWOT, Porter's Five Forces, and money-making strategies.</div></div>)}
          {insightLoading&&(<div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}><div style={{fontSize:24,marginBottom:8}}>⏳</div><div>Analyzing your inventory and generating business insights...</div></div>)}
          {swotData&&!swotData.error&&(
            <>
              <div style={{display:"flex",gap:4,marginBottom:18}}>
                {["SWOT","Porter's Five Forces","Money Strategies"].map(t=>(
                  <button key={t} onClick={()=>setInsightTab(t)} style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${C.border}`,background:insightTab===t?"#534AB7":"transparent",color:insightTab===t?"#fff":C.muted,fontSize:12,cursor:"pointer",fontWeight:insightTab===t?600:400}}>{t}</button>
                ))}
              </div>
              {insightTab==="SWOT"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{[{key:"strengths",label:"Strengths",icon:"💪",bg:"#EAF3DE",border:"#6BAD2E",head:"#3B6D11"},{key:"weaknesses",label:"Weaknesses",icon:"⚠",bg:"#FCEBEB",border:"#E05A5A",head:"#A32D2D"},{key:"opportunities",label:"Opportunities",icon:"🚀",bg:"#E6F1FB",border:"#4A90D9",head:"#185FA5"},{key:"threats",label:"Threats",icon:"🛡",bg:"#FAEEDA",border:"#EF9F27",head:"#854F0B"}].map(q=>(<div key={q.key} style={{background:q.bg,border:`1px solid ${q.border}`,borderRadius:10,padding:14}}><div style={{fontWeight:700,color:q.head,fontSize:13,marginBottom:10}}>{q.icon} {q.label}</div>{(swotData[q.key]||[]).map((item,i)=>(<div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<swotData[q.key].length-1?`1px solid ${q.border}55`:"none"}}><div style={{fontWeight:600,fontSize:12,color:q.head}}>{item.point}</div><div style={{fontSize:11,color:q.head,opacity:0.8,marginTop:3}}>→ {item.action}</div></div>))}</div>))}</div>)}
              {insightTab==="Porter's Five Forces"&&porterData&&(<div style={{display:"flex",flexDirection:"column",gap:10}}>{[{key:"supplier_power",label:"Supplier Power",icon:"🏭"},{key:"buyer_power",label:"Buyer Power",icon:"🛒"},{key:"competitive_rivalry",label:"Competitive Rivalry",icon:"⚔"},{key:"new_entrants",label:"Threat of New Entrants",icon:"🚪"},{key:"substitutes",label:"Threat of Substitutes",icon:"🔄"}].map(f=>{const d=porterData[f.key];const rC=d.rating==="High"?"#A32D2D":d.rating==="Medium"?"#854F0B":"#3B6D11";const rB=d.rating==="High"?"#FCEBEB":d.rating==="Medium"?"#FAEEDA":"#EAF3DE";const bW=d.rating==="High"?"85%":d.rating==="Medium"?"50%":"25%";return(<div key={f.key} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontWeight:600,fontSize:13}}>{f.icon} {f.label}</div><span style={{background:rB,color:rC,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:700}}>{d.rating} Risk</span></div><div style={{background:C.border,borderRadius:4,height:6,marginBottom:8}}><div style={{width:bW,background:rC,height:6,borderRadius:4}}/></div><div style={{fontSize:12,color:C.muted,marginBottom:4}}>{d.insight}</div><div style={{fontSize:12,color:"#534AB7",fontWeight:600}}>→ {d.action}</div></div>);})}</div>)}
              {insightTab==="Money Strategies"&&moneyData&&(<div style={{display:"flex",flexDirection:"column",gap:20}}><div><div style={{fontWeight:700,fontSize:13,color:"#3B6D11",marginBottom:10}}>💰 Revenue Growth Opportunities</div>{(moneyData.revenue_growth||[]).map((item,i)=>(<div key={i} style={{background:"#EAF3DE",border:"1px solid #6BAD2E",borderRadius:8,padding:"12px 14px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontWeight:600,fontSize:13,color:"#3B6D11"}}>{item.title}</div><span style={{background:item.impact==="High"?"#3B6D11":item.impact==="Medium"?"#6BAD2E":"#A8D57B",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{item.impact} Impact</span></div><div style={{fontSize:12,color:"#3B6D11",opacity:0.85}}>{item.description}</div></div>))}</div><div><div style={{fontWeight:700,fontSize:13,color:"#185FA5",marginBottom:10}}>✂️ Cost Reduction Strategies</div>{(moneyData.cost_reduction||[]).map((item,i)=>(<div key={i} style={{background:"#E6F1FB",border:"1px solid #4A90D9",borderRadius:8,padding:"12px 14px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontWeight:600,fontSize:13,color:"#185FA5"}}>{item.title}</div><span style={{background:"#185FA5",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>Save {item.saving}</span></div><div style={{fontSize:12,color:"#185FA5",opacity:0.85}}>{item.description}</div></div>))}</div><div><div style={{fontWeight:700,fontSize:13,color:"#7B3FA0",marginBottom:10}}>🆕 New Product / Service Ideas</div>{(moneyData.new_products||[]).map((item,i)=>(<div key={i} style={{background:"#F4EBF9",border:"1px solid #B57FD4",borderRadius:8,padding:"12px 14px",marginBottom:8}}><div style={{fontWeight:600,fontSize:13,color:"#7B3FA0",marginBottom:4}}>{item.title}</div><div style={{fontSize:12,color:"#7B3FA0",opacity:0.85,marginBottom:4}}>{item.description}</div><div style={{fontSize:11,color:"#7B3FA0",fontWeight:600}}>Why now → {item.rationale}</div></div>))}</div></div>)}
            </>
          )}
          {swotData?.error&&<div style={{color:"#A32D2D",fontSize:13,padding:12}}>{swotData.error}</div>}
        </div>
      )}

      {/* ── IMPORT PRODUCTS ── */}
      {tab==="Import Products"&&(
        <div>
          <div style={{marginBottom:16}}><div style={{fontWeight:600,fontSize:15}}>Import Products into StockGuard</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Transfer your existing product list all at once. Imported items merge with your current inventory.</div></div>
          {importStatus==="done"&&mergeStats&&(<div style={{background:"#EAF3DE",border:"1px solid #6BAD2E",borderRadius:10,padding:"20px 24px",marginBottom:16,textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>✅</div><div style={{fontWeight:700,fontSize:15,color:"#3B6D11",marginBottom:4}}>Import Successful!</div><div style={{fontSize:13,color:"#3B6D11",marginBottom:12}}><strong>{mergeStats.total}</strong> products imported — <strong>{mergeStats.added}</strong> new, <strong>{mergeStats.updated}</strong> updated.</div><div style={{display:"flex",gap:8,justifyContent:"center"}}><button onClick={()=>setTab("Dashboard")} style={btn("#3B6D11")}>View inventory</button><button onClick={resetImport} style={btn("#185FA5")}>Import more</button></div></div>)}
          {importStatus!=="done"&&(
            <>
              <div style={{display:"flex",gap:4,marginBottom:18}}>{[["csv","CSV / Excel"],["paste","Paste from Spreadsheet"],["manual","Type Manually"]].map(([k,l])=>(<button key={k} onClick={()=>{setImportTab(k);resetImport();}} style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${C.border}`,background:importTab===k?"#185FA5":"transparent",color:importTab===k?"#fff":C.muted,fontSize:12,cursor:"pointer",fontWeight:importTab===k?600:400}}>{l}</button>))}</div>
              {importTab==="csv"&&importStatus!=="preview"&&(<div><div style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:"32px 20px",textAlign:"center",marginBottom:14,background:C.bg2}}><div style={{fontSize:32,marginBottom:8}}>📂</div><div style={{fontWeight:600,marginBottom:4}}>Upload your CSV file</div><div style={{fontSize:12,color:C.muted,marginBottom:14}}>Supported columns: SKU, Name, Category, Qty, MinQty, Supplier, UnitCost, SellingPrice, Location</div><label style={{...btn("#185FA5"),display:"inline-block",cursor:"pointer"}}>Choose file <input type="file" accept=".csv,.txt" onChange={handleCSVUpload} style={{display:"none"}} /></label></div><div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.muted}}><span>Don't have the right format?</span><button onClick={downloadTemplate} style={{...btn("#0F6E56"),padding:"4px 12px",fontSize:12}}>Download template</button></div></div>)}
              {importTab==="paste"&&importStatus!=="preview"&&(<div><div style={{fontSize:13,color:C.muted,marginBottom:8}}>Copy cells from Excel or Google Sheets (including the header row) and paste below.</div><textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"SKU\tName\tCategory\tQty\tMinQty\tSupplier\tUnitCost\tSellingPrice\tLocation"} style={{...inp,height:160,fontFamily:"monospace",fontSize:12,resize:"vertical"}} /><button onClick={handlePasteParse} style={{...btn("#185FA5"),marginTop:10}}>Preview import</button></div>)}
              {importTab==="manual"&&importStatus!=="preview"&&(<div><div style={{fontSize:13,color:C.muted,marginBottom:10}}>Enter products row by row. SKU and Name are required.</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["SKU","Name","Category","Qty","Min Qty","Supplier","Unit Cost","Sell Price","Location",""].map(h=>(<th key={h} style={{padding:"4px 6px",fontWeight:600,color:C.muted,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{manualRows.map((row,i)=>(<tr key={i}>{["sku","name","category","qty","minQty","supplier","unitCost","sellingPrice","location"].map(f=>(<td key={f} style={{padding:"3px 4px"}}><input value={row[f]||""} onChange={e=>setManualRows(rows=>rows.map((r,j)=>j===i?{...r,[f]:e.target.value}:r))} style={{...inp,fontSize:12,padding:"5px 7px",minWidth:f==="name"?120:70}} placeholder={["qty","minQty","unitCost","sellingPrice"].includes(f)?"0":""} /></td>))}<td style={{padding:"3px 4px"}}><button onClick={()=>setManualRows(rows=>rows.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#A32D2D",cursor:"pointer",fontSize:16}}>x</button></td></tr>))}</tbody></table></div><div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setManualRows(r=>[...r,{sku:"",name:"",category:"",qty:"",minQty:"",supplier:"",unitCost:"",sellingPrice:"",location:""}])} style={{...btn("#0F6E56"),fontSize:12}}>+ Add row</button><button onClick={handleManualParse} style={btn("#185FA5")}>Preview import</button></div></div>)}
              {importErrors.length>0&&(<div style={{background:"#FCEBEB",border:"1px solid #E05A5A",borderRadius:8,padding:"10px 14px",marginTop:12,fontSize:12,color:"#A32D2D"}}><strong>Warnings:</strong> {importErrors.join(" · ")}</div>)}
              {importStatus==="preview"&&importPreview.length>0&&(<div style={{marginTop:16}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontWeight:600,fontSize:13}}>Preview — {importPreview.length} products ready to import</div><div style={{display:"flex",gap:8}}><button onClick={resetImport} style={{...btn("#888"),padding:"6px 12px",fontSize:12}}>Cancel</button><button onClick={confirmMerge} style={btn("#3B6D11")}>Confirm and merge into StockGuard</button></div></div><div style={{overflowX:"auto",maxHeight:320,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["SKU","Name","Category","Qty","Min","Supplier","Cost","Sell","Location","Status"].map(h=>(<th key={h} style={{padding:"6px 8px",fontWeight:600,color:C.muted,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{importPreview.map((item,i)=>{const exists=inventory.find(x=>x.sku===item.sku);return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:exists?"#FAEEDA":"#EAF3DE"}}><td style={{padding:"6px 8px",fontFamily:"monospace"}}>{item.sku}</td><td style={{padding:"6px 8px",fontWeight:600}}>{item.name}</td><td style={{padding:"6px 8px"}}>{item.category}</td><td style={{padding:"6px 8px"}}>{item.qty}</td><td style={{padding:"6px 8px"}}>{item.minQty}</td><td style={{padding:"6px 8px"}}>{item.supplier}</td><td style={{padding:"6px 8px"}}>${item.unitCost}</td><td style={{padding:"6px 8px"}}>{item.sellingPrice?`$${item.sellingPrice}`:"—"}</td><td style={{padding:"6px 8px"}}>{item.location}</td><td style={{padding:"6px 8px"}}><span style={{background:exists?"#FAEEDA":"#EAF3DE",color:exists?"#854F0B":"#3B6D11",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{exists?"Update":"New"}</span></td></tr>);})}</tbody></table></div></div>)}
            </>
          )}
        </div>
      )}

      {/* ── PRICING ── */}
      {tab==="Pricing"&&(
        <div>
          <div style={{textAlign:"center",marginBottom:6}}><p style={{fontSize:12,color:C.muted,marginBottom:16}}>Choose the plan that fits your store</p></div>
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:28}}>
            <span style={{fontSize:13,color:annual?C.muted:C.text,fontWeight:annual?400:600}}>Monthly</span>
            <div onClick={()=>setAnnual(a=>!a)} style={{position:"relative",width:40,height:22,cursor:"pointer",background:annual?"#185FA5":C.border,borderRadius:22,transition:".2s"}}><div style={{position:"absolute",width:16,height:16,left:annual?21:3,top:3,background:"#fff",borderRadius:"50%",transition:".2s"}}/></div>
            <span style={{fontSize:13,color:annual?C.text:C.muted,fontWeight:annual?600:400}}>Annual</span>
            <span style={{fontSize:11,background:"#EAF3DE",color:"#3B6D11",padding:"2px 8px",borderRadius:10,fontWeight:700,border:"1px solid #6BAD2E"}}>Save 20%</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:14}}>
            {PLANS.map((pl,i)=>{
              const p=annual?pl.ap:pl.price;
              const saving=annual&&pl.price>0?`Save $${(pl.price-pl.ap)*12}/yr`:"";
              return (
                <div key={i} style={{background:C.bg,border:pl.featured?`2px solid ${pl.color}`:`1px solid ${C.border}`,borderRadius:14,padding:20,display:"flex",flexDirection:"column"}}>
                  {pl.badge?<span style={{display:"inline-block",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:6,background:pl.badgeBg,color:pl.badgeColor,marginBottom:10,alignSelf:"flex-start"}}>{pl.badge}</span>:<div style={{height:24}}/>}
                  <div style={{fontWeight:600,fontSize:15,color:pl.color,marginBottom:4}}>{pl.name}</div>
                  <div style={{fontSize:34,fontWeight:600,lineHeight:1,color:pl.color,marginBottom:4}}>{p===0?"Free":`$${p}`}{p>0&&<span style={{fontSize:13,fontWeight:400,color:C.muted}}>/mo</span>}</div>
                  <div style={{fontSize:11,color:"#3B6D11",marginBottom:14,minHeight:16}}>{saving}</div>
                  <button style={{display:"block",width:"100%",padding:10,borderRadius:8,border:"none",background:pl.color,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:16}}>{pl.cta}</button>
                  {pl.inc.map((f,j)=><div key={j} style={{display:"flex",gap:6,fontSize:12,padding:"3px 0",color:C.text}}><span style={{color:pl.color,fontWeight:700}}>✓</span>{f}</div>)}
                  {pl.exc.map((f,j)=><div key={j} style={{display:"flex",gap:6,fontSize:12,padding:"3px 0",color:C.muted}}><span>✕</span>{f}</div>)}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}