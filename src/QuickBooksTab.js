import React, { useState, useEffect } from 'react';

const sidebarColor = '#1B2B4B';
const green = '#10b981';
const red = '#ef4444';

export default function QuickBooksTab({ supabase, userId }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [realmId, setRealmId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    // Check if returning from QB OAuth callback
    const params = new URLSearchParams(window.location.search);
    const qbToken = params.get('qb_access_token');
    const qbRefresh = params.get('qb_refresh_token');
    const qbRealm = params.get('qb_realm_id');
    if (qbToken && qbRealm) {
      setAccessToken(qbToken);
      setRealmId(qbRealm);
      setConnected(true);
      localStorage.setItem('qb_access_token', qbToken);
      localStorage.setItem('qb_refresh_token', qbRefresh);
      localStorage.setItem('qb_realm_id', qbRealm);
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
      setMessage('QuickBooks connected successfully!');
    } else {
      // Check localStorage for existing connection
      const storedToken = localStorage.getItem('qb_access_token');
      const storedRealm = localStorage.getItem('qb_realm_id');
      if (storedToken && storedRealm) {
        setAccessToken(storedToken);
        setRealmId(storedRealm);
        setConnected(true);
      }
    }
  }, []);

  const handleConnect = () => {
    window.location.href = '/api/quickbooks?action=connect';
  };

  const handleDisconnect = () => {
    if (!window.confirm('Disconnect QuickBooks? Your StockGuard data will remain.')) return;
    localStorage.removeItem('qb_access_token');
    localStorage.removeItem('qb_refresh_token');
    localStorage.removeItem('qb_realm_id');
    setConnected(false);
    setAccessToken('');
    setRealmId('');
    setSyncResult(null);
    setMessage('Disconnected from QuickBooks.');
  };

  const handleSyncSales = async () => {
    setStatus('syncing');
    setMessage('Fetching sales from StockGuard...');
    setSyncResult(null);
    try {
      // Pull sales from Supabase
      const { data: sales, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', userId)
        .eq('action', 'Sold')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      if (!sales || sales.length === 0) {
        setMessage('No sales found to sync.');
        setStatus('idle');
        return;
      }
      setMessage(`Syncing ${sales.length} sales to QuickBooks...`);
      const formattedSales = sales.map(s => ({
        sku: s.sku || 'ITEM',
        quantity: s.qty || 1,
        unit_price: s.qty ? (s.revenue || 0) / s.qty : 0,
        total: s.revenue || 0,
      }));
      const res = await fetch('/api/quickbooks?action=sync-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          realm_id: realmId,
          sales: formattedSales,
        }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setSyncResult({ type: 'sales', count: result.synced });
      setMessage(`✓ Synced ${result.synced} sales receipts to QuickBooks.`);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setStatus('idle');
  };

  return (
    <div style={{ padding: '24px', maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: sidebarColor }}>
        QuickBooks Integration
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>
        Sync your StockGuard sales and expenses with QuickBooks Online.
      </p>

      {/* Connection status */}
      <div style={{ background: connected ? '#f0fdf4' : '#f8fafc', border: `1px solid ${connected ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? green : '#94a3b8', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, color: sidebarColor, fontSize: 14 }}>
            {connected ? 'QuickBooks Connected' : 'Not Connected'}
          </p>
          {connected && realmId && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Company ID: {realmId}</p>
          )}
        </div>
        {connected ? (
          <button onClick={handleDisconnect} style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${red}`, background: '#fff', color: red, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Disconnect
          </button>
        ) : (
          <button onClick={handleConnect} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: sidebarColor, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Connect QuickBooks
          </button>
        )}
      </div>

      {/* Sync actions */}
      {connected && (
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: sidebarColor }}>Sync Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleSyncSales}
              disabled={status === 'syncing'}
              style={{ padding: '11px 24px', borderRadius: 8, border: 'none', background: status === 'syncing' ? '#94a3b8' : sidebarColor, color: '#fff', fontWeight: 600, fontSize: 14, cursor: status === 'syncing' ? 'not-allowed' : 'pointer' }}
            >
              {status === 'syncing' ? 'Syncing...' : 'Sync Sales → QuickBooks'}
            </button>
          </div>

          {message && (
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4', color: message.startsWith('Error') ? red : '#166534', fontSize: 13, fontWeight: 500 }}>
              {message}
            </div>
          )}

          {syncResult && (
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: 0, fontWeight: 600, color: sidebarColor, fontSize: 14 }}>Last sync results:</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#374151' }}>• {syncResult.count} {syncResult.type} records pushed to QuickBooks</p>
            </div>
          )}
        </div>
      )}

      {!connected && (
        <div style={{ marginTop: 8 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: sidebarColor }}>How to connect</h3>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
            <li>Click <strong>Connect QuickBooks</strong> above</li>
            <li>Sign in to your QuickBooks Online account</li>
            <li>Authorize StockGuard access</li>
            <li>You'll be redirected back here automatically</li>
          </ol>
        </div>
      )}
    </div>
  );
}
