export function useSlack() {

  async function sendSlackAlert({ item, qty, minQty, supplier, daysLeft }) {
    try {
      const res = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, qty, minQty, supplier, daysLeft }),
      });
      const data = await res.json();
      return data.success === true;
    } catch (err) {
      console.error("Slack alert failed:", err);
      return false;
    }
  }

  async function sendLowStockAlerts(inventory, audit) {
    const lowItems = inventory.filter(i => i.qty < i.minQty);
    if (!lowItems.length) return;
    for (const item of lowItems) {
      const sold = audit.filter(a => a.action === "Sold" && a.sku === item.sku);
      const dailyRate = sold.length ? sold.reduce((s, a) => s + a.qty, 0) / 7 : 0;
      const daysLeft = dailyRate > 0 ? Math.floor(item.qty / dailyRate) : null;
      await sendSlackAlert({ item: item.name, qty: item.qty, minQty: item.minQty, supplier: item.supplier, daysLeft });
    }
  }

  return { sendSlackAlert, sendLowStockAlerts };
}
