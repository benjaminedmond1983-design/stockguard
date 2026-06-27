import React, { useState, useEffect } from 'react';

const sidebarColor = '#1B2B4B';
const green = '#10b981';
const red = '#ef4444';

export default function SquareTab({ supabase, userId }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/square?action=locations');
      const data = await res.json();
      if (data.locations && data.locations.length > 0) {
        setConnected(true);
        setLocations(data.locations);
        setSelectedLocation(data.locations[0].id);
      }
    } catch (err) {
      setConnected(false);
    }
  };

  const handleSyncInventory = async () => {
    setStatus('syncing');
    setMessage('Fetching products from Square...');
    setSyncResult(null);
    try {
      const res = await fetch('/api/square?action=sync-inventory');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncResult({ type: 'inventory', count: data.count, items: data.items });
      setMessage(`✓ Found ${data.count} products in your Square catalog.`);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setStatus('idle');
  };

  const handleSyncSales = async () => {
    setStatus('syncing');
    setMessage('Fetching recent sales from Square...');
    setSyncResult(null);
    try {
      const res = await fetch('/api/square?action=sync-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: selectedLocation }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSyncResult({ type: 'sales', count: data.count });
      setMessage(`✓ Synced ${data.count} orders from Square (last 30 days).`);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setStatus('idle');
  };

  return (
    <div style={{ padding: '24px', maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: sidebarColor }}>
        Square Integration
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>
        Sync your Square POS inventory and sales with StockGuard.
      </p>

      {/* Connection status */}
      <div style={{ background: connected ? '#f0fdf4' : '#f8fafc', border: `1px solid ${connected ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? green : '#94a3b8', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, color: sidebarColor, fontSize: 14 }}>
            {connected ? 'Square Connected' : 'Connecting to Square...'}
          </p>
          {connected && locations.length > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{locations.length} location{locations.length !== 1 ? 's' : ''} found</p>
          )}
        </div>
        <button onClick={checkConnection} style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${sidebarColor}`, background: '#fff', color: sidebarColor, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {/* Location selector */}
      {connected && locations.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: sidebarColor, display: 'block', marginBottom: 6 }}>Select Location</label>
          <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, width: '100%', maxWidth: 300 }}>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sync actions */}
      {connected && (
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: sidebarColor }}>Sync Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={handleSyncInventory} disabled={status === 'syncing'}
              style={{ padding: '11px 24px', borderRadius: 8, border: 'none', background: status === 'syncing' ? '#94a3b8' : sidebarColor, color: '#fff', fontWeight: 600, fontSize: 14, cursor: status === 'syncing' ? 'not-allowed' : 'pointer' }}>
              {status === 'syncing' ? 'Syncing...' : '⬇ Import Square Products'}
            </button>
            <button onClick={handleSyncSales} disabled={status === 'syncing'}
              style={{ padding: '11px 24px', borderRadius: 8, border: `1.5px solid ${sidebarColor}`, background: '#fff', color: sidebarColor, fontWeight: 600, fontSize: 14, cursor: status === 'syncing' ? 'not-allowed' : 'pointer' }}>
              {status === 'syncing' ? 'Syncing...' : '⬇ Import Square Sales'}
            </button>
          </div>

          {message && (
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4', color: message.startsWith('Error') ? red : '#166534', fontSize: 13, fontWeight: 500 }}>
              {message}
            </div>
          )}

          {syncResult && syncResult.type === 'inventory' && syncResult.items?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: sidebarColor, fontSize: 14 }}>Products found in Square:</p>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                {syncResult.items.slice(0, 10).map((item, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: '#64748b' }}>{item.sku ? `SKU: ${item.sku}` : ''} ${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!connected && (
        <div style={{ marginTop: 8, padding: '16px', background: '#fefce8', borderRadius: 8, border: '1px solid #fde68a' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>Unable to connect to Square. Make sure your Square credentials are configured correctly.</p>
        </div>
      )}
    </div>
  );
}
