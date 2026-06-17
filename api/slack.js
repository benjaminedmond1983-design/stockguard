const https = require("https");
const url = require("url");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    return res.status(500).json({ error: "Slack webhook URL not configured" });
  }

  const { item, qty, minQty, supplier, daysLeft } = req.body;
  if (!item) return res.status(400).json({ error: "Missing item data" });

  const isOutOfStock = qty === 0;
  const emoji = isOutOfStock ? "🔴" : "🟡";
  const urgency = isOutOfStock ? "OUT OF STOCK" : "LOW STOCK";
  const color = isOutOfStock ? "#A32D2D" : "#854F0B";

  const fields = [
    { title: "Stock",   value: `${qty} units`,   short: true },
    { title: "Minimum", value: `${minQty} units`, short: true },
  ];
  if (supplier) fields.push({ title: "Supplier", value: supplier, short: true });
  if (daysLeft !== null && daysLeft !== undefined) {
    fields.push({ title: "Days remaining", value: daysLeft <= 0 ? "Stockout imminent" : `~${daysLeft} days`, short: true });
  }

  const action = isOutOfStock
    ? "Reorder immediately to avoid lost sales."
    : "Check the Reorder Centre in StockGuard.";

  const payload = JSON.stringify({
    attachments: [{
      color,
      title: `${emoji} ${urgency} — ${item}`,
      fields,
      footer: `StockGuard · ${action}`,
      ts: Math.floor(Date.now() / 1000),
    }]
  });

  const parsed = url.parse(SLACK_WEBHOOK_URL);

  await new Promise((resolve, reject) => {
    const options = {
      hostname: parsed.hostname,
      path: parsed.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const request = https.request(options, (response) => {
      response.on("data", () => {});
      response.on("end", resolve);
    });
    request.on("error", reject);
    request.write(payload);
    request.end();
  });

  return res.status(200).json({ success: true });
}
