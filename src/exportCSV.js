export function exportCSV(type, inventory, audit) {
  let rows = [], filename = "";
  if (type === "inventory") {
    filename = "stockguard_inventory.csv";
    rows = [["SKU","Name","Category","Qty","Min","Cost","Sell","Location"],
      ...inventory.map(i => [i.sku,i.name,i.category,i.qty,i.minQty,i.unitCost,i.sellingPrice||"",i.location])];
  } else if (type === "sales") {
    filename = "stockguard_sales.csv";
    const s = audit.filter(a => a.action === "Sold");
    if (!s.length) { alert("No sales recorded yet."); return; }
    rows = [["Date","Item","Qty","Revenue","Profit","User","Invoice"],
      ...s.map(a => [a.time,a.item,a.qty,a.revenue||0,a.profit||0,a.user,a.note])];
  } else {
    filename = "stockguard_audit.csv";
    rows = [["Time","Action","Item","Qty","User","Note"],
      ...audit.map(a => [a.time,a.action,a.item,a.qty,a.user,a.note])];
  }
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
