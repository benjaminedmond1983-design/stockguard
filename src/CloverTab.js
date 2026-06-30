import React, { useState, useEffect } from 'react';

const CLOVER_APP_ID = 'JE2VB1N7R9K8M';
const CLOVER_BASE = 'https://sandbox.dev.clover.com';
const C = { bg:"#ffffff", bg2:"#f5f5f5", text:"#111111", muted:"#666666", border:"#e0e0e0" };
const btn = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:6, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" });

export default function CloverTab({ inventory, onUpdateInventory, userId, supabase }) {
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [cloverItems, setCloverItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState([]);
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ct = params.get('clover_token');
    const mid = params.get('clover_mid');
    const cc = params.get('clover_connected');
    if (ct && mid && cc) {
      setToken(ct); setMerchantId(mid); setConnected(true);
      localStorage.setItem('clover_token', ct);
      localStorage.setItem('clover_mid', mid);
      window.history.replaceState({}, '', window.location.pathname);
      loadMerchantInfo(ct, mid);
      loadCloverInventory(ct, mid);
    } else {
      const savedToken = localStorage.getItem('clover_token');
      const savedMid = localStorage.getItem('clover_mid');
      if (savedToken && savedMid) {
        setToken(savedToken); setMerchantId(savedMid); setConnected(true);
        loadMerchantInfo(savedToken, savedMid);
        loadCloverInventory(savedToken, savedMid);
      }
    }
  }, []);

  async function loadMerchantInfo(t, mid) {
    try {
      const r = await fetch(`/api/clover?action=merchant&token=${t}&merchant_id=${mid}`);
      const data = await r.json();
      if (data.name) setMerchantName(data.name);
    } catch (e) {}
  }

  async function loadCloverInventory(t, mid) {
    setLoading(true); setError('');
    try {
      const r = await fetch(`/api/clover?action=inventory&token=${t}&merchant_id=${mid}`);
      const data = await r.json();
      if (data.elements) setCloverItems(data.elements);
      else setError('Could not load Clover inventory. ' + (data.message || ''));
    } catch (e) { setError('Failed to connect to Clover: ' + e.message); }
    setLoading(false);
  }

  function connectClover() {
    const redirectUri = encodeURIComponent('https://app.getstockguard.com/api/clover?callback');
    window.location.href = `${CLOVER_BASE}/oauth/authorize?client_id=${CLOVER_APP_ID}&redirect_uri=${redirectUri}`;
  }

  function disconnect() {
    localStorage.removeItem('clover_token'); localStorage.removeItem('clover_mid');
    setConnected(false); setToken(''); setMerchantId(''); setMerchantName('');
    setCloverItems([]); setSyncLog([]);
  }

  async function syncToStockGuard() {
    setSyncing(true); setSyncLog([]);
    const log = []; let imported = 0;
    for (const item of cloverItems) {
      const name = item.name || 'Unknown';
      const price = item.price ? (item.price / 100) : 0;
      const stock = item.itemStock?.quantity || 0;
      const sku = item.id;
      const existing = inventory.find(i => i.sku === sku || i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        log.push({ status: 'skip', msg: `${name} — already exists in StockGuard` });
      } else {
        const newItem = {
          id: Date.now() + Math.random(), sku: sku.substring(0, 12), name,
          category: item.category?.name || 'Clover Import', qty: Math.round(stock),
          minQty: 5, supplier: 'Clover', unitCost: (price * 0.6).toFixed(2),
          sellingPrice: price.toFixed(2), location: 'Clover POS',
        };
        if (onUpdateInventory) onUpdateInventory(prev => [...prev, newItem]);
        imported++;
        log.push({ status: 'ok', msg: `${name} — imported (qty: ${Math.round(stock)}, price: $${price.toFixed(2)})` });
      }
      setSyncLog([...log]);
    }
    log.push({ status: 'done', msg: `Sync complete — ${imported} items imported` });
    setSyncLog([...log]); setLastSynced(new Date().toLocaleTimeString()); setSyncing(false);
  }

  async function pushStockToClover() {
    setSyncing(true); setSyncLog([]);
    const log = []; let updated = 0;
    for (const item of cloverItems) {
      const sgItem = inventory.find(i => i.sku === item.id.substring(0, 12) || i.name.toLowerCase() === item.name?.toLowerCase());
      if (sgItem) {
        try {
          await fetch('/api/clover?action=update_stock', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, merchant_id: merchantId, item_id: item.id, quantity: sgItem.qty })
          });
          updated++;
          log.push({ status: 'ok', msg: `${item.name} — updated to qty ${sgItem.qty}` });
        } catch (e) { log.push({ status: 'error', msg: `${item.name} — failed: ${e.message}` }); }
      }
      setSyncLog([...log]);
    }
    log.push({ status: 'done', msg: `Push complete — ${updated} items updated in Clover` });
    setSyncLog([...log]); setLastSynced(new Date().toLocaleTimeString()); setSyncing(false);
  }

  if (!connected) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍀</div>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Connect Clover POS</div>
        <div style={{ color: C.muted, fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Sync your Clover inventory with StockGuard. Import items from Clover or push stock updates back to your POS.
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontWeight: 600, color: '#166534', marginBottom: 8 }}>What syncs:</div>
          <div style={{ fontSize: 13, color: '#15803d', lineHeight: 1.8 }}>
            ✓ Import Clover items → StockGuard<br/>
            ✓ Push stock quantities → Clover POS<br/>
            ✓ Item names, prices, and stock levels
          </div>
        </div>
        <button onClick={connectClover} style={{ ...btn('#22c55e'), fontSize: 15, padding: '12px 32px' }}>
          🍀 Connect Clover Account
        </button>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>You will be redirected to Clover to authorize access</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>🍀 Clover POS</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
            {merchantName ? `Connected to ${merchantName}` : 'Connected'} · {cloverItems.length} items
            {lastSynced && ` · Last synced ${lastSynced}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => loadCloverInventory(token, merchantId)} disabled={loading} style={btn('#185FA5')}>
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
          <button onClick={disconnect} style={{ ...btn('#888'), fontSize: 13 }}>Disconnect</button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>📥 Import from Clover</div>
          <div style={{ fontSize: 13, color: '#15803d', marginBottom: 16 }}>Pull items from your Clover POS into StockGuard inventory.</div>
          <button onClick={syncToStockGuard} disabled={syncing || loading || cloverItems.length === 0} style={{ ...btn('#22c55e'), opacity: (syncing || loading) ? 0.6 : 1 }}>
            {syncing ? 'Syncing...' : `Import ${cloverItems.length} Items`}
          </button>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>📤 Push Stock to Clover</div>
          <div style={{ fontSize: 13, color: '#1d4ed8', marginBottom: 16 }}>Update stock quantities in Clover POS from StockGuard.</div>
          <button onClick={pushStockToClover} disabled={syncing || loading || cloverItems.length === 0} style={{ ...btn('#185FA5'), opacity: (syncing || loading) ? 0.6 : 1 }}>
            {syncing ? 'Pushing...' : 'Push Stock Levels'}
          </button>
        </div>
      </div>

      {syncLog.length > 0 && (
        <div style={{ background: '#1e1e2e', borderRadius: 10, padding: '16px 20px', marginBottom: 24, maxHeight: 200, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>Sync Log</div>
          {syncLog.map((l, i) => (
            <div key={i} style={{ fontSize: 12, fontFamily: 'monospace', color: l.status === 'ok' ? '#4ade80' : l.status === 'error' ? '#f87171' : l.status === 'done' ? '#60a5fa' : '#888', marginBottom: 2 }}>
              {l.status === 'ok' ? '✓' : l.status === 'error' ? '✗' : l.status === 'done' ? '★' : '–'} {l.msg}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Clover Inventory ({cloverItems.length} items)</div>
        {loading ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: 32 }}>Loading Clover inventory...</div>
        ) : cloverItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: 32 }}>No items found in Clover</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Item Name', 'Price', 'Stock', 'Category', 'In StockGuard'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Price' || h === 'Stock' ? 'right' : 'left', color: C.muted, fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cloverItems.map((item, i) => {
                  const price = item.price ? (item.price / 100).toFixed(2) : '0.00';
                  const stock = item.itemStock?.quantity || 0;
                  const inSG = inventory.find(inv => inv.sku === item.id.substring(0, 12) || inv.name.toLowerCase() === item.name?.toLowerCase());
                  return (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{item.name || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>${price}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>{Math.round(stock)}</td>
                      <td style={{ padding: '10px 12px', color: C.muted }}>{item.category?.name || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {inSG ? (
                          <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>✓ Synced</span>
                        ) : (
                          <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>Not imported</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
