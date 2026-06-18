import React, { useState } from 'react';

const NAVY = '#1B2B4B';
const BG = '#EEF2F7';

const TAB_GUIDE = [
  { id: 'dashboard', name: 'Dashboard', role: 'Owner & Cashier', description: "Your home base. One screen shows today's sales total, your live inventory health score, any active low-stock alerts, and a 7-day revenue chart.", actions: ['View the 7-day revenue chart and top sellers','Check the inventory health score at a glance','See active low-stock alerts before they become stockouts','Jump to any other tab from the quick links'], tip: "Check this first thing each morning — it's the fastest way to catch a problem before it becomes a stockout." },
  { id: 'receiving', name: 'Receiving', role: 'Owner & Cashier', description: 'Where you log new stock arriving from a supplier — a delivery, a shipment, a restock.', actions: ['Record the quantity received for each product','Stock levels update automatically once you save','Link a delivery to an existing purchase order'], tip: 'Always receive stock here instead of editing inventory counts directly — it keeps your audit trail accurate.' },
  { id: 'movements', name: 'Movements', role: 'Owner & Cashier', description: 'A running log of every time stock changes hands: sales, receiving, manual adjustments, damage write-offs.', actions: ['Filter by product, date, or movement type','See exactly who made each change and when','Spot unusual activity before it becomes a bigger issue'], tip: "If a stock number looks wrong, check Movements first — it almost always tells you exactly what happened." },
  { id: 'sales', name: 'Sales', role: 'Owner & Cashier', description: 'Record and review sales transactions as they happen.', actions: ['Log a new sale','View daily and weekly sales totals','See top-selling products','Export sales data to CSV'], tip: 'Add a staff note on unusual sales (bulk discount, damaged item) so the numbers still make sense later.' },
  { id: 'reorder', name: 'Reorder Center', role: 'Owner', description: 'Tells you what to reorder, how much, and from which supplier — before you run out, not after.', actions: ['View AI-suggested reorder quantities per product','Generate a purchase order directly from a suggestion','Snooze or dismiss a recommendation'], tip: "This is StockGuard's core value. Don't just glance at stock levels — let the Reorder Center tell you when to act." },
  { id: 'purchase-orders', name: 'Purchase Orders', role: 'Owner', description: 'Create, track, and manage purchase orders sent to your suppliers.', actions: ['Generate a new purchase order','Edit line items and quantities','Mark a PO as received (this feeds Receiving automatically)','Export a PO as a PDF or CSV'], tip: 'Generate POs straight from Reorder Center suggestions — it saves time and avoids typos in quantities.' },
  { id: 'suppliers', name: 'Suppliers', role: 'Owner', description: 'Your supplier directory, contact details, and reliability scorecards.', actions: ['Add or edit supplier contact details and lead times','View reliability ratings per supplier','Compare multiple suppliers for the same product'], tip: 'Keep lead times accurate here — they directly drive your reorder timing and stockout predictions.' },
  { id: 'audit-trail', name: 'Audit Trail', role: 'Owner', description: 'A permanent record of every edit and delete made anywhere in StockGuard.', actions: ['Filter by user, action type, or date','See exactly what changed and who changed it'], tip: 'Use this to spot-check staff activity or to recover the details of an accidental edit.' },
  { id: 'intelligence', name: 'Intelligence', role: 'Owner', description: 'Your supply chain risk view — including the Single Point of Failure detector and geographic supplier risk.', actions: ['View Single Point of Failure warnings','See which products depend too heavily on one supplier','Get AI-suggested backup suppliers'], tip: 'Treat a SPOF warning as a priority — it flags the kind of risk that causes the worst stockouts.' },
  { id: 'business-insights', name: 'Business Insights', role: 'Owner', description: 'Plain-English analysis of your inventory and sales data, generated on demand and powered by the Anthropic API.', actions: ['Request a fresh insight on current data','Ask follow-up questions in your own words','Review past insights'], tip: "Ask it something specific — \"why did Product X slow down this week?\" — it's built to dig into specifics, not just summarize." },
  { id: 'automations', name: 'Automations', role: 'Owner', description: "Rules that run without you — like a Slack alert the moment stock drops below a threshold.", actions: ['Turn Slack low-stock alerts on or off','Set the stock threshold that triggers an alert'], tip: 'Set thresholds a little above your real minimum — it buys you a few days to act before you actually run out.' },
  { id: 'import-products', name: 'Import Products', role: 'Owner', description: 'Bulk-add or update your product catalog from a spreadsheet instead of typing each item in.', actions: ['Upload a CSV file','Map spreadsheet columns to StockGuard fields','Review and confirm before the import runs'], tip: 'Run a small test import (5-10 rows) first to confirm your column mapping before importing the full catalog.' },
  { id: 'pricing', name: 'Pricing', role: 'Owner', description: 'Manage your StockGuard subscription tier and see what each tier unlocks.', actions: ['View your current plan and usage','Upgrade or downgrade your plan','Compare features across Starter, Growth, and Pro'], tip: 'The AI features — Insights, Reorder Center, the SPOF detector — live on Pro. Worth it once you have real volume moving.' },
  { id: 'shopify', name: 'Shopify', role: 'Owner', description: 'Connect your Shopify store so online sales update your StockGuard inventory automatically.', actions: ['Connect or disconnect your Shopify store','Trigger a manual sync','View the status of your last sync'], tip: 'Right after connecting, run one manual sync and spot-check a few products to confirm the mapping is correct.' },
];

const ROLE_STYLES = {
  Owner: { bg: '#FDF1E7', text: '#9A5B13' },
  'Owner & Cashier': { bg: '#E8F3EC', text: '#2A7349' },
};

export default function HelpPanel() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(TAB_GUIDE[0].id);
  const active = TAB_GUIDE.find((t) => t.id === activeId);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open StockGuard help guide"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 48, height: 48, borderRadius: '50%', background: NAVY, color: '#fff', border: 'none', fontSize: 20, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(27,43,75,0.35)', zIndex: 1000 }}
      >
        ?
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1001, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(720px, 100%)', height: '100%', background: BG, boxShadow: '-8px 0 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', animation: 'sg-help-slide-in 0.22s ease-out' }}>
            <style>{`
              @keyframes sg-help-slide-in {
                from { transform: translateX(40px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>

            <div style={{ background: NAVY, color: '#fff', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>StockGuard Help Guide</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>What every tab does, and how to use it</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close help guide" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <nav style={{ width: 200, flexShrink: 0, background: NAVY, overflowY: 'auto', padding: '12px 8px' }}>
                {TAB_GUIDE.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveId(tab.id)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', marginBottom: 2, borderRadius: 8, border: 'none', fontSize: 13, cursor: 'pointer', background: activeId === tab.id ? 'rgba(255,255,255,0.16)' : 'transparent', color: activeId === tab.id ? '#fff' : 'rgba(255,255,255,0.65)', fontWeight: activeId === tab.id ? 500 : 400 }}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>

              <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 600, color: '#1A1A2E', margin: 0 }}>{active.name}</h3>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: ROLE_STYLES[active.role].bg, color: ROLE_STYLES[active.role].text }}>{active.role}</span>
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.55, color: '#3A4357', marginBottom: 20 }}>{active.description}</p>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A93A6', marginBottom: 10 }}>What you can do here</div>
                <ul style={{ paddingLeft: 18, marginBottom: 22 }}>
                  {active.actions.map((a) => (
                    <li key={a} style={{ fontSize: 13.5, color: '#3A4357', marginBottom: 6, lineHeight: 1.5 }}>{a}</li>
                  ))}
                </ul>

                <div style={{ background: '#fff', border: `1px solid ${NAVY}22`, borderLeft: `3px solid ${NAVY}`, borderRadius: 8, padding: '14px 16px', fontSize: 13, lineHeight: 1.5, color: '#1A1A2E' }}>
                  <strong>Tip:</strong> {active.tip}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: '#8A93A6', padding: '10px 0', borderTop: '1px solid rgba(27,43,75,0.08)' }}>
              Proverbs 16:3
            </div>
          </div>
        </div>
      )}
    </>
  );
}
