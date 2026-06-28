
import { C } from "./constants";

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function shortDate(ds) {
  const [,,day] = ds.split("-");
  const d = new Date(ds + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday:"short" }) + " " + parseInt(day);
}

export function nowStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export function statusBadge(qty, min) {
  if (qty === 0) return { label:"Out of stock", bg:"#FCEBEB", color:"#A32D2D" };
  if (qty < min * 0.3) return { label:"Critical", bg:"#FCEBEB", color:"#A32D2D" };
  if (qty < min) return { label:"Low", bg:"#FAEEDA", color:"#854F0B" };
  return { label:"OK", bg:"#EAF3DE", color:"#3B6D11" };
}

export function marginBadge(cost, sell) {
  if (!sell || sell <= cost) return { label:"No margin", pct:0, profit:0, bg:"#F5F5F5", color:"#888" };
  const profit = sell - cost, pct = (profit / sell) * 100;
  if (pct >= 40) return { label:`${pct.toFixed(0)}%`, pct, profit, bg:"#EAF3DE", color:"#3B6D11" };
  if (pct >= 20) return { label:`${pct.toFixed(0)}%`, pct, profit, bg:"#FAEEDA", color:"#854F0B" };
  return { label:`${pct.toFixed(0)}%`, pct, profit, bg:"#FCEBEB", color:"#A32D2D" };
}

export function parseRows(rows) {
  const errors = [];
  const parsed = rows.map((r, i) => {
    const sku = (r.sku||r.SKU||"").toString().trim();
    const name = (r.name||r.Name||r["Item Name"]||r["Product Name"]||r["item"]||"").toString().trim();
    const qty = parseInt(r.qty||r.Qty||r.Quantity||r.quantity||0);
    const minQty = parseInt(r.minQty||r["Min Qty"]||r["min qty"]||r.minimum||10);
    const unitCost = parseFloat(r.unitCost||r["Unit Cost"]||r.cost||r.Cost||r.price||r.Price||0);
    const sellingPrice = parseFloat(r.sellingPrice||r["Selling Price"]||r.sell||r.Sell||r.retail||0);
    if (!sku) errors.push(`Row ${i+1}: Missing SKU`);
    if (!name) errors.push(`Row ${i+1}: Missing item name`);
    return {
      sku, name,
      category: (r.category||r.Category||"General").toString().trim(),
      qty: isNaN(qty) ? 0 : qty,
      minQty: isNaN(minQty) ? 10 : minQty,
      supplier: (r.supplier||r.Supplier||"—").toString().trim(),
      unitCost: isNaN(unitCost) ? 0 : unitCost,
      sellingPrice: isNaN(sellingPrice) ? 0 : sellingPrice,
      location: (r.location||r.Location||"—").toString().trim()
    };
  }).filter(r => r.sku && r.name);
  return { parsed, errors };
}

export function buildInitAudit() {
  return [
    {id:1,time:`${dateStr(6)} 09:12`,action:"Received",item:"Blue Denim Jeans",qty:20,user:"Maria L.",note:"PO-2201",sku:"SKU-001",revenue:0,profit:0},
    {id:2,time:`${dateStr(6)} 10:45`,action:"Sold",item:"Wireless Earbuds",qty:3,user:"James K.",note:"INV-5541",sku:"SKU-003",revenue:299.97,profit:134.97},
    {id:3,time:`${dateStr(5)} 11:20`,action:"Sold",item:"White Sneakers",qty:2,user:"Staff",note:"INV-5542",sku:"SKU-002",revenue:179.98,profit:103.98},
    {id:4,time:`${dateStr(5)} 14:30`,action:"Sold",item:"Cotton T-Shirt",qty:4,user:"Staff",note:"INV-5543",sku:"SKU-004",revenue:99.96,profit:63.96},
    {id:5,time:`${dateStr(4)} 09:00`,action:"Sold",item:"Leather Wallet",qty:3,user:"Maria L.",note:"INV-5544",sku:"SKU-005",revenue:134.97,profit:82.47},
    {id:6,time:`${dateStr(4)} 15:10`,action:"Sold",item:"USB-C Cable",qty:6,user:"Staff",note:"INV-5545",sku:"SKU-007",revenue:89.94,profit:56.94},
    {id:7,time:`${dateStr(3)} 10:00`,action:"Sold",item:"Blue Denim Jeans",qty:2,user:"James K.",note:"INV-5546",sku:"SKU-001",revenue:119.98,profit:70.98},
    {id:8,time:`${dateStr(3)} 13:45`,action:"Sold",item:"Baseball Cap",qty:5,user:"Staff",note:"INV-5547",sku:"SKU-008",revenue:124.95,profit:84.95},
    {id:9,time:`${dateStr(2)} 09:30`,action:"Sold",item:"Running Shorts",qty:3,user:"Maria L.",note:"INV-5548",sku:"SKU-006",revenue:104.97,profit:68.97},
    {id:10,time:`${dateStr(2)} 14:00`,action:"Sold",item:"White Sneakers",qty:1,user:"Staff",note:"INV-5549",sku:"SKU-002",revenue:89.99,profit:51.99},
    {id:11,time:`${dateStr(1)} 10:15`,action:"Sold",item:"Wireless Earbuds",qty:2,user:"James K.",note:"INV-5550",sku:"SKU-003",revenue:199.98,profit:89.98},
    {id:12,time:`${dateStr(1)} 16:00`,action:"Sold",item:"USB-C Cable",qty:8,user:"Staff",note:"INV-5551",sku:"SKU-007",revenue:119.92,profit:75.92},
    {id:13,time:`${dateStr(0)} 09:00`,action:"Sold",item:"Blue Denim Jeans",qty:1,user:"Maria L.",note:"INV-5552",sku:"SKU-001",revenue:59.99,profit:35.49},
    {id:14,time:`${dateStr(0)} 11:30`,action:"Sold",item:"Leather Wallet",qty:2,user:"Staff",note:"INV-5553",sku:"SKU-005",revenue:89.98,profit:54.98},
    {id:15,time:`${dateStr(0)} 14:20`,action:"Reordered",item:"Baseball Cap",qty:50,user:"Maria L.",note:"PO-2205 sent",sku:"",revenue:0,profit:0},
  ];
}

export const inp = {
  padding:"7px 10px", borderRadius:6, border:`1px solid ${C.border}`,
  background:C.bg, color:C.text, fontSize:13, width:"100%", boxSizing:"border-box"
};

export const btn = (bg) => ({
  padding:"7px 14px", borderRadius:6, border:"none",
  background:bg, color:"#fff", fontSize:13, cursor:"pointer", fontWeight:500
});

export const SG_LOGO = (
  <img src={require('../assets/logo.png')} alt="StockGuard" style={{width:'120px', display:'block', opacity:'1'}} />
);