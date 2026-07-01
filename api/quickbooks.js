const { URL } = require('url');

const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
const CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;
const REDIRECT_URI = 'https://app.getstockguard.com/api/quickbooks/callback';
const QB_BASE = 'https://appcenter.intuit.com/connect/oauth2';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const SCOPES = 'com.intuit.quickbooks.accounting';

module.exports = async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const action = searchParams.get('action') || pathname.split('/').pop();

  // --- CONNECT: redirect user to Intuit OAuth ---
  if (action === 'connect') {
    const state = Math.random().toString(36).substring(2);
    const authUrl = `${QB_BASE}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&state=${state}`;
    res.writeHead(302, { Location: authUrl });
    return res.end();
  }

  // --- CALLBACK: exchange code for tokens ---
  if (action === 'callback') {
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    if (!code || !realmId) {
      return res.status(400).json({ error: 'Missing code or realmId' });
    }
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) {
      return res.status(400).json({ error: tokens.error_description || tokens.error });
    }
    // Redirect back to app with tokens in query (app will store in localStorage)
    const appUrl = `https://app.getstockguard.com/?qb_access_token=${tokens.access_token}&qb_refresh_token=${tokens.refresh_token}&qb_realm_id=${realmId}`;
    res.writeHead(302, { Location: appUrl });
    return res.end();
  }

  // --- REFRESH: get new access token ---
  if (action === 'refresh') {
    const { refresh_token } = req.body || {};
    if (!refresh_token) return res.status(400).json({ error: 'Missing refresh_token' });
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });
    const tokens = await tokenRes.json();
    return res.status(200).json(tokens);
  }

  // --- SYNC SALES: push sales receipts to QB ---
  if (action === 'sync-sales') {
    const { access_token, realm_id, sales } = req.body || {};
    if (!access_token || !realm_id || !sales) {
      return res.status(400).json({ error: 'Missing access_token, realm_id, or sales' });
    }
    const results = [];
    for (const sale of sales) {
      const payload = {
        Line: [{
          Amount: sale.total,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: '1', name: sale.sku || 'Inventory Item' },
            Qty: sale.quantity,
            UnitPrice: sale.unit_price,
          },
        }],
        CustomerRef: { value: '1' },
      };
      const qbRes = await fetch(
        `https://quickbooks.api.intuit.com/v3/company/${realm_id}/salesreceipt`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await qbRes.json();
      console.log('QB sales receipt response:', JSON.stringify(result));
      results.push(result);
    }
    return res.status(200).json({ synced: results.length, results });
  }

  // --- STATUS: check if connected ---
  if (action === 'status') {
    return res.status(200).json({ ok: true, message: 'QuickBooks API online' });
  }

  return res.status(404).json({ error: 'Unknown action' });
};
