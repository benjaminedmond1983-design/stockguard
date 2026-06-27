export const OWNER_TABS = [
  "Dashboard", "Receiving", "Movements", "Sales",
  "Reorder Center", "Purchase Orders", "Suppliers", "Audit Trail",
  "Intelligence", "Business Insights", "Automations", "Import Products", "Pricing", "shopify", "Shopify", "quickbooks", "QuickBooks", "square", "Square", "billing"
];

export const CASHIER_TABS = ["Sales", "Receiving", "Movements", "Reorder Center"];

export const INIT_INVENTORY = [
  { id: 1, sku: "SKU-001", name: "Blue Denim Jeans",   category: "Apparel",     qty: 8,  minQty: 15, supplier: "DenimCo",     unitCost: 24.5,  sellingPrice: 59.99, location: "Aisle A1" },
  { id: 2, sku: "SKU-002", name: "White Sneakers",     category: "Footwear",    qty: 22, minQty: 10, supplier: "SoleSupply",   unitCost: 38.0,  sellingPrice: 89.99, location: "Aisle B2" },
  { id: 3, sku: "SKU-003", name: "Wireless Earbuds",   category: "Electronics", qty: 5,  minQty: 20, supplier: "TechGear Inc", unitCost: 55.0,  sellingPrice: 99.99, location: "Aisle C1" },
  { id: 4, sku: "SKU-004", name: "Cotton T-Shirt",     category: "Apparel",     qty: 3,  minQty: 25, supplier: "FabricWorld",  unitCost: 9.0,   sellingPrice: 24.99, location: "Aisle A2" },
  { id: 5, sku: "SKU-005", name: "Leather Wallet",     category: "Accessories", qty: 18, minQty: 10, supplier: "LeatherCraft", unitCost: 17.5,  sellingPrice: 44.99, location: "Aisle D1" },
  { id: 6, sku: "SKU-006", name: "Running Shorts",     category: "Apparel",     qty: 6,  minQty: 20, supplier: "FabricWorld",  unitCost: 12.0,  sellingPrice: 34.99, location: "Aisle A3" },
  { id: 7, sku: "SKU-007", name: "USB-C Cable",        category: "Electronics", qty: 45, minQty: 30, supplier: "TechGear Inc", unitCost: 5.5,   sellingPrice: 14.99, location: "Aisle C2" },
  { id: 8, sku: "SKU-008", name: "Baseball Cap",       category: "Accessories", qty: 2,  minQty: 12, supplier: "CapMakers",    unitCost: 8.0,   sellingPrice: 24.99, location: "Aisle D2" },
];

export const PLANS = [
  { name:"Starter", color:"#185FA5", price:0, ap:0, cta:"Start for free", badge:null,
    inc:["Up to 25 SKUs","1 user account","Receiving and sales log","Low stock alerts","CSV import"],
    exc:["Profit margin tracking","CSV export","AI reorder analysis","Daily sales summary","Business Insights", "Shopify integration"] },
  { name:"Growth", color:"#3B6D11", price:29, ap:23, cta:"Start 14-Day Free Trial", badge:"Most popular",
    badgeBg:"#EAF3DE", badgeColor:"#3B6D11", featured:true,
    inc:["Up to 500 SKUs","3 users","Everything in Starter","Profit margin tracking","CSV export","AI reorder analysis","Daily sales summary + 7-day chart"],
    exc:["Business Insights","Intelligence module","Priority support","Custom branding","Shopify integration"] },
  { name:"Pro", color:"#534AB7", price:79, ap:63, cta:"Start 14-Day Free Trial", badge:"Best value",
    badgeBg:"#EEEDFE", badgeColor:"#534AB7",
    inc:["Unlimited SKUs","10 users","Everything in Growth","Business Insights","Intelligence module","Shopify integration","Priority support","Custom branding"],
    exc:[] },
];

export const TAB_ICONS = {
  "Dashboard":"ti-layout-dashboard","Receiving":"ti-package","Movements":"ti-arrows-transfer-up",
  "Sales":"ti-receipt","Reorder Center":"ti-bell","Purchase Orders":"ti-file-invoice",
  "Suppliers":"ti-building-factory","Audit Trail":"ti-clipboard-list","Intelligence":"ti-brain",
  "Business Insights":"ti-chart-bar","Automations":"ti-robot","Import Products":"ti-file-upload",
  "Pricing":"ti-credit-card"
};

export const TAB_COLORS = {
  "Dashboard":"#185FA5","Receiving":"#0F6E56","Movements":"#534AB7","Sales":"#A32D2D",
  "Reorder Center":"#854F0B","Purchase Orders":"#185FA5","Suppliers":"#0F6E56",
  "Audit Trail":"#444441","Intelligence":"#0D7E6E","Business Insights":"#534AB7",
  "Automations":"#7B3FA0","Import Products":"#185FA5","Pricing":"#3B6D11"
};

export const SIDEBAR_W = 200;
export const ADD_CATEGORY_VALUE = "__add_category__";
export const C = { bg:"#ffffff", bg2:"#f5f5f5", text:"#111111", muted:"#666666", border:"#e0e0e0" };
export const CSV_TEMPLATE = `SKU,Name,Category,Qty,MinQty,Supplier,UnitCost,SellingPrice,Location\nSKU-101,Sample Product,Apparel,50,10,My Supplier,19.99,49.99,Aisle A1`;
export const SIDEBAR = "#1B2B4B";
