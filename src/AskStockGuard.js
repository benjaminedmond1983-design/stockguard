import React, { useState } from "react";

export default function AskStockGuard({ inventory }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SUGGESTED = [
    "What items should I reorder soon?",
    "Which category has the most inventory?",
    "What are my highest-margin items?",
    "Do I have any dead stock?"
  ];

  const buildContext = () => {
    if (!Array.isArray(inventory) || !inventory.length) return "The store has no inventory items on record.";
    const totalUnits = inventory.reduce((s, i) => s + (Number(i.qty) || 0), 0);
    const low = inventory.filter(i => (Number(i.qty) || 0) <= (Number(i.minQty) || 0));
    const lines = inventory.slice(0, 200).map(i =>
      `- ${i.name || i.sku} (${i.category || "Uncategorized"}): ${i.qty} in stock (min ${i.minQty}), cost $${i.unitCost}, sells $${i.sellingPrice}, supplier ${i.supplier || "unknown"}`
    ).join("\n");
    return `This store carries ${inventory.length} items totaling ${totalUnits} units.\n` +
      (low.length ? `${low.length} item(s) at or below min stock: ${low.map(i => i.name || i.sku).join(", ")}.\n` : "No items below min stock.\n") +
      `Full list:\n${lines}`;
  };

  const ask = async (q) => {
    const text = (q || question).trim();
    if (!text || loading) return;
    setLoading(true); setError(""); setAnswer("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 800, messages: [{ role: "user", content:
          "You are StockGuard's inventory assistant. Answer the store owner's question using ONLY the inventory data below. Be concise and specific — use real item names and numbers. If the data cannot answer it, say so plainly. Respond in plain text only — no markdown, asterisks, or hash symbols.\n\nInventory data:\n" +
          buildContext() + "\n\nOwner's question: " + text }] })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const out = data.content?.find(b => b.type === "text")?.text || "";
      if (!out) throw new Error("Empty response");
      setAnswer(out);
    } catch (e) {
      setError("Something went wrong getting an answer. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 15 }}>Ask StockGuard</div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2, marginBottom: 14 }}>Ask a question about your inventory in plain English.</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") ask(); }}
          placeholder="e.g. What should I reorder this week?"
          disabled={loading}
          style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }} />
        <button onClick={() => ask()} disabled={loading || !question.trim()}
          style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: loading || !question.trim() ? 0.6 : 1 }}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {SUGGESTED.map(q => (
          <button key={q} disabled={loading} onClick={() => { setQuestion(q); ask(q); }}
            style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "#444" }}>{q}</button>
        ))}
      </div>
      {error && <div style={{ background: "#FCEBEB", border: "1px solid #E05A5A", color: "#A32D2D", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>{error}</div>}
      {answer && (
        <div style={{ background: "#F4F2FF", border: "1px solid #B7AEE8", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "#534AB7", textTransform: "uppercase", marginBottom: 6 }}>Answer</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{answer}</div>
        </div>
      )}
    </div>
  );
}
